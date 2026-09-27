"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { HelpButton } from "@/components/help/help-button";
import { Badge } from "@/components/ui/misc";
import type { components } from "@/lib/api-schema";
import { useBots } from "@/lib/hooks/bots";
import { useAiSummary } from "@/lib/hooks/conversations";
import { usePipelines } from "@/lib/hooks/pipelines";
import {
  buildSummaryRows,
  leadFieldsOf,
  parseFieldDefs,
  requiredProgress,
  summaryText,
} from "@/lib/lead-summary";
import { cn, formatDateTime, formatRelative } from "@/lib/utils";

type ConversationDetail = components["schemas"]["ConversationDetailOut"];

const LEAD_STATUS_LABELS: Record<string, string> = {
  BOT_ACTIVE: "Atendido por el bot",
  HUMAN_PENDING: "Espera a una persona",
  HUMAN_ASSIGNED: "Con un agente",
  CLOSED_WON: "Ganado",
  CLOSED_LOST: "Perdido",
};

const SOURCE_LABELS: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  MANUAL: "Manual",
  AUTOMATION: "Automatización",
  API: "API",
};

/**
 * Ficha del cliente: lo que el bot reunió y lo que aún falta, sin tener que leer el chat.
 * En pantallas grandes es una columna fija junto a la conversación; en las pequeñas se abre encima.
 */
export function CustomerSummary({
  conversation,
  open,
  onClose,
}: {
  conversation: ConversationDetail;
  open: boolean;
  onClose: () => void;
}) {
  const { data: bots } = useBots();
  const { data: pipelines } = usePipelines();
  const [copied, setCopied] = useState(false);
  const aiSummary = useAiSummary(conversation.id);

  const { contact, lead } = conversation;
  const bot = bots?.items.find((b) => b.inbox_id === conversation.inbox?.id);
  const defs = useMemo(
    () => parseFieldDefs(bot?.required_fields),
    [bot?.required_fields],
  );
  const rows = useMemo(
    () => buildSummaryRows(defs, contact, leadFieldsOf(lead?.metadata)),
    [defs, contact, lead?.metadata],
  );
  const progress = requiredProgress(rows);
  const stage = pipelines?.items
    .find((p) => p.id === lead?.pipeline_id)
    ?.stages.find((s) => s.id === lead?.stage_id);
  const pending = rows.filter((r) => r.value === null);
  const complete = progress.total > 0 && progress.done === progress.total;

  async function copy() {
    const text = summaryText({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      rows,
      stage: stage?.name,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles (p. ej. HTTP): no hay nada más que hacer sin ensuciar la pantalla
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity 2xl:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Ficha del cliente"
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-[min(22rem,92vw)] flex-col overflow-y-auto border-l border-zinc-200 bg-white transition-transform duration-200",
          "2xl:static 2xl:z-auto 2xl:w-80 2xl:shrink-0 2xl:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Ficha del cliente
            </h3>
            <HelpButton topic="customer-summary" />
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar la ficha"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 2xl:hidden dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-4">
          <section>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {contact.name || "Sin nombre"}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {contact.phone}
            </p>
            {contact.email && (
              <p className="truncate text-sm text-zinc-600 dark:text-zinc-300">
                {contact.email}
              </p>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Datos recopilados
              </h4>
              {progress.total > 0 && (
                <Badge tone={complete ? "green" : "amber"}>
                  {progress.done} de {progress.total}
                </Badge>
              )}
            </div>

            {progress.total > 0 && (
              <div
                className="mb-3 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.done}
                aria-label="Datos obligatorios recopilados"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    complete ? "bg-emerald-500" : "bg-amber-400",
                  )}
                  style={{
                    width: `${(progress.done / progress.total) * 100}%`,
                  }}
                />
              </div>
            )}

            {rows.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                El bot de este canal no tiene datos por reunir. Puedes
                definirlos en Configuración → Bot.
              </p>
            ) : (
              <dl className="space-y-3">
                {rows.map((row) => (
                  <div key={row.key}>
                    <dt className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {row.label}
                      {row.required && <span title="Obligatorio">*</span>}
                      {row.extra && <span className="italic">(otro dato)</span>}
                    </dt>
                    <dd
                      className={cn(
                        "break-words text-sm",
                        row.value === null
                          ? "italic text-amber-600 dark:text-amber-400"
                          : "font-medium text-zinc-900 dark:text-zinc-100",
                      )}
                    >
                      {row.value ?? "Pendiente"}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {complete && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                Ya está todo lo obligatorio
                {lead?.qualified_at
                  ? ` · calificado ${formatRelative(lead.qualified_at)}`
                  : ""}
                .
              </p>
            )}
            {!complete && pending.some((r) => r.required) && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                Falta:{" "}
                {pending
                  .filter((r) => r.required)
                  .map((r) => r.label)
                  .join(", ")}
                .
              </p>
            )}

            <button
              onClick={() => aiSummary.mutate()}
              disabled={aiSummary.isPending}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {aiSummary.isPending
                ? "Redactando resumen…"
                : aiSummary.data
                  ? "Volver a resumir con IA"
                  : "Resumir con IA"}
            </button>
            {aiSummary.data && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-zinc-800 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-zinc-100">
                <p className="whitespace-pre-line break-words">
                  {aiSummary.data.summary}
                </p>
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Basado en los últimos {aiSummary.data.messages_considered}{" "}
                  mensajes · {formatRelative(aiSummary.data.generated_at)}. La
                  IA puede equivocarse: confírmalo en el chat.
                </p>
              </div>
            )}
            {aiSummary.isError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {aiSummary.error instanceof Error
                  ? aiSummary.error.message
                  : "No se pudo generar el resumen."}
              </p>
            )}

            <button
              onClick={copy}
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {copied ? "¡Copiado!" : "Copiar resumen"}
            </button>
          </section>

          {lead && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Oportunidad
              </h4>
              <dl className="space-y-2 text-sm">
                <Line label="Etapa" value={stage?.name ?? "—"} />
                <Line
                  label="Estado"
                  value={LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                />
                <Line
                  label="Origen"
                  value={SOURCE_LABELS[lead.source] ?? lead.source}
                />
                <Line label="Creado" value={formatDateTime(lead.created_at)} />
                {lead.close_reason && (
                  <Line label="Motivo de cierre" value={lead.close_reason} />
                )}
              </dl>
              <div className="mt-3 flex gap-3 text-sm">
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  Ver lead
                </Link>
                <Link
                  href={`/contacts/${contact.id}`}
                  className="font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                >
                  Ver contacto
                </Link>
              </div>
            </section>
          )}
        </div>
      </aside>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
    </div>
  );
}
