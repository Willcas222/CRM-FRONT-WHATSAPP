"use client";

import Link from "next/link";

import { PageTitle } from "@/components/help/page-title";
import { Badge, Card, EmptyState, FullPageSpinner } from "@/components/ui/misc";
import { useConversations } from "@/lib/hooks/conversations";
import { useDefaultPipeline } from "@/lib/hooks/pipelines";
import { usePipelineLeads } from "@/lib/hooks/leads";
import { useContactsLookup } from "@/lib/hooks/contacts";
import { useAuth } from "@/lib/auth-context";

function StatCard({
  label,
  value,
  approx,
  tone,
}: {
  label: string;
  value: number;
  approx?: boolean;
  tone?: "amber" | "blue";
}) {
  return (
    <Card
      className={`overflow-hidden border-l-4 p-5 ${tone === "amber" ? "border-l-amber-400" : tone === "blue" ? "border-l-sky-400" : "border-l-emerald-500"}`}
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold ${tone === "amber" ? "text-amber-600 dark:text-amber-400" : tone === "blue" ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}
      >
        {value}
        {approx ? "+" : ""}
      </p>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: pipeline, isLoading: pipelineLoading } = useDefaultPipeline();
  const { data: leads, isLoading: leadsLoading } = usePipelineLeads(
    pipeline?.id,
  );
  const { data: pending, isLoading: pendingLoading } = useConversations({
    status: "HUMAN_PENDING",
  });
  const { data: mine, isLoading: mineLoading } = useConversations({
    assignedTo: "me",
  });
  const { data: complete } = useConversations({ data: "complete" });
  const { data: missing } = useConversations({ data: "missing" });
  const { data: contactsById, isLoading: contactsLoading } =
    useContactsLookup();

  const loading =
    pipelineLoading ||
    leadsLoading ||
    pendingLoading ||
    mineLoading ||
    contactsLoading;

  if (loading) return <FullPageSpinner />;

  const openLeads = (leads ?? []).filter(
    (lead) => lead.status !== "CLOSED_WON" && lead.status !== "CLOSED_LOST",
  );
  const stageCounts = new Map<string, number>();
  for (const lead of openLeads) {
    stageCounts.set(lead.stage_id, (stageCounts.get(lead.stage_id) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div>
        <PageTitle
          topic="dashboard"
          className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Hola, {user?.name.split(" ")[0]}
        </PageTitle>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Resumen de tu cuenta
          {(contactsById?.size ?? 0) >= 1000 || (leads?.length ?? 0) >= 500
            ? " (algunos números son un mínimo: hay más de los que se muestran)"
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Contactos"
          value={contactsById?.size ?? 0}
          approx={contactsById?.size === 1000}
        />
        <StatCard
          label="Leads abiertos"
          value={openLeads.length}
          approx={(leads?.length ?? 0) >= 500}
        />
        <StatCard
          label="Conversaciones en cola"
          value={pending?.items.length ?? 0}
          tone="amber"
        />
        <StatCard
          label="Mis conversaciones"
          value={mine?.items.length ?? 0}
          tone="blue"
        />
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Datos que reúne el bot
          </h2>
          <Link
            href="/inbox?data=missing"
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
          >
            Ver los que faltan
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Con todos los datos"
            value={complete?.items.length ?? 0}
            approx={Boolean(complete?.next_cursor)}
          />
          <StatCard
            label="Les faltan datos"
            value={missing?.items.length ?? 0}
            approx={Boolean(missing?.next_cursor)}
            tone="amber"
          />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Leads abiertos por etapa
          </h2>
          <Link
            href="/pipeline"
            className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
          >
            Ver Kanban
          </Link>
        </div>
        {pipeline &&
        pipeline.stages.filter((s) => s.type === "OPEN").length > 0 ? (
          <ul className="space-y-2">
            {pipeline.stages
              .filter((stage) => stage.type === "OPEN")
              .map((stage) => (
                <li
                  key={stage.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {stage.name}
                  </span>
                  <Badge>{stageCounts.get(stage.id) ?? 0}</Badge>
                </li>
              ))}
          </ul>
        ) : (
          <EmptyState title="Sin etapas abiertas todavía" />
        )}
      </Card>

      {pending && pending.items.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Esperando a una persona
            </h2>
            <Link
              href="/inbox"
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
            >
              Ir a la bandeja
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {pending.items.slice(0, 5).map((conversation) => (
              <li
                key={conversation.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {conversation.contact.name || conversation.contact.phone}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {conversation.handoff_reason ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
