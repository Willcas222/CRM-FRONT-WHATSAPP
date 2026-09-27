"use client";

import { Fragment, useState } from "react";

import { AccountFilter } from "@/components/admin/account-filter";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { useAdminAudit } from "@/lib/hooks/admin-audit";
import { formatDateTime } from "@/lib/utils";

export default function AdminAuditPage() {
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAdminAudit({
    action: action.trim() || undefined,
    entity_type: entityType.trim() || undefined,
    account_id: accountId,
  });
  const events = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <PageHeader
        title="Auditoría"
        help="audit"
        description="Historial inmutable de acciones de plataforma."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-44">
              <Input
                placeholder="Acción (exacta)"
                value={action}
                onChange={(event) => setAction(event.target.value)}
              />
            </div>
            <div className="w-40">
              <Input
                placeholder="Tipo de entidad"
                value={entityType}
                onChange={(event) => setEntityType(event.target.value)}
              />
            </div>
            <AccountFilter accountId={accountId} onChange={setAccountId} />
          </div>
        }
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudo cargar la auditoría." />}

      {data && (
        <Card className="overflow-x-auto">
          {events.length === 0 ? (
            <EmptyState title="Sin eventos para estos filtros." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Acción</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Entidad</th>
                  <th className="px-4 py-3 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <Fragment key={event.id}>
                    <tr
                      onClick={() =>
                        setExpanded(expanded === event.id ? null : event.id)
                      }
                      className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDateTime(event.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {event.action}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="neutral">{event.actor_type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {event.entity_type ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {event.reason ?? "—"}
                      </td>
                    </tr>
                    {expanded === event.id && (
                      <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-950">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <JsonBlock
                              title="Estado anterior"
                              value={event.previous_state}
                            />
                            <JsonBlock
                              title="Estado nuevo"
                              value={event.new_state}
                            />
                          </div>
                          <p className="mt-2 font-mono text-[11px] text-zinc-500">
                            id {event.id}
                            {event.account_id
                              ? ` · cuenta ${event.account_id}`
                              : ""}
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-500">{title}</p>
      <pre className="max-h-48 overflow-auto rounded-lg bg-white p-2 text-[11px] dark:bg-zinc-900">
        {value == null ? "—" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
