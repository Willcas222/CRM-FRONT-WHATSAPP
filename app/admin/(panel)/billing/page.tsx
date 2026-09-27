"use client";

import { useAnalyticsControls } from "@/components/admin/analytics-toolbar";
import { PageHeader, StatCard } from "@/components/admin/page-header";
import { Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { useAdminCosts } from "@/lib/hooks/admin-analytics";
import { formatUsd } from "@/lib/utils";

export default function AdminBillingPage() {
  const { query, toolbar } = useAnalyticsControls(30);
  const { data, isLoading, error } = useAdminCosts(query);

  return (
    <>
      <PageHeader
        title="Facturación"
        help="billing"
        description="Costos operativos estimados (IA + WhatsApp) de la plataforma o de una organización."
        actions={toolbar}
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudieron cargar los costos." />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Costo de IA"
              value={formatUsd(data.ai_estimated_cost_usd)}
            />
            <StatCard
              label="Costo de WhatsApp"
              value={formatUsd(data.whatsapp_estimated_cost_usd)}
            />
            <StatCard
              label="Total estimado"
              value={formatUsd(data.total_estimated_cost_usd)}
            />
          </div>

          <Card className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
            Son estimaciones de costo, no facturas: aún no existe cobro a las
            organizaciones, y el costo de WhatsApp solo suma los mensajes que
            tienen un costo registrado (no hay catálogo de precios).
          </Card>
        </div>
      )}
    </>
  );
}
