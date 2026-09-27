"use client";

import { Input } from "@/components/ui/input";

export const LIMIT_FIELDS: { key: string; label: string; group: string }[] = [
  {
    key: "max_whatsapp_messages_daily",
    label: "Mensajes WhatsApp / día",
    group: "WhatsApp",
  },
  {
    key: "max_whatsapp_messages_monthly",
    label: "Mensajes WhatsApp / mes",
    group: "WhatsApp",
  },
  {
    key: "max_whatsapp_outbound_daily",
    label: "Salientes / día",
    group: "WhatsApp",
  },
  {
    key: "max_whatsapp_outbound_monthly",
    label: "Salientes / mes",
    group: "WhatsApp",
  },
  {
    key: "max_whatsapp_templates_monthly",
    label: "Plantillas / mes",
    group: "WhatsApp",
  },
  {
    key: "max_whatsapp_media_monthly",
    label: "Multimedia / mes",
    group: "WhatsApp",
  },
  { key: "max_ai_tokens_daily", label: "Tokens IA / día", group: "IA" },
  { key: "max_ai_tokens_monthly", label: "Tokens IA / mes", group: "IA" },
  {
    key: "max_ai_executions_monthly",
    label: "Ejecuciones IA / mes",
    group: "IA",
  },
  {
    key: "max_ai_cost_micro_usd_monthly",
    label: "Costo IA / mes (micro-USD)",
    group: "IA",
  },
  { key: "max_users", label: "Usuarios", group: "Estructura" },
  { key: "max_inboxes", label: "Bandejas", group: "Estructura" },
  { key: "max_conversations", label: "Conversaciones", group: "Estructura" },
  { key: "max_contacts", label: "Contactos", group: "Estructura" },
  { key: "max_storage_mb", label: "Almacenamiento (MB)", group: "Estructura" },
];

export type LimitDraft = Record<string, string>;

const UNLIMITED = "ilimitado";

/** Convierte lo guardado a texto editable: vacío = no definido (hereda), `ilimitado` = null. */
export function limitsToDraft(
  limits: Record<string, unknown> | undefined,
): LimitDraft {
  const draft: LimitDraft = {};
  for (const { key } of LIMIT_FIELDS) {
    if (!limits || !(key in limits)) draft[key] = "";
    else draft[key] = limits[key] === null ? UNLIMITED : String(limits[key]);
  }
  return draft;
}

/** Texto editable -> payload. Devuelve `error` con el primer campo inválido. */
export function draftToLimits(draft: LimitDraft): {
  limits: Record<string, number | null>;
  error?: string;
} {
  const limits: Record<string, number | null> = {};
  for (const { key, label } of LIMIT_FIELDS) {
    const raw = (draft[key] ?? "").trim().toLowerCase();
    if (raw === "") continue;
    if (raw === UNLIMITED) {
      limits[key] = null;
    } else if (/^\d+$/.test(raw)) {
      limits[key] = Number(raw);
    } else {
      return { limits, error: `${label}: usa un entero ≥ 0 o «${UNLIMITED}».` };
    }
  }
  return { limits };
}

export function LimitsEditor({
  draft,
  onChange,
  emptyMeaning,
}: {
  draft: LimitDraft;
  onChange: (draft: LimitDraft) => void;
  emptyMeaning: string;
}) {
  const groups = Array.from(new Set(LIMIT_FIELDS.map((f) => f.group)));
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Vacío = {emptyMeaning}. «{UNLIMITED}» = sin límite.{" "}
        <strong>0 bloquea de inmediato</strong>.
      </p>
      {groups.map((group) => (
        <fieldset key={group}>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {group}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {LIMIT_FIELDS.filter((f) => f.group === group).map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs text-zinc-600 dark:text-zinc-400">
                  {field.label}
                </label>
                <Input
                  value={draft[field.key] ?? ""}
                  onChange={(event) =>
                    onChange({ ...draft, [field.key]: event.target.value })
                  }
                  placeholder="—"
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
