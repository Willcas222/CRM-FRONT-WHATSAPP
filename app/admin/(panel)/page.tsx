"use client";

import { PageHeader, StatCard } from "@/components/admin/page-header";
import {
  useAnalyticsWindow,
  WindowPicker,
} from "@/components/admin/window-picker";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { useAdminOverview } from "@/lib/hooks/admin-analytics";
import { formatNumber, formatUsd } from "@/lib/utils";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "neutral"> = {
  ACTIVE: "green",
  PENDING_SETUP: "amber",
  PAYMENT_FAILED: "amber",
  PAUSED_BY_LIMIT: "amber",
  INACTIVE: "neutral",
  SUSPENDED: "red",
  FROZEN: "red",
  DELETED: "neutral",
};

export default function AdminDashboardPage() {
  const { days, setDays, window } = useAnalyticsWindow(30);
  const { data, isLoading, error } = useAdminOverview(window);

  return (
    <>
      <PageHeader
        title="Resumen de la plataforma"
        help="overview"
        description="Estado global de organizaciones y consumo en la ventana elegida."
        actions={<WindowPicker days={days} onChange={setDays} />}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar el resumen." />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Organizaciones"
              value={formatNumber(data.accounts_total)}
            />
            <StatCard label="Usuarios" value={formatNumber(data.users_total)} />
            <StatCard
              label="Conversaciones"
              value={formatNumber(data.conversations_total)}
            />
            <StatCard
              label="Cuentas cerca del límite"
              value={formatNumber(data.accounts_near_limit)}
              hint="Con una alerta de consumo abierta"
            />
            <StatCard
              label="Costo estimado"
              value={formatUsd(
                Number(data.period.ai_estimated_cost_usd) +
                  Number(data.period.whatsapp_estimated_cost_usd),
              )}
              hint="IA + WhatsApp"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="WhatsApp entrantes"
              value={formatNumber(data.period.whatsapp_inbound)}
            />
            <StatCard
              label="WhatsApp salientes"
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
          </div>

          <Card className="p-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Organizaciones por estado
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(data.accounts_by_status).map(
                ([status, count]) => (
                  <Badge key={status} tone={STATUS_TONE[status] ?? "neutral"}>
                    {status} · {formatNumber(count)}
                  </Badge>
                ),
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
