import type {
  DeliveryStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/hooks/restaurant";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  READY: "Listo",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  PENDING: "amber",
  CONFIRMED: "blue",
  PREPARING: "blue",
  READY: "green",
  DELIVERED: "green",
  CANCELLED: "neutral",
};

export const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "CARD", "TRANSFER", "OTHER"];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
};

export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PAID", "REFUNDED", "FAILED"];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
  FAILED: "Fallido",
};

export const DELIVERY_STATUSES: DeliveryStatus[] = [
  "PENDING",
  "ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
];

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Pendiente",
  ASSIGNED: "Asignado",
  IN_TRANSIT: "En camino",
  DELIVERED: "Entregado",
  FAILED: "Fallido",
};
