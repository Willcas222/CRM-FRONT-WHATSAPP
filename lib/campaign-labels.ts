import type { CitizenRequestStatus, CitizenRequestType } from "@/lib/hooks/campaign";

export const CITIZEN_REQUEST_TYPES: CitizenRequestType[] = [
  "COMPLAINT",
  "CLAIM",
  "IDEA",
  "REQUEST",
  "HELP",
  "MEETING_REQUEST",
  "OTHER",
];

export const CITIZEN_REQUEST_TYPE_LABEL: Record<CitizenRequestType, string> = {
  COMPLAINT: "Queja",
  CLAIM: "Reclamo",
  IDEA: "Idea",
  REQUEST: "Petición",
  HELP: "Ayuda",
  MEETING_REQUEST: "Solicitud de reunión",
  OTHER: "Otro",
};

export const CITIZEN_REQUEST_STATUSES: CitizenRequestStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export const CITIZEN_REQUEST_STATUS_LABEL: Record<CitizenRequestStatus, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En trámite",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
};

export const CITIZEN_REQUEST_STATUS_TONE: Record<
  CitizenRequestStatus,
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  OPEN: "amber",
  IN_PROGRESS: "blue",
  RESOLVED: "green",
  CLOSED: "neutral",
};
