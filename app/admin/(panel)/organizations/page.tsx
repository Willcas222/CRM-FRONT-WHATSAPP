"use client";

import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import {
  ACCOUNT_STATUSES,
  STATUS_LABEL,
  STATUS_TONE,
  type AccountStatus,
} from "@/lib/admin-labels";
import { useAdminAccountList } from "@/lib/hooks/admin-accounts";
import { formatDate } from "@/lib/utils";

export default function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AccountStatus | "">("");
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminAccountList({
    search: search.trim() || undefined,
    status: status || undefined,
  });
  const accounts = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <PageHeader
        title="Organizaciones"
        help="organizations"
        description="Todas las cuentas de la plataforma. Entra a una para cambiar su estado, plan o límites."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-56">
              <Input
                placeholder="Buscar por nombre…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="w-56">
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AccountStatus | "")
                }
              >
                <option value="">Todos los estados</option>
                {ACCOUNT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        }
      />

      {isLoading && <FullPageSpinner />}
      {error && (
        <ErrorBanner message="No se pudieron cargar las organizaciones." />
      )}

      {data && (
        <Card className="overflow-x-auto">
          {accounts.length === 0 ? (
            <EmptyState title="No hay organizaciones con estos filtros." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                  <th className="px-4 py-3 font-medium">Creada</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/organizations/${account.id}`}
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[account.status]}>
                        {STATUS_LABEL[account.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {account.status_reason ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(account.created_at)}
                    </td>
                  </tr>
                ))}
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
    </>
  );
}
