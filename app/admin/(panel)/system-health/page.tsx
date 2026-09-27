"use client";

import { PageHeader } from "@/components/admin/page-header";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { useSystemHealth } from "@/lib/hooks/admin-ops";
import { formatDateTime } from "@/lib/utils";

type Status = "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";

const TONE: Record<Status, "green" | "amber" | "red" | "neutral"> = {
  HEALTHY: "green",
  DEGRADED: "amber",
  DOWN: "red",
  UNKNOWN: "neutral",
};

const STATUS_LABEL: Record<Status, string> = {
  HEALTHY: "Operativo",
  DEGRADED: "Degradado",
  DOWN: "Caído",
  UNKNOWN: "Sin datos",
};

const NAME_LABEL: Record<string, { title: string; note?: string }> = {
  backend: { title: "Backend (API)" },
  database: { title: "Base de datos (PostgreSQL)" },
  redis: { title: "Redis" },
  workers: { title: "Workers y cola de trabajo" },
  whatsapp: {
    title: "WhatsApp (Meta)",
    note: "Deducido de los envíos recientes; no se sondea a Meta.",
  },
  ai_provider: {
    title: "Proveedor de IA",
    note: "Deducido de las ejecuciones recientes; no se sondea al proveedor.",
  },
};

export default function AdminSystemHealthPage() {
  const { data, isLoading, error, isFetching } = useSystemHealth();

  return (
    <>
      <PageHeader
        title="Salud del sistema"
        help="system-health"
        description="Estado de cada pieza de la plataforma. Se actualiza solo cada 15 segundos."
      />

      {isLoading && <FullPageSpinner />}
      {error && (
        <ErrorBanner message="No se pudo obtener el estado del sistema." />
      )}

      {data && (
        <div className="space-y-6">
          <Card
            className={
              data.overall === "DOWN"
                ? "border-red-300 p-5 dark:border-red-900"
                : data.overall === "DEGRADED"
                  ? "border-amber-300 p-5 dark:border-amber-900"
                  : "p-5"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge tone={TONE[data.overall]}>
                  {STATUS_LABEL[data.overall]}
                </Badge>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {data.overall === "HEALTHY"
                    ? "Todo funciona con normalidad."
                    : data.overall === "DEGRADED"
                      ? "Hay componentes degradados: revisa el detalle."
                      : data.overall === "DOWN"
                        ? "Hay componentes caídos: requiere atención."
                        : "Todavía no hay datos suficientes."}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                Última comprobación {formatDateTime(data.checked_at)}
                {isFetching ? " · actualizando…" : ""}
              </span>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.components.map((component) => (
              <Card key={component.name} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {NAME_LABEL[component.name]?.title ?? component.name}
                  </h2>
                  <Badge tone={TONE[component.status]}>
                    {STATUS_LABEL[component.status]}
                  </Badge>
                </div>
                {component.detail && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {component.detail}
                  </p>
                )}
                {component.latency_ms != null && (
                  <p className="mt-1 text-xs tabular-nums text-zinc-500">
                    Latencia: {component.latency_ms} ms
                  </p>
                )}
                {NAME_LABEL[component.name]?.note && (
                  <p className="mt-2 text-xs italic text-zinc-400">
                    {NAME_LABEL[component.name]?.note}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
