"use client";

import { useAnalyticsControls } from "@/components/admin/analytics-toolbar";
import { AiModelsPanel } from "@/components/admin/ai-models-panel";
import { PageHeader, StatCard } from "@/components/admin/page-header";
import {
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { useAdminAiConsumption } from "@/lib/hooks/admin-analytics";
import { formatNumber, formatUsd } from "@/lib/utils";

export default function AdminAiPage() {
  const { query, toolbar } = useAnalyticsControls(30);
  const { data, isLoading, error } = useAdminAiConsumption(query);

  return (
    <>
      <PageHeader
        title="Consumo de IA"
        help="ai"
        description="Sesiones, tokens y costo estimado por modelo."
        actions={toolbar}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar el consumo de IA." />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Sesiones"
              value={formatNumber(data.sessions_total)}
            />
            <StatCard
              label="Tokens totales"
              value={formatNumber(data.total_tokens)}
            />
            <StatCard
              label="Costo estimado"
              value={formatUsd(data.estimated_cost_usd)}
            />
            <StatCard
              label="Latencia media"
              value={`${formatNumber(Math.round(data.avg_latency_ms))} ms`}
            />
          </div>

          <Card className="overflow-x-auto">
            {data.by_model.length === 0 ? (
              <EmptyState title="Sin sesiones de IA en esta ventana." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <th className="px-4 py-3 font-medium">Modelo</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Sesiones
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Entrada
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Salida</th>
                    <th className="px-4 py-3 text-right font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_model.map((row) => (
                    <tr
                      key={row.model}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.model}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(row.sessions)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(row.input_tokens)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(row.output_tokens)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatUsd(row.estimated_cost_usd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}

      <AiModelsPanel />
    </>
  );
}
