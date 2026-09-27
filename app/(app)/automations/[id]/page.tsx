"use client";

import { useParams } from "next/navigation";

import { PageTitle } from "@/components/help/page-title";
import { Badge, Card, EmptyState, FullPageSpinner } from "@/components/ui/misc";
import {
  useAutomation,
  useAutomationExecutions,
} from "@/lib/hooks/automations";
import { formatDateTime } from "@/lib/utils";
import { AutomationForm } from "../automation-form";
import { useRequireManage } from "../require-manage";

const STATUS_TONES: Record<string, "green" | "red" | "amber" | "neutral"> = {
  SUCCEEDED: "green",
  FAILED: "red",
  RUNNING: "amber",
  SKIPPED: "neutral",
};

const STATUS_LABELS: Record<string, string> = {
  SUCCEEDED: "Exitosa",
  FAILED: "Falló",
  RUNNING: "En curso",
  SKIPPED: "Omitida",
};

export default function EditAutomationPage() {
  const canManage = useRequireManage();
  const { id } = useParams<{ id: string }>();
  const { data: automation, isLoading } = useAutomation(id);

  if (!canManage || isLoading) return <FullPageSpinner />;
  if (!automation) return <EmptyState title="Automatización no encontrada" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageTitle
        topic="automations"
        className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
      >
        Editar automatización
      </PageTitle>
      <AutomationForm automation={automation} />
      <ExecutionHistory automationId={automation.id} />
    </div>
  );
}

function ExecutionHistory({ automationId }: { automationId: string }) {
  const { data } = useAutomationExecutions(automationId);

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Últimas ejecuciones
      </p>
      {!data || data.items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Todavía no se ha ejecutado.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((execution) => (
            <li
              key={execution.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-700"
            >
              <div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  {formatDateTime(execution.started_at)}
                </p>
                {execution.error && (
                  <p className="mt-0.5 text-red-600 dark:text-red-400">
                    {execution.error}
                  </p>
                )}
              </div>
              <Badge tone={STATUS_TONES[execution.status] ?? "neutral"}>
                {STATUS_LABELS[execution.status] ?? execution.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
