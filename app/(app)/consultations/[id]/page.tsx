"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge, Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useContact } from "@/lib/hooks/contacts";
import {
  useAssignGuide,
  useChangeConsultationStatus,
  useConsultation,
  useConsultationHistory,
  useGuidanceServices,
  useSetConsultationDetails,
  type ConsultationStatus,
} from "@/lib/hooks/spiritual";
import { useUsers } from "@/lib/hooks/users";
import {
  CONSULTATION_STATUS_LABEL,
  CONSULTATION_STATUS_TONE,
  CONSULTATION_STATUSES,
} from "@/lib/spiritual-labels";
import { formatDateTime } from "@/lib/utils";
import { useRequireConsultationsVertical } from "../require-consultations";

export default function ConsultationDetailPage() {
  const canSeeConsultations = useRequireConsultationsVertical();
  const { id } = useParams<{ id: string }>();
  const consultation = useConsultation(id);
  const history = useConsultationHistory(id);
  const contact = useContact(consultation.data?.contact_id);
  const { data: services } = useGuidanceServices();

  if (!canSeeConsultations || consultation.isLoading) return <FullPageSpinner />;
  if (consultation.error || !consultation.data) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <ErrorBanner message="No se encontró la consulta." />
        <Link
          href="/consultations"
          className="mt-4 inline-block text-sm text-emerald-700 dark:text-emerald-400"
        >
          ← Volver a consultas
        </Link>
      </div>
    );
  }

  const data = consultation.data;
  const serviceName = services?.items.find((s) => s.id === data.service_id)?.name;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link href="/consultations" className="text-sm text-emerald-700 dark:text-emerald-400">
        ← Consultas
      </Link>

      <div className="mt-2 mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {contact.data ? (
              <Link href={`/contacts/${contact.data.id}`} className="hover:underline">
                {contact.data.name || contact.data.phone}
              </Link>
            ) : (
              "…"
            )}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatDateTime(data.created_at)}
          </p>
        </div>
        <Badge tone={CONSULTATION_STATUS_TONE[data.status]}>
          {CONSULTATION_STATUS_LABEL[data.status]}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card className="space-y-2 p-5 text-sm">
          {serviceName && (
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Servicio: </span>
              {serviceName}
            </p>
          )}
          {data.emotional_context && (
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Contexto: </span>
              {data.emotional_context}
            </p>
          )}
          {data.scheduled_at && (
            <p>
              <span className="text-zinc-500 dark:text-zinc-400">Agendada para: </span>
              {formatDateTime(data.scheduled_at)}
            </p>
          )}
          {!serviceName && !data.emotional_context && !data.scheduled_at && (
            <p className="text-zinc-400">Sin detalles todavía.</p>
          )}
        </Card>

        <StatusChanger consultationId={data.id} currentStatus={data.status} />
        <GuideCard consultationId={data.id} guideId={data.assigned_guide_id} />
        <DetailsCard
          consultationId={data.id}
          serviceId={data.service_id}
          scheduledAt={data.scheduled_at}
          notes={data.notes}
        />

        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Historial
          </h2>
          {history.isLoading ? (
            <p className="text-sm text-zinc-400">Cargando…</p>
          ) : !history.data || history.data.items.length === 0 ? (
            <p className="text-sm text-zinc-400">Sin cambios todavía.</p>
          ) : (
            <ul className="space-y-3">
              {history.data.items.map((event, i) => (
                <li key={i} className="text-sm">
                  <p className="text-zinc-800 dark:text-zinc-200">
                    {event.previous_status
                      ? `${CONSULTATION_STATUS_LABEL[event.previous_status]} → `
                      : ""}
                    <strong>{CONSULTATION_STATUS_LABEL[event.new_status]}</strong>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(event.created_at)}
                    {event.reason ? ` · ${event.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusChanger({
  consultationId,
  currentStatus,
}: {
  consultationId: string;
  currentStatus: ConsultationStatus;
}) {
  const mutation = useChangeConsultationStatus(consultationId);
  const [target, setTarget] = useState<ConsultationStatus | "">("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange() {
    if (!target) return;
    setError(null);
    try {
      await mutation.mutateAsync({ status: target });
      setTarget("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cambiar estado</h2>
      {error && <ErrorBanner message={error} />}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="new-status">Nuevo estado</Label>
          <Select
            id="new-status"
            value={target}
            onChange={(e) => setTarget(e.target.value as ConsultationStatus | "")}
          >
            <option value="">Selecciona…</option>
            {CONSULTATION_STATUSES.filter((s) => s !== currentStatus).map((s) => (
              <option key={s} value={s}>
                {CONSULTATION_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <Button disabled={!target} loading={mutation.isPending} onClick={handleChange}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}

function GuideCard({
  consultationId,
  guideId,
}: {
  consultationId: string;
  guideId: string | null;
}) {
  const { data: users } = useUsers();
  const mutation = useAssignGuide(consultationId);
  const [selected, setSelected] = useState(guideId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await mutation.mutateAsync({ guide_id: selected || null });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo asignar el guía.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Guía asignado</h2>
      {error && <ErrorBanner message={error} />}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Sin asignar</option>
            {users?.items.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </div>
        <Button loading={mutation.isPending} onClick={submit}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}

function DetailsCard({
  consultationId,
  serviceId,
  scheduledAt,
  notes,
}: {
  consultationId: string;
  serviceId: string | null;
  scheduledAt: string | null;
  notes: string | null;
}) {
  const { data: services } = useGuidanceServices();
  const active = (services?.items ?? []).filter((s) => s.is_active);
  const mutation = useSetConsultationDetails(consultationId);
  const [selectedService, setSelectedService] = useState(serviceId ?? "");
  const [scheduled, setScheduled] = useState(scheduledAt ? scheduledAt.slice(0, 16) : "");
  const [notesValue, setNotesValue] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await mutation.mutateAsync({
        service_id: selectedService || null,
        scheduled_at: scheduled ? new Date(scheduled).toISOString() : null,
        notes: notesValue || null,
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudieron guardar los detalles.");
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Servicio, fecha y notas
      </h2>
      {error && <ErrorBanner message={error} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="d-service">Servicio</Label>
          <Select
            id="d-service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">Sin definir</option>
            {active.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="d-scheduled">Fecha agendada</Label>
          <Input
            id="d-scheduled"
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="d-notes">Notas</Label>
        <Textarea
          id="d-notes"
          rows={3}
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button loading={mutation.isPending} onClick={submit}>
          Guardar
        </Button>
      </div>
    </Card>
  );
}
