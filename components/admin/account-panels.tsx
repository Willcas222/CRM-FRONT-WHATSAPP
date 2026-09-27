"use client";

import { useState } from "react";

import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import {
  draftToLimits,
  LimitsEditor,
  limitsToDraft,
  type LimitDraft,
} from "@/components/admin/limits-editor";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Badge, Card, ErrorBanner } from "@/components/ui/misc";
import {
  ACCOUNT_STATUSES,
  BLOCKING_WARNING,
  STATUS_LABEL,
  STATUS_TONE,
  type AccountStatus,
} from "@/lib/admin-labels";
import { ApiError } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import {
  useAssignAccountPlan,
  useChangeAccountStatus,
  useUpdateAccountLimits,
} from "@/lib/hooks/admin-accounts";
import { useAdminAiModels, useAdminPlans } from "@/lib/hooks/admin-catalog";
import { formatDateTime } from "@/lib/utils";

type Account =
  components["schemas"]["app__infrastructure__web__schemas__superadmin_accounts__AccountOut"];
type Limits = components["schemas"]["AccountLimitsOut"];

function errorText(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "No se pudo completar la acción.";
}

// ------------------------------------------------------------------ estado

export function StatusPanel({ account }: { account: Account }) {
  const mutation = useChangeAccountStatus(account.id);
  const [target, setTarget] = useState<AccountStatus | "">("");
  const [confirming, setConfirming] = useState(false);

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Estado
        </h2>
        <Badge tone={STATUS_TONE[account.status]}>
          {STATUS_LABEL[account.status]}
        </Badge>
      </div>
      {account.status_reason && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Motivo actual: {account.status_reason}
          {account.status_changed_at
            ? ` (${formatDateTime(account.status_changed_at)})`
            : ""}
        </p>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="new-status">Cambiar a</Label>
          <Select
            id="new-status"
            value={target}
            onChange={(event) =>
              setTarget(event.target.value as AccountStatus | "")
            }
          >
            <option value="">Selecciona un estado…</option>
            {ACCOUNT_STATUSES.filter((s) => s !== account.status).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button disabled={!target} onClick={() => setConfirming(true)}>
          Cambiar
        </Button>
      </div>

      {target && (
        <ConfirmReasonModal
          open={confirming}
          onClose={() => setConfirming(false)}
          title={`Cambiar a «${STATUS_LABEL[target]}»`}
          warning={
            target === "ACTIVE"
              ? "La organización volverá a poder operar."
              : target === "DELETED"
                ? `${BLOCKING_WARNING} La eliminación es lógica pero prácticamente definitiva.`
                : BLOCKING_WARNING
          }
          confirmLabel="Confirmar cambio"
          danger={target !== "ACTIVE"}
          onConfirm={async (reason) => {
            await mutation.mutateAsync({ status: target, reason });
            setTarget("");
          }}
        />
      )}
    </Card>
  );
}

// ------------------------------------------------------------------ plan

export function PlanPanel({ account }: { account: Account }) {
  const plans = useAdminPlans();
  const mutation = useAssignAccountPlan(account.id);
  const [choice, setChoice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const selected = choice ?? account.plan_id ?? "";
  const current = plans.data?.find((p) => p.id === account.plan_id);
  const target = plans.data?.find((p) => p.id === selected);

  return (
    <Card className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Plan
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Actual:{" "}
        {account.plan_id
          ? (current?.name ?? "…")
          : "sin plan (solo valores globales)"}
      </p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="plan">Asignar plan</Label>
          <Select
            id="plan"
            value={selected}
            onChange={(event) => setChoice(event.target.value)}
          >
            <option value="">Sin plan</option>
            {plans.data?.map((plan) => (
              <option
                key={plan.id}
                value={plan.id}
                disabled={!plan.is_active && plan.id !== account.plan_id}
              >
                {plan.name}
                {plan.is_active ? "" : " (inactivo)"}
              </option>
            ))}
          </Select>
        </div>
        <Button
          disabled={selected === (account.plan_id ?? "")}
          onClick={() => setConfirming(true)}
        >
          Guardar
        </Button>
      </div>

      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cambiar el plan"
        warning={`Cambia los límites que aplican a «${account.name}»: ${
          target
            ? `pasará al plan «${target.name}»`
            : "quedará sin plan (solo valores globales)"
        }.`}
        confirmLabel="Cambiar plan"
        onConfirm={async (reason) => {
          await mutation.mutateAsync({
            planId: selected === "" ? null : selected,
            reason,
          });
          setChoice(null);
        }}
      />
    </Card>
  );
}

// ------------------------------------------------------------------ límites

const EMERGENCY: { key: string; label: string; hint: string }[] = [
  {
    key: "ai_blocked",
    label: "Bloquear IA",
    hint: "Ningún bot responde con IA.",
  },
  {
    key: "whatsapp_outbound_blocked",
    label: "Bloquear envíos de WhatsApp",
    hint: "No se puede enviar ningún mensaje saliente.",
  },
  {
    key: "new_conversations_blocked",
    label: "Bloquear conversaciones nuevas",
    hint: "Los mensajes de clientes nuevos se ignoran (no se crea contacto ni conversación); los clientes que ya existen siguen atendidos.",
  },
  {
    key: "bots_disabled",
    label: "Desactivar bots",
    hint: "Los bots dejan de ejecutarse.",
  },
];

export function LimitsPanel({
  accountId,
  limits,
}: {
  accountId: string;
  limits: Limits;
}) {
  const models = useAdminAiModels();
  const mutation = useUpdateAccountLimits(accountId);

  const [draft, setDraft] = useState<LimitDraft>(() =>
    limitsToDraft(limits.limits_override),
  );
  const [emergency, setEmergency] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      EMERGENCY.map((e) => [e.key, limits.emergency_override[e.key] === true]),
    ),
  );
  const [restrict, setRestrict] = useState(limits.allowed_ai_models !== null);
  const [allowed, setAllowed] = useState<string[]>(
    limits.allowed_ai_models ?? [],
  );
  const [defaultModel, setDefaultModel] = useState(
    limits.default_ai_model ?? "",
  );
  const [fallbackModel, setFallbackModel] = useState(
    limits.fallback_ai_model ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const activeEmergency = EMERGENCY.filter((e) => emergency[e.key]);
  const modelNames = models.data?.map((m) => m.model_name) ?? [];

  function validate(): Record<string, number | null> | null {
    const { limits: parsed, error } = draftToLimits(draft);
    if (error) {
      setFormError(error);
      return null;
    }
    setFormError(null);
    return parsed;
  }

  function buildBody(parsed: Record<string, number | null>, reason: string) {
    return {
      reason,
      limits_override: parsed,
      emergency_override: emergency,
      ...(restrict ? { allowed_ai_models: allowed } : {}),
      ...(defaultModel ? { default_ai_model: defaultModel } : {}),
      ...(fallbackModel ? { fallback_ai_model: fallbackModel } : {}),
    };
  }

  async function save(reason: string) {
    const parsed = validate();
    if (!parsed) return;
    setSaved(false);
    await mutation.mutateAsync(buildBody(parsed, reason));
    setSaved(true);
  }

  return (
    <Card className="space-y-6 p-4">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Límites propios de la organización
      </h2>

      {formError && <ErrorBanner message={formError} />}
      {mutation.error && <ErrorBanner message={errorText(mutation.error)} />}
      {saved && !mutation.error && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Cambios guardados.
        </p>
      )}

      <LimitsEditor
        draft={draft}
        onChange={setDraft}
        emptyMeaning="hereda el valor del plan"
      />

      <fieldset className="space-y-2">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          Interruptores de emergencia
        </legend>
        {EMERGENCY.map((item) => (
          <label key={item.key} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={emergency[item.key] ?? false}
              onChange={(event) =>
                setEmergency({ ...emergency, [item.key]: event.target.checked })
              }
            />
            <span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {item.label}
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                {item.hint}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Modelos de IA
        </legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={restrict}
            onChange={(event) => setRestrict(event.target.checked)}
          />
          Restringir a una lista de modelos
        </label>
        {limits.allowed_ai_models !== null && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Ya hay una lista guardada. La API actual no permite volver a «todos
            los modelos»; solo editar la lista.
          </p>
        )}
        {restrict && (
          <div className="flex flex-wrap gap-3">
            {modelNames.map((name) => (
              <label key={name} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={allowed.includes(name)}
                  onChange={(event) =>
                    setAllowed(
                      event.target.checked
                        ? [...allowed, name]
                        : allowed.filter((m) => m !== name),
                    )
                  }
                />
                <span className="font-mono text-xs">{name}</span>
              </label>
            ))}
            {allowed.length === 0 && (
              <p className="w-full text-xs text-red-600 dark:text-red-400">
                Lista vacía = NINGÚN modelo permitido (la IA se bloquea).
              </p>
            )}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="default-model">Modelo por defecto</Label>
            <Select
              id="default-model"
              value={defaultModel}
              onChange={(event) => setDefaultModel(event.target.value)}
            >
              <option value="">(sin cambio)</option>
              {modelNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="fallback-model">Modelo de respaldo</Label>
            <Select
              id="fallback-model"
              value={fallbackModel}
              onChange={(event) => setFallbackModel(event.target.value)}
            >
              <option value="">(sin cambio)</option>
              {modelNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end">
        <Button
          variant={activeEmergency.length > 0 ? "danger" : "primary"}
          loading={mutation.isPending}
          onClick={() => {
            if (validate()) setConfirming(true);
          }}
        >
          Guardar límites
        </Button>
      </div>

      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Guardar límites de la organización"
        warning={
          activeEmergency.length > 0
            ? `Se aplicará de inmediato: ${activeEmergency.map((e) => e.label.toLowerCase()).join(", ")}.`
            : "Los nuevos límites rigen desde la próxima operación de la organización."
        }
        confirmLabel="Guardar y aplicar"
        danger={activeEmergency.length > 0}
        onConfirm={save}
      />
    </Card>
  );
}
