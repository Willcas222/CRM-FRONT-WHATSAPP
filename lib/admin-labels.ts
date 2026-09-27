import type { components } from "@/lib/api-schema";

export type AccountStatus = components["schemas"]["AccountStatus"];

export const ACCOUNT_STATUSES: AccountStatus[] = [
  "ACTIVE",
  "PENDING_SETUP",
  "PAYMENT_FAILED",
  "PAUSED_BY_LIMIT",
  "INACTIVE",
  "SUSPENDED",
  "FROZEN",
  "DELETED",
];

export const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Activa",
  PENDING_SETUP: "Pendiente de configuración",
  PAYMENT_FAILED: "Pago fallido",
  PAUSED_BY_LIMIT: "Pausada por límite",
  INACTIVE: "Inactiva",
  SUSPENDED: "Suspendida",
  FROZEN: "Congelada",
  DELETED: "Eliminada",
};

export const STATUS_TONE: Record<
  AccountStatus,
  "green" | "amber" | "red" | "neutral"
> = {
  ACTIVE: "green",
  PENDING_SETUP: "amber",
  PAYMENT_FAILED: "amber",
  PAUSED_BY_LIMIT: "amber",
  INACTIVE: "neutral",
  SUSPENDED: "red",
  FROZEN: "red",
  DELETED: "neutral",
};

/** Cualquier estado distinto de ACTIVE bloquea a la organización (el backend falla cerrado). */
export const BLOCKING_WARNING =
  "La organización perderá el acceso operativo: sus usuarios no podrán operar mientras el estado no sea Activa.";
