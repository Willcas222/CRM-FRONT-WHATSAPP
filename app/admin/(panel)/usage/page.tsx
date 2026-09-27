"use client";

import { useAnalyticsControls } from "@/components/admin/analytics-toolbar";
import { PageHeader, StatCard } from "@/components/admin/page-header";
import { ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { useAdminOverview } from "@/lib/hooks/admin-analytics";
import { formatNumber, formatUsd } from "@/lib/utils";

export default function AdminUsagePage() {
  const { query, toolbar } = useAnalyticsControls(30);
  const { data, isLoading, error } = useAdminOverview(query);

  return (
    <>
      <PageHeader
        title="Uso"
        help="usage"
        description="Consumo de mensajería e IA de toda la plataforma o de una organización."
        actions={toolbar}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar el uso." />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Mensajes entrantes"
            value={formatNumber(data.period.whatsapp_inbound)}
          />
          <StatCard
            label="Mensajes salientes"
            value={formatNumber(data.period.whatsapp_outbound)}
          />
          <StatCard
            label="Sesiones de IA"
            value={formatNumber(data.period.ai_sessions)}
          />
          <StatCard
            label="Tokens de IA"
            value={formatNumber(
              data.period.ai_input_tokens + data.period.ai_output_tokens,
            )}
            hint={`${formatNumber(data.period.ai_input_tokens)} entrada · ${formatNumber(data.period.ai_output_tokens)} salida`}
          />
          <StatCard
            label="Costo de IA"
            value={formatUsd(data.period.ai_estimated_cost_usd)}
          />
          <StatCard
            label="Costo de WhatsApp"
            value={formatUsd(data.period.whatsapp_estimated_cost_usd)}
            hint="Suma de costos registrados por mensaje"
          />
          <StatCard label="Usuarios" value={formatNumber(data.users_total)} />
          <StatCard
            label="Conversaciones"
            value={formatNumber(data.conversations_total)}
          />
        </div>
      )}
    </>
  );
}
