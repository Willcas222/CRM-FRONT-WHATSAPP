"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
  Spinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import { useContacts, useContactsLookup } from "@/lib/hooks/contacts";
import {
  useConsultations,
  useGuidanceServices,
  useRequestConsultation,
  type ConsultationStatus,
} from "@/lib/hooks/spiritual";
import {
  CONSULTATION_STATUS_LABEL,
  CONSULTATION_STATUS_TONE,
  CONSULTATION_STATUSES,
} from "@/lib/spiritual-labels";
import { formatDateTime } from "@/lib/utils";
import { useRequireConsultationsVertical } from "./require-consultations";

export default function ConsultationsPage() {
  const canSeeConsultations = useRequireConsultationsVertical();
  const [status, setStatus] = useState<ConsultationStatus | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useConsultations({ status: status || undefined });
  const contactsById = useContactsLookup().data;

  if (!canSeeConsultations) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="consultations"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Consultas
        </PageTitle>
        <Button onClick={() => setCreateOpen(true)}>Nueva consulta</Button>
      </div>

      <div className="mb-4 w-48">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as ConsultationStatus | "")}
        >
          <option value="">Todos los estados</option>
          {CONSULTATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CONSULTATION_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin consultas"
            description="Aquí aparecerán las consultas que registre el bot o tu equipo."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((consultation) => (
              <li key={consultation.id}>
                <Link
                  href={`/consultations/${consultation.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {contactsById?.get(consultation.contact_id)?.name ||
                        contactsById?.get(consultation.contact_id)?.phone ||
                        "…"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(consultation.created_at)}
                    </p>
                  </div>
                  <Badge tone={CONSULTATION_STATUS_TONE[consultation.status]}>
                    {CONSULTATION_STATUS_LABEL[consultation.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {createOpen && <CreateConsultationModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function CreateConsultationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useRequestConsultation();
  const { data: services } = useGuidanceServices();
  const active = (services?.items ?? []).filter((s) => s.is_active);
  const [contactQuery, setContactQuery] = useState("");
  const { data: contacts } = useContacts(contactQuery);
  const [contactId, setContactId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [emotionalContext, setEmotionalContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setError(null);
    if (!contactId) {
      setError("Selecciona un contacto.");
      return;
    }
    setSubmitting(true);
    try {
      const consultation = await create.mutateAsync({
        contact_id: contactId,
        service_id: serviceId || null,
        emotional_context: emotionalContext || null,
      });
      onClose();
      router.push(`/consultations/${consultation.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar la consulta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva consulta">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="contact_search">Contacto</Label>
          <Input
            id="contact_search"
            placeholder="Buscar contacto…"
            value={contactQuery}
            onChange={(e) => setContactQuery(e.target.value)}
            className="mb-2"
          />
          <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">Selecciona…</option>
            {contacts?.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.phone}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="service_id">Servicio (opcional)</Label>
          <Select id="service_id" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            <option value="">Sin definir todavía</option>
            {active.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="emotional_context">Contexto (opcional)</Label>
          <Textarea
            id="emotional_context"
            rows={3}
            value={emotionalContext}
            onChange={(e) => setEmotionalContext(e.target.value)}
            placeholder="Lo que la persona compartió, en sus propias palabras."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" loading={submitting} onClick={submit}>
            Registrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
