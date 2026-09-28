"use client";

/** Vertical Comercio/Tienda (Fase 13): copia de `/menu/products/[id]` con el nombre de pantalla de
 * Comercio (ARCHITECTURE.md 11.8) — mismos hooks, mismo motor. Cualquier cambio de comportamiento
 * debe hacerse en los dos lugares. */
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";
import {
  useCreateModifier,
  useCreateModifierOption,
  useCreateProductVariant,
  useModifierOptions,
  useModifiers,
  useProduct,
  useProductVariants,
  useUpdateProduct,
  type ModifierOut,
} from "@/lib/hooks/restaurant";
import { useRequireRetailVertical } from "../../require-catalog";

export default function ProductDetailPage() {
  const isRetail = useRequireRetailVertical();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const product = useProduct(id);

  if (!isRetail || product.isLoading) return <FullPageSpinner />;
  if (product.error || !product.data) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <ErrorBanner message="No se encontró el artículo." />
        <Link href="/catalog" className="mt-4 inline-block text-sm text-emerald-700 dark:text-emerald-400">
          ← Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link href="/catalog" className="text-sm text-emerald-700 dark:text-emerald-400">
        ← Catálogo
      </Link>
      <div className="mt-2 mb-6 space-y-6">
        <ProductInfo productId={id} canManage={canManage} />
        <VariantsSection productId={id} canManage={canManage} />
        <ModifiersSection productId={id} canManage={canManage} />
      </div>
    </div>
  );
}

const productSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre.").max(150),
  price: z.string().min(1, "Ingresa un precio."),
  description: z.string().max(2000).optional(),
  is_available: z.boolean(),
});
type ProductFormValues = z.infer<typeof productSchema>;

