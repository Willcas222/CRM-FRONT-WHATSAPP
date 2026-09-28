"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
  Spinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import {
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useProducts,
  type CategoryOut,
} from "@/lib/hooks/restaurant";
import { useRequireRetailVertical } from "./require-catalog";

/** Vertical Comercio/Tienda (Fase 13): mismos hooks y componentes que `/menu` (ARCHITECTURE.md
 * 11.8) — es el mismo motor de catálogo y pedidos de Restaurante, solo con otro nombre de
 * pantalla y otro texto. Cualquier cambio de comportamiento debe hacerse en los dos lugares. */
export default function CatalogPage() {
  const isRetail = useRequireRetailVertical();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);

  if (!isRetail) return <FullPageSpinner />;

  const isLoading = loadingCategories || loadingProducts;
  const sortedCategories = [...(categories?.items ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="catalog"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Catálogo
        </PageTitle>
        {canManage && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCreatingCategory(true)}>
              Nueva categoría
            </Button>
            <Button size="sm" onClick={() => setCreatingProduct(true)}>
              Nuevo artículo
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : sortedCategories.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin categorías todavía"
            description="Crea la primera para empezar a armar el catálogo."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <Card key={category.id} className="p-4">
              <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {category.name}
              </h2>
              {(() => {
                const items = (products?.items ?? []).filter(
                  (p) => p.category_id === category.id,
                );
                if (items.length === 0) {
                  return (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Sin artículos en esta categoría.
                    </p>
                  );
                }
                return (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/catalog/products/${product.id}`}
                          className="flex items-center justify-between gap-3 py-2 hover:opacity-75"
                        >
                          <span className="text-sm text-zinc-800 dark:text-zinc-200">
                            {product.name}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                              ${product.price}
                            </span>
                            {!product.is_available && (
                              <Badge tone="neutral">No disponible</Badge>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </Card>
          ))}
        </div>
      )}

      {creatingCategory && (
        <CreateCategoryModal onClose={() => setCreatingCategory(false)} />
      )}
      {creatingProduct && (
        <CreateProductModal
          categories={sortedCategories}
          onClose={() => setCreatingProduct(false)}
        />
      )}
    </div>
  );
}

const categorySchema = z.object({ name: z.string().min(1, "Ingresa un nombre.").max(150) });
type CategoryFormValues = z.infer<typeof categorySchema>;

function CreateCategoryModal({ onClose }: { onClose: () => void }) {
  const create = useCreateCategory();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  async function onSubmit(values: CategoryFormValues) {
    setError(null);
    try {
      await create.mutateAsync({ name: values.name, order_index: 0 });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva categoría">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Crear
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const productSchema = z.object({
  category_id: z.string().min(1, "Selecciona una categoría."),
  name: z.string().min(1, "Ingresa un nombre.").max(150),
  price: z.string().min(1, "Ingresa un precio."),
  description: z.string().max(2000).optional(),
});
type ProductFormValues = z.infer<typeof productSchema>;

function CreateProductModal({
  categories,
  onClose,
}: {
  categories: CategoryOut[];
  onClose: () => void;
}) {
  const create = useCreateProduct();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  async function onSubmit(values: ProductFormValues) {
    setError(null);
    try {
      await create.mutateAsync({
        category_id: values.category_id,
        name: values.name,
        price: values.price,
        description: values.description || null,
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo artículo">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="category_id">Categoría</Label>
          <Select
            id="category_id"
            error={errors.category_id?.message}
            {...register("category_id")}
          >
            <option value="">Selecciona…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            error={errors.price?.message}
            {...register("price")}
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Crear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
