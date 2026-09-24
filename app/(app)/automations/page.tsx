"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, ErrorBanner, FullPageSpinner, Spinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useAutomations, useDeleteAutomation, useUpdateAutomation } from "@/lib/hooks/automations";
import type { components } from "@/lib/api-schema";
import { useRequireManage } from "./require-manage";

type AutomationOut = components["schemas"]["AutomationOut"];

const TRIGGER_LABELS: Record<string, string> = {
  NEW_CONTACT: "Nuevo contacto",
  NEW_LEAD: "Nuevo lead",
  MESSAGE_RECEIVED: "Mensaje recibido",
  STAGE_CHANGED: "Cambio de etapa",
  LEAD_QUALIFIED: "Lead calificado",
  TIME_ELAPSED: "Tiempo transcurrido",
};

export default function AutomationsPage() {
  const canManage = useRequireManage();
  const { data, isLoading } = useAutomations();
  const [error, setError] = useState<string | null>(null);

  if (!canManage) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Automatizaciones</h1>
        <Link href="/automations/new">
          <Button>Nueva automatización</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="Sin automatizaciones todavía"
            description="Crea una para responder solas, cambiar de etapa o avisar a un agente cuando pase algo."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.map((automation) => (
              <AutomationRow key={automation.id} automation={automation} onError={setError} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function AutomationRow({
  automation,
  onError,
}: {
  automation: AutomationOut;
  onError: (message: string | null) => void;
}) {
  const updateAutomation = useUpdateAutomation(automation.id);
  const deleteAutomation = useDeleteAutomation();

  async function toggleActive() {
    onError(null);
    try {
      await updateAutomation.mutateAsync({ is_active: !automation.is_active });
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`¿Eliminar la automatización «${automation.name}»?`)) return;
    onError(null);
    try {
      await deleteAutomation.mutateAsync(automation.id);
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo eliminar.");
    }
  }

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <Link href={`/automations/${automation.id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{automation.name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {TRIGGER_LABELS[automation.trigger_type] ?? automation.trigger_type} · {automation.steps.length}{" "}
          {automation.steps.length === 1 ? "paso" : "pasos"}
        </p>
      </Link>
      <div className="flex items-center gap-3">
        <Badge tone={automation.is_active ? "green" : "neutral"}>
          {automation.is_active ? "Activa" : "Inactiva"}
        </Badge>
        <Button size="sm" variant="secondary" onClick={toggleActive} loading={updateAutomation.isPending}>
          {automation.is_active ? "Desactivar" : "Activar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} loading={deleteAutomation.isPending}>
          Eliminar
        </Button>
      </div>
    </li>
  );
}
