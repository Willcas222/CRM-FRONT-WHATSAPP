"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import Link from "next/link";
import { useState } from "react";

import {
  Badge,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useContactsLookup } from "@/lib/hooks/contacts";
import { useMoveLead, usePipelineLeads } from "@/lib/hooks/leads";
import { useDefaultPipeline } from "@/lib/hooks/pipelines";
import type { components } from "@/lib/api-schema";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/help/page-title";

type LeadOut = components["schemas"]["LeadOut"];
type StageOut = components["schemas"]["StageOut"];

const STAGE_TONE: Record<StageOut["type"], "neutral" | "green" | "red"> = {
  OPEN: "neutral",
  WON: "green",
  LOST: "red",
};

export default function PipelinePage() {
  const { data: pipeline, isLoading: pipelineLoading } = useDefaultPipeline();
  const { data: leads, isLoading: leadsLoading } = usePipelineLeads(
    pipeline?.id,
  );
  const { data: contactsById } = useContactsLookup();
  const moveLead = useMoveLead();
  const [error, setError] = useState<string | null>(null);
  const [activeLead, setActiveLead] = useState<LeadOut | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // Táctil: hay que mantener pulsado; un deslizamiento normal desplaza el tablero
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  if (pipelineLoading || leadsLoading) return <FullPageSpinner />;
  if (!pipeline) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          title="Sin pipeline"
          description="Crea un pipeline en Configuración."
        />
      </div>
    );
  }

  const leadsByStage = new Map<string, LeadOut[]>();
  for (const lead of leads ?? []) {
    const list = leadsByStage.get(lead.stage_id) ?? [];
    list.push(lead);
    leadsByStage.set(lead.stage_id, list);
  }

  function handleDragStart(event: DragStartEvent) {
    const lead = (leads ?? []).find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;
    const lead = (leads ?? []).find((l) => l.id === active.id);
    const targetStageId = String(over.id);
    if (!lead || lead.stage_id === targetStageId) return;

    setError(null);
    try {
      await moveLead.mutateAsync({ leadId: lead.id, stage_id: targetStageId });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo mover el lead.");
    }
  }

  return (
    <div className="flex h-full flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="pipeline"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {pipeline.name}
        </PageTitle>
        {error && <ErrorBanner message={error} />}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {pipeline.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage.get(stage.id) ?? []}
              contactsById={contactsById}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead && (
            <LeadCardContent
              lead={activeLead}
              contactName={contactsById?.get(activeLead.contact_id)?.name}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function StageColumn({
  stage,
  leads,
  contactsById,
}: {
  stage: StageOut;
  leads: LeadOut[];
  contactsById: Map<string, components["schemas"]["ContactOut"]> | undefined;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[82vw] shrink-0 flex-col rounded-xl border sm:w-72 bg-zinc-100/60 dark:bg-zinc-900/60",
        isOver
          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
          : "border-transparent",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {stage.name}
          </span>
          <Badge tone={STAGE_TONE[stage.type]}>{leads.length}</Badge>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {leads.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            contactName={contactsById?.get(lead.contact_id)?.name}
            locked={stage.type !== "OPEN"}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableLeadCard({
  lead,
  contactName,
  locked,
}: {
  lead: LeadOut;
  contactName: string | null | undefined;
  locked: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead.id,
      disabled: locked,
    });

  return (
    <div
      ref={setNodeRef}
      {...(locked ? {} : listeners)}
      {...attributes}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(isDragging && "opacity-40")}
    >
      <Link
        href={`/leads/${lead.id}`}
        className={cn(
          "block",
          locked ? "cursor-pointer" : "cursor-grab active:cursor-grabbing",
        )}
      >
        <LeadCardContent lead={lead} contactName={contactName} />
      </Link>
    </div>
  );
}

function LeadCardContent({
  lead,
  contactName,
}: {
  lead: LeadOut;
  contactName?: string | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="font-medium text-zinc-900 dark:text-zinc-100">
        {lead.title}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        {contactName || "—"}
      </p>
    </div>
  );
}
