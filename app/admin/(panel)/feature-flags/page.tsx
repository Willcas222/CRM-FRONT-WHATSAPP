"use client";

import { useState } from "react";

import { AccountFilter } from "@/components/admin/account-filter";
import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import type { components } from "@/lib/api-schema";
import { useAdminAccounts } from "@/lib/hooks/admin-accounts";
import { useAdminPlans } from "@/lib/hooks/admin-catalog";
import {
  useCreateFlag,
  useEffectiveFlags,
  useFeatureFlags,
  useUpdateFlag,
} from "@/lib/hooks/admin-settings";

type Flag = components["schemas"]["FeatureFlagOut"];

const SOURCE_LABEL = {
  GLOBAL: "Global",
  PLAN: "Plan",
  ACCOUNT: "Cuenta",
} as const;

export default function AdminFeatureFlagsPage() {
  const { data, isLoading, error } = useFeatureFlags();
  const [editing, setEditing] = useState<Flag | "new" | null>(null);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const effective = useEffectiveFlags(accountId);

  return (
    <>
      <PageHeader
        title="Feature flags"
        help="feature-flags"
        description="Encienden o apagan funciones. Gana lo más específico: cuenta, luego plan, luego el valor global. Un flag que no existe cuenta como encendido."
        actions={<Button onClick={() => setEditing("new")}>Nuevo flag</Button>}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudieron cargar los flags." />}

      {data && (
        <Card className="overflow-x-auto">
          {data.length === 0 ? (
            <EmptyState
              title="Aún no hay flags."
              description="Crea AI_ENABLED, WHATSAPP_ENABLED o AUTOMATIONS_ENABLED para poder apagar esas funciones."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Flag</th>
                  <th className="px-4 py-3 font-medium">Global</th>
                  <th className="px-4 py-3 font-medium">Overrides</th>
                  <th className="px-4 py-3 font-medium">Efecto</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.map((flag) => (
                  <tr
                    key={flag.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold">
                        {flag.key}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {flag.description ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={flag.default_enabled ? "green" : "red"}>
                        {flag.default_enabled ? "Encendido" : "Apagado"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                      {Object.keys(flag.plan_overrides).length} planes ·{" "}
                      {Object.keys(flag.account_overrides).length} cuentas
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={flag.enforced ? "blue" : "neutral"}>
                        {flag.enforced
                          ? "Aplicado por el backend"
                          : "Solo informativo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditing(flag)}
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

      <section className="mt-10">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Vista efectiva por organización
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Cómo queda cada flag para una cuenta y de dónde sale el valor.
        </p>
        <AccountFilter accountId={accountId} onChange={setAccountId} />
        {accountId && effective.data && (
          <Card className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {effective.data.map((item) => (
                  <tr
                    key={item.key}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                  >
                    <td className="px-4 py-2 font-mono text-xs">{item.key}</td>
                    <td className="px-4 py-2">
                      <Badge tone={item.enabled ? "green" : "red"}>
                        {item.enabled ? "Encendido" : "Apagado"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-xs text-zinc-500">
                      viene de: {SOURCE_LABEL[item.source]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      {editing && (
        <FlagForm
          key={editing === "new" ? "new" : editing.id}
          flag={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

type Tri = "" | "true" | "false";
const toTri = (value: boolean | undefined): Tri =>
  value === undefined ? "" : value ? "true" : "false";

function FlagForm({
  flag,
  onClose,
}: {
  flag: Flag | null;
  onClose: () => void;
}) {
  const create = useCreateFlag();
  const update = useUpdateFlag(flag?.id ?? "");
  const plans = useAdminPlans();
  const accounts = useAdminAccounts({ limit: 100 });

  const [key, setKey] = useState("");
  const [description, setDescription] = useState(flag?.description ?? "");
  const [defaultEnabled, setDefaultEnabled] = useState(
    flag?.default_enabled ?? false,
  );
  const [planTri, setPlanTri] = useState<Record<string, Tri>>(() =>
    Object.fromEntries(
      Object.entries(flag?.plan_overrides ?? {}).map(([k, v]) => [k, toTri(v)]),
    ),
  );
  const [accountTri, setAccountTri] = useState<Record<string, Tri>>(() =>
    Object.fromEntries(
      Object.entries(flag?.account_overrides ?? {}).map(([k, v]) => [
        k,
        toTri(v),
      ]),
    ),
  );
  const [newAccount, setNewAccount] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountName = (id: string) =>
    accounts.data?.items.find((a) => a.id === id)?.name ?? id;

  /** Solo se envía lo que cambió: `null` quita el override, ausente no lo toca. */
  function overridesDiff(
    before: Record<string, boolean>,
    now: Record<string, Tri>,
  ): Record<string, boolean | null> | undefined {
    const diff: Record<string, boolean | null> = {};
    for (const [k, v] of Object.entries(now)) {
      const target = v === "" ? null : v === "true";
      if ((before[k] ?? null) !== target) diff[k] = target;
    }
    for (const k of Object.keys(before)) if (!(k in now)) diff[k] = null;
    return Object.keys(diff).length > 0 ? diff : undefined;
  }

  async function submit(reason: string) {
    if (flag) {
      await update.mutateAsync({
        reason,
        description: description.trim() || undefined,
        default_enabled:
          defaultEnabled === flag.default_enabled ? undefined : defaultEnabled,
        plan_overrides: overridesDiff(flag.plan_overrides, planTri),
        account_overrides: overridesDiff(flag.account_overrides, accountTri),
      });
    } else {
      await create.mutateAsync({
        key: key.trim(),
        reason,
        default_enabled: defaultEnabled,
        description: description.trim() || null,
      });
    }
    onClose();
  }

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={flag ? `Editar ${flag.key}` : "Nuevo flag"}
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {error && <ErrorBanner message={error} />}
          {!flag && (
            <div>
              <Label htmlFor="flag-key">Clave (A-Z, 0-9 y _)</Label>
              <Input
                id="flag-key"
                value={key}
                onChange={(event) => setKey(event.target.value.toUpperCase())}
                placeholder="AI_ENABLED"
              />
            </div>
          )}
          <div>
            <Label htmlFor="flag-desc">Descripción</Label>
            <Textarea
              id="flag-desc"
              rows={2}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={defaultEnabled}
              onChange={(event) => setDefaultEnabled(event.target.checked)}
            />
            Encendido por defecto (global)
          </label>

          {flag && (
            <>
              <fieldset className="space-y-2">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Por plan
                </legend>
                {plans.data?.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm">
                      {plan.name}{" "}
                      <span className="font-mono text-xs text-zinc-500">
                        {plan.code}
                      </span>
                    </span>
                    <div className="w-36">
                      <Select
                        value={planTri[plan.code] ?? ""}
                        onChange={(event) =>
                          setPlanTri({
                            ...planTri,
                            [plan.code]: event.target.value as Tri,
                          })
                        }
                      >
                        <option value="">Heredar</option>
                        <option value="true">Encendido</option>
                        <option value="false">Apagado</option>
                      </Select>
                    </div>
                  </div>
                ))}
                {plans.data?.length === 0 && (
                  <p className="text-xs text-zinc-500">No hay planes.</p>
                )}
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Por organización
                </legend>
                {Object.entries(accountTri).map(([id, value]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-sm">{accountName(id)}</span>
                    <div className="w-36">
                      <Select
                        value={value}
                        onChange={(event) =>
                          setAccountTri({
                            ...accountTri,
                            [id]: event.target.value as Tri,
                          })
                        }
                      >
                        <option value="">Quitar override</option>
                        <option value="true">Encendido</option>
                        <option value="false">Apagado</option>
                      </Select>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={newAccount}
                      onChange={(event) => setNewAccount(event.target.value)}
                    >
                      <option value="">Añadir organización…</option>
                      {accounts.data?.items
                        .filter((a) => !(a.id in accountTri))
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                    </Select>
                  </div>
                  <Button
                    variant="secondary"
                    disabled={!newAccount}
                    onClick={() => {
                      setAccountTri({ ...accountTri, [newAccount]: "true" });
                      setNewAccount("");
                    }}
                  >
                    Añadir
                  </Button>
                </div>
              </fieldset>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!flag && !key.trim())
                  return setError("La clave es obligatoria.");
                setError(null);
                setConfirming(true);
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={flag ? `Guardar cambios de ${flag.key}` : "Crear flag"}
        warning="El cambio se aplica de inmediato a las organizaciones afectadas."
        confirmLabel="Confirmar"
        onConfirm={submit}
      />
    </>
  );
}
