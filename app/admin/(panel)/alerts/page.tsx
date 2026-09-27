"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError } from "@/lib/api-client";
import {
  useAlertAction,
  useAlerts,
  useEvaluateAlerts,
  type AlertFilters,
} from "@/lib/hooks/admin-ops";
import { formatDateTime, formatRelative } from "@/lib/utils";

const SEVERITY_TONE = {
  INFO: "blue",
  WARNING: "amber",
  CRITICAL: "red",
} as const;
const SEVERITY_LABEL = {
  INFO: "Info",
  WARNING: "Advertencia",
  CRITICAL: "Crítica",
} as const;
const STATUS_LABEL = {
  OPEN: "Abierta",
  ACKNOWLEDGED: "Vista",
  RESOLVED: "Resuelta",
} as const;

const TYPE_LABEL: Record<string, string> = {
  ACCOUNT_NEAR_WHATSAPP_LIMIT: "Cerca del límite de WhatsApp",
  ACCOUNT_WHATSAPP_LIMIT_REACHED: "Límite de WhatsApp alcanzado",
  ACCOUNT_NEAR_AI_LIMIT: "Cerca del límite de IA",
  ACCOUNT_AI_LIMIT_REACHED: "Límite de IA alcanzado",
  SYSTEM_REDIS_UNHEALTHY: "Redis con problemas",
  SYSTEM_WORKERS_UNHEALTHY: "Workers con problemas",
  SYSTEM_WHATSAPP_UNHEALTHY: "Envíos de WhatsApp fallando",
  SYSTEM_AI_PROVIDER_UNHEALTHY: "Errores del proveedor de IA",
};

type View = "open" | "all" | "RESOLVED";

export default function AdminAlertsPage() {
  const [view, setView] = useState<View>("open");
  const [severity, setSeverity] = useState<AlertFilters["severity"] | "">("");
  const filters: AlertFilters = {
    ...(view === "open"
      ? { only_open: true }
      : view === "RESOLVED"
        ? { status: "RESOLVED" }
        : {}),
    ...(severity ? { severity } : {}),
  };
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAlerts(filters);
  const action = useAlertAction();
  const evaluate = useEvaluateAlerts();
  const [message, setMessage] = useState<string | null>(null);

  const alerts = data?.pages.flatMap((page) => page.items) ?? [];
  const counts = data?.pages[0]?.open_by_severity ?? {};

  async function runEvaluation() {
    setMessage(null);
    try {
      const result = await evaluate.mutateAsync();
      setMessage(
        `Evaluación lista: ${result.created} nuevas, ${result.updated} vigentes, ${result.resolved} resueltas` +
          (result.accounts_skipped > 0
            ? ` (${result.accounts_skipped} cuentas sin datos de consumo)`
            : "."),
      );
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "No se pudo evaluar.");
    }
  }

  return (
    <>
      <PageHeader
        title="Alertas"
        help="alerts"
        description="Consumo cerca de los límites y problemas operativos. Se evalúan solas cada 5 minutos."
        actions={
          <Button
            variant="secondary"
            loading={evaluate.isPending}
            onClick={() => void runEvaluation()}
          >
            Evaluar ahora
          </Button>
        }
      />

      {message && (
        <p className="mb-4 rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {message}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
          {(
            [
              ["open", "Abiertas"],
              ["all", "Todas"],
              ["RESOLVED", "Resueltas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              className={
                "rounded-md px-3 py-1 text-xs font-medium " +
                (view === value
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="w-44">
          <Select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as AlertFilters["severity"] | "")
            }
          >
            <option value="">Toda gravedad</option>
            <option value="CRITICAL">Críticas</option>
            <option value="WARNING">Advertencias</option>
            <option value="INFO">Info</option>
          </Select>
        </div>
        <div className="flex gap-2 text-xs text-zinc-500">
          {(["CRITICAL", "WARNING", "INFO"] as const).map((s) => (
            <span key={s}>
              {SEVERITY_LABEL[s]}: <strong>{counts[s] ?? 0}</strong>
            </span>
          ))}
          <span>(abiertas)</span>
        </div>
      </div>

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudieron cargar las alertas." />}

      {data && (
        <Card className="overflow-x-auto">
          {alerts.length === 0 ? (
            <EmptyState
              title={
                view === "open" ? "No hay alertas abiertas." : "No hay alertas."
              }
              description="Cuando una organización se acerque a un límite o un componente falle, aparecerá aquí."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Gravedad</th>
                  <th className="px-4 py-3 font-medium">Alerta</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Cuándo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const severityKey =
                    alert.severity as keyof typeof SEVERITY_TONE;
                  const statusKey = alert.status as keyof typeof STATUS_LABEL;
                  return (
                    <tr
                      key={alert.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                    >
                      <td className="px-4 py-3">
                        <Badge tone={SEVERITY_TONE[severityKey] ?? "neutral"}>
                          {SEVERITY_LABEL[severityKey] ?? alert.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {TYPE_LABEL[alert.alert_type] ?? alert.alert_type}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {alert.message}
                        </div>
                        {alert.account_id && (
                          <Link
                            href={`/admin/organizations/${alert.account_id}`}
                            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Ver organización
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={statusKey === "RESOLVED" ? "green" : "neutral"}
                        >
                          {STATUS_LABEL[statusKey] ?? alert.status}
                        </Badge>
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500"
                        title={formatDateTime(alert.created_at)}
                      >
                        {formatRelative(alert.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {alert.status !== "RESOLVED" && (
                          <div className="flex justify-end gap-1.5">
                            {alert.status === "OPEN" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                loading={action.isPending}
                                onClick={() =>
                                  action.mutate({
                                    id: alert.id,
                                    action: "acknowledge",
                                  })
                                }
                              >
                                Marcar vista
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              loading={action.isPending}
                              onClick={() =>
                                action.mutate({
                                  id: alert.id,
                                  action: "resolve",
                                })
                              }
                            >
                              Resolver
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="secondary"
            loading={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            Cargar más
          </Button>
        </div>
      )}
      <p className="mt-4 text-xs text-zinc-400">
        Una alerta resuelta a mano se reabre en la siguiente evaluación si la
        causa sigue ahí.
      </p>
    </>
  );
}
