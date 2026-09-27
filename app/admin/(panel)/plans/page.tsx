"use client";

import { ReasonField, REASON_MIN } from "@/components/admin/reason-field";
import { useState } from "react";

import { PageHeader } from "@/components/admin/page-header";
import {
  draftToLimits,
  LIMIT_FIELDS,
  LimitsEditor,
  limitsToDraft,
  type LimitDraft,
} from "@/components/admin/limits-editor";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
} from "@/lib/hooks/admin-catalog";
import { formatUsd } from "@/lib/utils";

type Plan = components["schemas"]["PlanOut"];

export default function AdminPlansPage() {
  const { data, isLoading, error } = useAdminPlans();
  const [editing, setEditing] = useState<Plan | "new" | null>(null);

  return (
    <>
      <PageHeader
        title="Planes"
        help="plans"
        description="Catálogo de planes y sus límites. Un plan inactivo no se puede asignar a cuentas nuevas."
        actions={<Button onClick={() => setEditing("new")}>Nuevo plan</Button>}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudieron cargar los planes." />}

      {data && (
        <Card className="overflow-x-auto">
          {data.length === 0 ? (
            <EmptyState title="Aún no hay planes." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Precio / mes
                  </th>
                  <th className="px-4 py-3 font-medium">Límites definidos</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="px-4 py-3 font-medium">{plan.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{plan.code}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatUsd(plan.monthly_price_usd)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {LIMIT_FIELDS.filter((f) => f.key in plan.limits).length}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={plan.is_active ? "green" : "neutral"}>
                        {plan.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(plan)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {editing && (
        <PlanForm
          key={editing === "new" ? "new" : editing.id}
          plan={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function PlanForm({
  plan,
  onClose,
}: {
  plan: Plan | null;
  onClose: () => void;
}) {
  const create = useCreatePlan();
  const update = useUpdatePlan(plan?.id ?? "");
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [price, setPrice] = useState(plan?.monthly_price_usd ?? "0");
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [draft, setDraft] = useState<LimitDraft>(() =>
    limitsToDraft(plan?.limits),
  );
  const [features, setFeatures] = useState(() =>
    JSON.stringify(plan?.features ?? {}, null, 2),
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (reason.trim().length < REASON_MIN)
      return setError("Escribe el motivo del cambio (mínimo 3 caracteres).");
    const { limits, error: limitError } = draftToLimits(draft);
    if (limitError) return setError(limitError);
    let parsedFeatures: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(features || "{}");
      if (typeof value !== "object" || value === null || Array.isArray(value))
        throw new Error();
      parsedFeatures = value as Record<string, unknown>;
    } catch {
      return setError("Las características deben ser un objeto JSON válido.");
    }
    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (!/^\d+(\.\d+)?$/.test(String(price)))
      return setError("El precio debe ser un número ≥ 0.");

    // El editor solo conoce las claves numéricas; se conserva lo demás (p. ej. allowed_ai_models).
    const preserved = Object.fromEntries(
      Object.entries(plan?.limits ?? {}).filter(
        ([key]) => !LIMIT_FIELDS.some((f) => f.key === key),
      ),
    );
    const finalLimits = { ...preserved, ...limits };

    setBusy(true);
    try {
      if (plan) {
        await update.mutateAsync({
          name: name.trim(),
          description: description.trim() || null,
          monthly_price_usd: String(price),
          limits: finalLimits,
          features: parsedFeatures,
          is_active: isActive,
          reason: reason.trim(),
        });
      } else {
        if (!code.trim()) return setError("El código es obligatorio.");
        await create.mutateAsync({
          code: code.trim(),
          name: name.trim(),
          description: description.trim() || null,
          monthly_price_usd: String(price),
          limits: finalLimits,
          features: parsedFeatures,
          reason: reason.trim(),
        });
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar el plan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={plan ? `Editar plan «${plan.name}»` : "Nuevo plan"}
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && <ErrorBanner message={error} />}
        {!plan && (
          <div>
            <Label htmlFor="code">
              Código (A-Z, 0-9 y _; no se puede cambiar después)
            </Label>
            <Input
              id="code"
              value={code}
              maxLength={50}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
        )}
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={name}
            maxLength={200}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            rows={2}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="price">Precio mensual (USD)</Label>
          <Input
            id="price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {plan && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Plan activo
          </label>
        )}
        <LimitsEditor
          draft={draft}
          onChange={setDraft}
          emptyMeaning="sin definir (no aplica límite del plan)"
        />
        <div>
          <Label htmlFor="features">Características (JSON)</Label>
          <Textarea
            id="features"
            rows={4}
            className="font-mono text-xs"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
          />
        </div>
        <ReasonField value={reason} onChange={setReason} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={busy} onClick={() => void submit()}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