function ProductInfo({ productId, canManage }: { productId: string; canManage: boolean }) {
  const product = useProduct(productId);
  const update = useUpdateProduct(productId);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (product.data) {
      reset({
        name: product.data.name,
        price: product.data.price,
        description: product.data.description ?? "",
        is_available: product.data.is_available,
      });
    }
  }, [product.data, reset]);

  async function onSubmit(values: ProductFormValues) {
    setError(null);
    try {
      await update.mutateAsync({
        name: values.name,
        price: values.price,
        description: values.description || null,
        is_available: values.is_available,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {product.data?.name}
        </h1>
        {product.data && (
          <Badge tone={product.data.is_available ? "green" : "neutral"}>
            {product.data.is_available ? "Disponible" : "No disponible"}
          </Badge>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              disabled={!canManage}
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              disabled={!canManage}
              error={errors.price?.message}
              {...register("price")}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={3} disabled={!canManage} {...register("description")} />
        </div>
        {canManage && (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_available")} />
              Disponible
            </label>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Guardar
            </Button>
          </>
        )}
      </form>
    </Card>
  );
}

const nameAndDeltaSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre.").max(150),
  price_delta: z.string().min(1, "Ingresa un valor (puede ser 0)."),
});
type NameAndDeltaValues = z.infer<typeof nameAndDeltaSchema>;

function VariantsSection({ productId, canManage }: { productId: string; canManage: boolean }) {
  const variants = useProductVariants(productId);
  const create = useCreateProductVariant(productId);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NameAndDeltaValues>({
    resolver: zodResolver(nameAndDeltaSchema),
    defaultValues: { price_delta: "0" },
  });

  async function onSubmit(values: NameAndDeltaValues) {
    setError(null);
    try {
      await create.mutateAsync({ name: values.name, price_delta: values.price_delta });
      reset({ name: "", price_delta: "0" });
      setCreating(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Variantes (talla, color… reemplazan el precio base)
        </h2>
        {canManage && !creating && (
          <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
            Nueva variante
          </Button>
        )}
      </div>
      {!variants.data || variants.data.items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin variantes.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {variants.data.items.map((v) => (
            <li key={v.id} className="flex justify-between text-zinc-700 dark:text-zinc-300">
              <span>{v.name}</span>
              <span className="text-zinc-500">${v.price_delta}</span>
            </li>
          ))}
        </ul>
      )}
      {creating && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          {error && <ErrorBanner message={error} />}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="v-name">Nombre</Label>
              <Input id="v-name" error={errors.name?.message} {...register("name")} />
            </div>
            <div>
              <Label htmlFor="v-delta">Precio (reemplaza al base)</Label>
              <Input
                id="v-delta"
                type="number"
                step="0.01"
                error={errors.price_delta?.message}
                {...register("price_delta")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Crear
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

const modifierSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre.").max(150),
  min_select: z.coerce.number().int().min(0),
  max_select: z.coerce.number().int().min(1),
});
type ModifierFormValues = z.infer<typeof modifierSchema>;

function ModifiersSection({ productId, canManage }: { productId: string; canManage: boolean }) {
  const modifiers = useModifiers(productId);
  const create = useCreateModifier(productId);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModifierFormValues>({
    resolver: zodResolver(modifierSchema) as Resolver<ModifierFormValues>,
    defaultValues: { min_select: 0, max_select: 1 },
  });

  async function onSubmit(values: ModifierFormValues) {
    setError(null);
    try {
      await create.mutateAsync(values);
      reset({ name: "", min_select: 0, max_select: 1 });
      setCreating(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Modificadores (personalización)
        </h2>
        {canManage && !creating && (
          <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
            Nuevo modificador
          </Button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 space-y-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          {error && <ErrorBanner message={error} />}
          <div>
            <Label htmlFor="m-name">Nombre (por ejemplo «Grabado»)</Label>
            <Input id="m-name" error={errors.name?.message} {...register("name")} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="m-min">Mínimo a elegir</Label>
              <Input
                id="m-min"
                type="number"
                error={errors.min_select?.message}
                {...register("min_select")}
              />
            </div>
            <div>
              <Label htmlFor="m-max">Máximo a elegir</Label>
              <Input
                id="m-max"
                type="number"
                error={errors.max_select?.message}
                {...register("max_select")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Crear
            </Button>
          </div>
        </form>
      )}

      {!modifiers.data || modifiers.data.items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Sin modificadores.</p>
      ) : (
        <div className="space-y-4">
          {modifiers.data.items.map((modifier) => (
            <ModifierRow key={modifier.id} modifier={modifier} canManage={canManage} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ModifierRow({ modifier, canManage }: { modifier: ModifierOut; canManage: boolean }) {
  const options = useModifierOptions(modifier.id);
  const create = useCreateModifierOption(modifier.id);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NameAndDeltaValues>({
    resolver: zodResolver(nameAndDeltaSchema),
    defaultValues: { price_delta: "0" },
  });

  async function onSubmit(values: NameAndDeltaValues) {
    setError(null);
    try {
      await create.mutateAsync({ name: values.name, price_delta: values.price_delta });
      reset({ name: "", price_delta: "0" });
      setCreating(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {modifier.name}{" "}
          <span className="font-normal text-zinc-500">
            ({modifier.min_select}–{modifier.max_select})
          </span>
        </p>
        {canManage && !creating && (
          <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
            Nueva opción
          </Button>
        )}
      </div>
      {options.data && options.data.items.length > 0 && (
        <ul className="mt-1 space-y-1 pl-4 text-sm text-zinc-600 dark:text-zinc-400">
          {options.data.items.map((o) => (
            <li key={o.id} className="flex justify-between">
              <span>{o.name}</span>
              <span>${o.price_delta}</span>
            </li>
          ))}
        </ul>
      )}
      {creating && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-2 pl-4">
          {error && <ErrorBanner message={error} />}
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Nombre" error={errors.name?.message} {...register("name")} />
            <Input
              type="number"
              step="0.01"
              placeholder="Recargo"
              error={errors.price_delta?.message}
              {...register("price_delta")}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting}>
              Crear
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
