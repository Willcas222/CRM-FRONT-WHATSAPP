"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
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
import { useContacts, useContactsLookup } from "@/lib/hooks/contacts";
import {
  useCreateOrder,
  useModifierOptions,
  useModifiers,
  useOrders,
  useProductVariants,
  useProducts,
  type OrderStatus,
} from "@/lib/hooks/restaurant";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, ORDER_STATUSES } from "@/lib/restaurant-labels";
import { formatDateTime } from "@/lib/utils";
import { useRequireRestaurantVertical } from "../menu/require-menu";

export default function OrdersPage() {
  const isRestaurant = useRequireRestaurantVertical();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useOrders({ status: status || undefined });
  const contactsById = useContactsLookup().data;

  if (!isRestaurant) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="orders"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Pedidos
        </PageTitle>
        <Button onClick={() => setCreateOpen(true)}>Nuevo pedido</Button>
      </div>

      <div className="mb-4 w-48">
        <Select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin pedidos"
            description="Aquí aparecerán los pedidos que registre el bot o tu equipo."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {contactsById?.get(order.contact_id)?.name ||
                        contactsById?.get(order.contact_id)?.phone ||
                        "…"}{" "}
                      · ${order.total}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "ítem" : "ítems"} ·{" "}
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                  <Badge tone={ORDER_STATUS_TONE[order.status]}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {createOpen && <CreateOrderModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

interface DraftItem {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  modifierOptionIds: string[];
  modifierNames: string[];
  quantity: number;
}

function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useCreateOrder();
  const [contactQuery, setContactQuery] = useState("");
  const { data: contacts } = useContacts(contactQuery);
  const [contactId, setContactId] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    if (!contactId) {
      setError("Selecciona un contacto.");
      return;
    }
    if (items.length === 0) {
      setError("Agrega al menos un ítem.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await create.mutateAsync({
        contact_id: contactId,
        items: items.map((i) => ({
          product_id: i.productId,
          variant_id: i.variantId,
          modifier_option_ids: i.modifierOptionIds,
          quantity: i.quantity,
        })),
      });
      onClose();
      router.push(`/orders/${order.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo pedido">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="contact_search">Contacto</Label>
          <Input
            id="contact_search"
            placeholder="Buscar contacto…"
            value={contactQuery}
            onChange={(e) => setContactQuery(e.target.value)}
            className="mb-2"
          />
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">Selecciona…</option>
            {contacts?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.phone}
              </option>
            ))}
          </Select>
        </div>

        {items.length > 0 && (
          <ul className="space-y-1 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800/50">
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>
                  {item.quantity}× {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ""}
                  {item.modifierNames.length > 0 ? ` + ${item.modifierNames.join(", ")}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <AddItemForm onAdd={(item) => setItems([...items, item])} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" loading={submitting} onClick={submit}>
            Registrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function AddItemForm({ onAdd }: { onAdd: (item: DraftItem) => void }) {
  const { data: products } = useProducts();
  const available = (products?.items ?? []).filter((p) => p.is_available);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const variants = useProductVariants(productId || undefined);
  const modifiers = useModifiers(productId || undefined);

  const product = available.find((p) => p.id === productId);

  function reset() {
    setProductId("");
    setVariantId("");
    setSelectedOptions([]);
    setQuantity(1);
  }

  function add() {
    if (!product) return;
    const variant = variants.data?.items.find((v) => v.id === variantId);
    onAdd({
      productId: product.id,
      productName: product.name,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      modifierOptionIds: selectedOptions,
      modifierNames: [], // se muestran por id; suficiente para revisar antes de enviar
      quantity,
    });
    reset();
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <div>
        <Label htmlFor="add-product">Producto</Label>
        <Select
          id="add-product"
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            setVariantId("");
            setSelectedOptions([]);
          }}
        >
          <option value="">Selecciona…</option>
          {available.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · ${p.price}
            </option>
          ))}
        </Select>
      </div>

      {productId && variants.data && variants.data.items.length > 0 && (
        <div>
          <Label htmlFor="add-variant">Variante</Label>
          <Select id="add-variant" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
            <option value="">Ninguna</option>
            {variants.data.items.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {productId &&
        modifiers.data?.items.map((modifier) => (
          <ModifierOptionsPicker
            key={modifier.id}
            modifierId={modifier.id}
            modifierName={modifier.name}
            selected={selectedOptions}
            onChange={setSelectedOptions}
          />
        ))}

      <div className="flex items-end gap-3">
        <div className="w-24">
          <Label htmlFor="add-quantity">Cantidad</Label>
          <Input
            id="add-quantity"
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </div>
        <Button type="button" size="sm" disabled={!productId} onClick={add}>
          Agregar ítem
        </Button>
      </div>
    </div>
  );
}

function ModifierOptionsPicker({
  modifierId,
  modifierName,
  selected,
  onChange,
}: {
  modifierId: string;
  modifierName: string;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const options = useModifierOptions(modifierId);
  if (!options.data || options.data.items.length === 0) return null;

  return (
    <fieldset>
      <legend className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {modifierName}
      </legend>
      <div className="flex flex-wrap gap-3">
        {options.data.items.map((option) => (
          <label key={option.id} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, option.id]
                    : selected.filter((id) => id !== option.id),
                )
              }
            />
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
