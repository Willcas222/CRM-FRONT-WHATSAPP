"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  LimitsPanel,
  PlanPanel,
  StatusPanel,
  VerticalPanel,
} from "@/components/admin/account-panels";
import { PageHeader, StatCard } from "@/components/admin/page-header";
import { ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import {
  useAdminAccount,
  useAdminAccountLimits,
} from "@/lib/hooks/admin-accounts";
import { useAdminOverview } from "@/lib/hooks/admin-analytics";
import { formatDateTime, formatNumber, formatUsd } from "@/lib/utils";

export default function AdminOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const account = useAdminAccount(id);
  const limits = useAdminAccountLimits(id);
  const usage = useAdminOverview({ account_id: id });

  if (account.isLoading || limits.isLoading) return <FullPageSpinner />;
  if (account.error || !account.data) {
    return (
      <>
        <PageHeader title="Organización" />
        <ErrorBanner message="No se encontró la organización." />
        <Link
          href="/admin/organizations"
          className="mt-4 inline-block text-sm text-indigo-600"
        >
          ← Volver a organizaciones
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/organizations"
        className="text-sm text-indigo-600 dark:text-indigo-400"
      >
        ← Organizaciones
      </Link>
      <div className="mt-2">
        <PageHeader
          title={account.data.name}
          help="organization-detail"
          description={`Creada ${formatDateTime(account.data.created_at)} · ${account.data.id}`}
        />
      </div>

      {usage.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Usuarios"
            value={formatNumber(usage.data.users_total)}
          />
          <StatCard
            label="Conversaciones"
            value={formatNumber(usage.data.conversations_total)}
          />
          <StatCard
            label="Mensajes (30 d)"
            value={formatNumber(
              usage.data.period.whatsapp_inbound +
                usage.data.period.whatsapp_outbound,
            )}
          />
          <StatCard
            label="Costo IA (30 d)"
            value={formatUsd(usage.data.period.ai_estimated_cost_usd)}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusPanel account={account.data} />
        <PlanPanel account={account.data} />
        <VerticalPanel account={account.data} />
      </div>

      <div className="mt-6">
        {limits.error || !limits.data ? (
          <ErrorBanner message="No se pudieron cargar los límites." />
        ) : (
          <LimitsPanel
            key={limits.data.updated_at ?? "sin-limites"}
            accountId={id}
            limits={limits.data}
          />
        )}
      </div>
    </>
  );
}
