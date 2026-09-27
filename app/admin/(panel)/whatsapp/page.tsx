"use client";

import { useAnalyticsControls } from "@/components/admin/analytics-toolbar";
import { PageHeader, StatCard } from "@/components/admin/page-header";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { useAdminWhatsAppUsage } from "@/lib/hooks/admin-analytics";
import { formatNumber, formatUsd } from "@/lib/utils";

export default function AdminWhatsAppPage() {
  const { query, toolbar } = useAnalyticsControls(30);
  const { data, isLoading, error } = useAdminWhatsAppUsage(query);

  return (
    <>
      <PageHeader
        title="Uso de WhatsApp"
        help="whatsapp"
        description="Mensajes entrantes y salientes por tipo."
        actions={toolbar}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar el uso de WhatsApp." />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Entrantes"
              value={formatNumber(data.inbound_total)}
            />
            <StatCard
              label="Salientes"
              value={formatNumber(data.outbound_total)}
            />
            <StatCard
              label="Costo estimado"
              value={formatUsd(data.estimated_cost_usd)}
              hint="Suma de costos registrados por mensaje"
            />
          </div>

          <Card className="overflow-x-auto">
            {data.by_type.length === 0 ? (
              <EmptyState title="Sin mensajes en esta ventana." />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                    <th className="px-4 py-3 font-medium">Dirección</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Mensajes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_type.map((row) => (
                    <tr
                      key={`${row.direction}-${row.message_type}`}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                    >
                      <td className="px-4 py-3">
                        <Badge
                          tone={row.direction === "INBOUND" ? "blue" : "green"}
                        >
                          {row.direction === "INBOUND"
                            ? "Entrante"
                            : "Saliente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.message_type}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatNumber(row.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
