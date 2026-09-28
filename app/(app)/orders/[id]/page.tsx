"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useContact } from "@/lib/hooks/contacts";
import {
  useChangeOrderStatus,
  useOrder,
  useOrderHistory,
  useRecordOrderPayment,
  useSetOrderDelivery,
  type DeliveryStatus,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/hooks/restaurant";
import {
  DELIVERY_STATUS_LABEL,
  DELIVERY_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHODS,
} from "@/lib/restaurant-labels";
import { formatDateTime } from "@/lib/utils";
import { useRequireOrdersVertical } from "../require-orders";

export default function OrderDetailPage() {
  const canSeeOrders = useRequireOrdersVertical();
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const history = useOrderHistory(id);
  const contact = useContact(order.data?.contact_id);

  if (!canSeeOrders || order.isLoading) return <FullPageSpinner />;
  if (order.error || !order.data) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <ErrorBanner message="No se encontró el pedido." />
        <Link href="/orders" className="mt-4 inline-block text-sm text-emerald-700 dark:text-emerald-400">
          ← Volver a pedidos
        </Link>
      </div>
    );
  }

  const data = order.data;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link href="/orders" className="text-sm text-emerald-700 dark:text-emerald-400">
        ← Pedidos
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {contact.data ? (
              <Link href={`/contacts/${contact.data.id}`} className="hover:underline">
                {contact.data.name || contact.data.phone}
              </Link>
            ) : (
              "…"
            )}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDateTime(data.created_at)}
          </p>
        </div>
        <Badge tone={ORDER_STATUS_TONE[data.status]}>{ORDER_STATUS_LABEL[data.status]}</Badge>
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ítems</h2>
          <ul className="space-y-2 text-sm">
            {data.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}× {item.product_name}
                  {item.variant_name ? ` (${item.variant_name})` : ""}
                  {item.modifier_options.length > 0
                    ? ` + ${item.modifier_options.map((m) => m.name).join(", ")}`
                    : ""}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">${item.subtotal}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-800">
            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>${data.subtotal}</span>
            </div>
            {Number(data.delivery_fee) > 0 && (
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Domicilio</span>
                <span>${data.delivery_fee}</span>
              </div>
            )}
            {Number(data.discount) > 0 && (
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Descuento</span>
                <span>-${data.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-zinc-900 dark:text-zinc-100">
              <span>Total</span>
              <span>${data.total}</span>
            </div>
          </div>
          {data.notes && (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Notas: {data.notes}
            </p>
          )}
        </Card>

        <StatusChanger orderId={data.id} currentStatus={data.status} />
        <PaymentsCard orderId={data.id} payments={data.payments} />
        <DeliveryCard orderId={data.id} delivery={data.delivery} />

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Historial
          </h2>
          {history.isLoading ? (
            <p className="text-sm text-zinc-400">Cargando…</p>
          ) : !history.data || history.data.items.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin cambios todavía.</p>
          ) : (
            <ul className="space-y-3">
              {history.data.items.map((event, i) => (
                <li key={i} className="text-sm">
                  <p className="text-zinc-800 dark:text-zinc-200">
                    {event.previous_status
                      ? `${ORDER_STATUS_LABEL[event.previous_status]} → `
                      : ""}
                    <strong>{ORDER_STATUS_LABEL[event.new_status]}</strong>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(event.created_at)}
                    {event.reason ? ` · ${event.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusChanger({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const mutation = useChangeOrderStatus(orderId);
  const [target, setTarget] = useState<OrderStatus | "">("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange() {
    if (!target) return;
    setError(null);
    try {
      await mutation.mutateAsync({ status: target });
      setTarget("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cambiar estado</h2>
      {error && <ErrorBanner message={error} />}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="new-status">Nuevo estado</Label>
          <Select
            id="new-status"
            value={target}
            onChange={(e) => setTarget(e.target.value as OrderStatus | "")}
          >
            <option value="">Selecciona…</option>
            {ORDER_STATUSES.filter((s) => s !== currentStatus).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button disabled={!target} loading={mutation.isPending} onClick={handleChange}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}

function PaymentsCard({
  orderId,
  payments,
}: {
  orderId: string;
  payments: { id: string; method: PaymentMethod; amount: string; status: string }[];
}) {
  const mutation = useRecordOrderPayment(orderId);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!amount) {
      setError("Ingresa un monto.");
      return;
    }
    try {
      await mutation.mutateAsync({ method, amount });
      setAmount("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar el pago.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pagos</h2>
      {error && <ErrorBanner message={error} />}
      {payments.length > 0 && (
        <ul className="space-y-1 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between text-zinc-700 dark:text-zinc-300">
              <span>{PAYMENT_METHOD_LABEL[p.method]}</span>
              <span>${p.amount}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-2">
        <div className="w-40">
          <Label htmlFor="pay-method">Método</Label>
          <Select
            id="pay-method"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_METHOD_LABEL[m]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="pay-amount">Monto</Label>
          <Input
            id="pay-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button loading={mutation.isPending} onClick={submit}>
          Registrar
        </Button>
      </div>
    </Card>
  );
}

function DeliveryCard({
  orderId,
  delivery,
}: {
  orderId: string;
  delivery: { address: string; zone: string | null; status: DeliveryStatus } | null;
}) {
  const mutation = useSetOrderDelivery(orderId);
  const [address, setAddress] = useState(delivery?.address ?? "");
  const [zone, setZone] = useState(delivery?.zone ?? "");
  const [status, setStatus] = useState<DeliveryStatus>(delivery?.status ?? "PENDING");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!address) {
      setError("Ingresa una dirección.");
      return;
    }
    try {
      await mutation.mutateAsync({ address, zone: zone || null, status });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar el domicilio.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Domicilio</h2>
      {error && <ErrorBanner message={error} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="d-address">Dirección</Label>
          <Input id="d-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="d-zone">Zona (opcional)</Label>
          <Input id="d-zone" value={zone} onChange={(e) => setZone(e.target.value)} />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="d-status">Estado</Label>
          <Select
            id="d-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
          >
            {DELIVERY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {DELIVERY_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button loading={mutation.isPending} onClick={submit}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}
