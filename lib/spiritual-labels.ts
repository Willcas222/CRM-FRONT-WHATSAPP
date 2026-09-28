import type { ConsultationStatus } from "@/lib/hooks/spiritual";

export const CONSULTATION_STATUSES: ConsultationStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const CONSULTATION_STATUS_LABEL: Record<ConsultationStatus, string> = {
  DRAFT: "Nueva",
  SCHEDULED: "Agendada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const CONSULTATION_STATUS_TONE: Record<
  ConsultationStatus,
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  DRAFT: "amber",
  SCHEDULED: "blue",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "neutral",
};
