/**
 * Ficha del cliente: convierte lo que el bot recopiló en filas legibles.
 *
 * Dónde queda cada dato (ver `bot_tools.py` del backend):
 *  - `contact.name` y `contact.email` → columnas del contacto.
 *  - `lead.metadata` → `lead.metadata.fields[clave]`.
 * Qué datos debe reunir el bot lo define su configuración (`required_fields`). Los datos guardados que
 * ya no figuran allí (se quitó el campo después) se muestran aparte, como «Otros datos», para no perderlos.
 */

export type FieldTarget = "lead.metadata" | "contact.name" | "contact.email";

export interface FieldDef {
  key: string;
  label: string;
  target: FieldTarget;
  required: boolean;
}

export interface SummaryRow {
  key: string;
  label: string;
  /** `null` = el bot todavía no lo recopiló */
  value: string | null;
  required: boolean;
  /** dato guardado que ya no está en la configuración del bot */
  extra: boolean;
}

const TARGETS: readonly string[] = [
  "lead.metadata",
  "contact.name",
  "contact.email",
];

/** La configuración llega como JSON libre: se descarta lo que no tenga la forma esperada. */
export function parseFieldDefs(raw: unknown): FieldDef[] {
  if (!Array.isArray(raw)) return [];
  const defs: FieldDef[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const f = item as Record<string, unknown>;
    if (typeof f.key !== "string" || !f.key) continue;
    defs.push({
      key: f.key,
      label: typeof f.label === "string" && f.label ? f.label : f.key,
      target: TARGETS.includes(f.target as string)
        ? (f.target as FieldTarget)
        : "lead.metadata",
      required: f.required === true,
    });
  }
  return defs;
}

/** Texto para mostrar; `null` si no hay dato (vacío, en blanco o indefinido). */
export function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number")
    return Number.isFinite(value) ? String(value) : null;
  if (typeof value === "string")
    return value.trim() === "" ? null : value.trim();
  if (Array.isArray(value)) {
    const parts = value.map(formatValue).filter((v): v is string => v !== null);
    return parts.length ? parts.join(", ") : null;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export function leadFieldsOf(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const fields = metadata?.fields;
  return typeof fields === "object" && fields !== null && !Array.isArray(fields)
    ? (fields as Record<string, unknown>)
    : {};
}

export function buildSummaryRows(
  defs: FieldDef[],
  contact: { name: string | null; email: string | null },
  leadFields: Record<string, unknown>,
): SummaryRow[] {
  const rows: SummaryRow[] = defs.map((def) => {
    const raw =
      def.target === "contact.name"
        ? contact.name
        : def.target === "contact.email"
          ? contact.email
          : leadFields[def.key];
    return {
      key: def.key,
      label: def.label,
      value: formatValue(raw),
      required: def.required,
      extra: false,
    };
  });
  const declared = new Set(defs.map((d) => d.key));
  for (const [key, raw] of Object.entries(leadFields)) {
    const value = formatValue(raw);
    if (declared.has(key) || value === null) continue;
    rows.push({ key, label: key, value, required: false, extra: true });
  }
  return rows;
}

/** Avance sobre los datos OBLIGATORIOS (los que califican al lead cuando están completos). */
export function requiredProgress(rows: SummaryRow[]): {
  done: number;
  total: number;
} {
  const required = rows.filter((r) => r.required && !r.extra);
  return {
    done: required.filter((r) => r.value !== null).length,
    total: required.length,
  };
}

/** Resumen en texto plano, para copiarlo y pegarlo (correo, otro sistema, un mensaje al equipo). */
export function summaryText(input: {
  name: string | null;
  phone: string;
  email: string | null;
  rows: SummaryRow[];
  stage?: string | null;
}): string {
  const lines = [
    `Cliente: ${input.name ?? "Sin nombre"}`,
    `Teléfono: ${input.phone}`,
  ];
  if (input.email) lines.push(`Correo: ${input.email}`);
  if (input.stage) lines.push(`Etapa: ${input.stage}`);
  for (const row of input.rows) {
    lines.push(`${row.label}: ${row.value ?? "(pendiente)"}`);
  }
  return lines.join("\n");
}
