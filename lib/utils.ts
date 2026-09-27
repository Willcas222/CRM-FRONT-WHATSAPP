import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
});
const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });
const relativeFormatter = new Intl.RelativeTimeFormat("es", {
  numeric: "auto",
});

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(iso));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** «hace 3 minutos», «en 2 días»… para listas (mensajes, notificaciones). */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return relativeFormatter.format(
        Math.round(diffSeconds / secondsInUnit),
        unit,
      );
    }
  }
  return "hace un momento";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const numberFormatter = new Intl.NumberFormat("es-CO");
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

export function formatNumber(value: number | null | undefined): string {
  return value == null ? "—" : numberFormatter.format(value);
}

/** El backend serializa los `Decimal` como texto: se formatea sin pasar por aritmética de flotantes. */
export function formatUsd(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? usdFormatter.format(n) : "—";
}

const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "numeric",
  minute: "2-digit",
});

/** Solo la hora («4:17 p. m.»): la que va dentro de la burbuja del chat. */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return timeFormatter.format(new Date(iso));
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

const longDayFormatter = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** «Hoy», «Ayer» o el día completo: separador entre grupos de mensajes. */
export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  const label = longDayFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Clave estable del día local, para agrupar mensajes. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
