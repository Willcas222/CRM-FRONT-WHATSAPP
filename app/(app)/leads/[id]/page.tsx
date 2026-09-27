"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useContact } from "@/lib/hooks/contacts";
import {
  useAssignLead,
  useCloseLead,
  useLead,
  useLeadEvents,
  useMoveLead,
} from "@/lib/hooks/leads";
import { usePipelines } from "@/lib/hooks/pipelines";
import { useUsers } from "@/lib/hooks/users";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  BOT_ACTIVE: "Bot activo",
  HUMAN_PENDING: "En cola",
  HUMAN_ASSIGNED: "Con un agente",
  CLOSED_WON: "Ganado",
  CLOSED_LOST: "Perdido",
};

const EVENT_LABELS: Record<string, string> = {
  LEAD_CREATED: "Se creó el lead",
  LEAD_UPDATED: "Se actualizó",
  CONTACT_INFO_SAVED: "Se guardaron datos del contacto",
  STAGE_CHANGED: "Cambió de etapa",
  AGENT_ASSIGNED: "Se asignó un agente",
  STATUS_CHANGED: "Cambió el estado",
  LEAD_QUALIFIED: "Se calificó",
  HANDOFF_REQUESTED: "Se pidió pasar a una persona",
  CONVERSATION_TAKEN: "Un agente tomó la conversación",
  CONVERSATION_RELEASED: "La conversación volvió al bot",
  TASK_CREATED: "Se creó una tarea",
  LEAD_CLOSED: "Se cerró el lead",
};

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(params.id);
  const { data: contact } = useContact(lead?.contact_id);
  const { data: events } = useLeadEvents(params.id);
  const { data: pipelines } = usePipelines();
  const { data: users } = useUsers();
  const moveLead = useMoveLead();
  const closeLead = useCloseLead(params.id);
  const assignLead = useAssignLead(params.id);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !lead) return <FullPageSpinner />;

  const pipeline = pipelines?.items.find((p) => p.id === lead.pipeline_id);
  const isOpen = lead.status !== "CLOSED_WON" && lead.status !== "CLOSED_LOST";

  async function handleMove(stageId: string) {
    setError(null);
    try {
      await moveLead.mutateAsync({ leadId: lead!.id, stage_id: stageId });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo mover el lead.");
    }
  }

  async function handleClose(outcome: "WON" | "LOST") {
    setError(null);
    try {
      await closeLead.mutateAsync({ outcome });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo cerrar el lead.",
      );
    }
  }

  async function handleAssign(agentId: string) {
    setError(null);
    try {
      await assignLead.mutateAsync({ agent_id: agentId || null });
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo asignar el lead.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/leads"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Leads
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <PageTitle
            topic="lead-detail"
            className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {lead.title}
          </PageTitle>
          <Badge
            tone={
              isOpen ? "blue" : lead.status === "CLOSED_WON" ? "green" : "red"
            }
          >
            {STATUS_LABELS[lead.status] ?? lead.status}
          </Badge>
        </div>
        {contact && (
          <Link
            href={`/contacts/${contact.id}`}
            className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {contact.name || contact.phone}
          </Link>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Etapa
        </h2>
        {pipeline ? (
          <div className="flex flex-wrap gap-2">
            {pipeline.stages.map((stage) => (
              <button
                key={stage.id}
                disabled={
                  !isOpen || stage.id === lead.stage_id || moveLead.isPending
                }
                onClick={() => handleMove(stage.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  stage.id === lead.stage_id
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        ) : (
          <FullPageSpinner />
        )}

        {isOpen && (
          <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleClose("WON")}
            >
              Marcar como ganado
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleClose("LOST")}
            >
              Marcar como perdido
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Responsable
        </h2>
        <Select
          value={lead.assigned_agent_id ?? ""}
          onChange={(e) => handleAssign(e.target.value)}
          className="max-w-xs"
        >
          <option value="">Sin asignar</option>
          {users?.items.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Historial
        </h2>
        {!events || events.items.length === 0 ? (
          <EmptyState title="Sin actividad todavía" />
        ) : (
          <ul className="space-y-3">
            {events.items.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {EVENT_LABELS[event.type] ?? event.type}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(event.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
