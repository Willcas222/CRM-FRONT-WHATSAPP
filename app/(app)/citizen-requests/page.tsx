"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  CITIZEN_REQUEST_STATUS_LABEL,
  CITIZEN_REQUEST_STATUS_TONE,
  CITIZEN_REQUEST_STATUSES,
  CITIZEN_REQUEST_TYPE_LABEL,
  CITIZEN_REQUEST_TYPES,
} from "@/lib/campaign-labels";
import { ApiError } from "@/lib/auth-context";
import { useContacts, useContactsLookup } from "@/lib/hooks/contacts";
import {
  useCitizenRequests,
  useCreateCitizenRequest,
  type CitizenRequestStatus,
  type CitizenRequestType,
} from "@/lib/hooks/campaign";
import { formatDateTime } from "@/lib/utils";
import { useRequireCampaignVertical } from "../campaign/require-campaign";

export default function CitizenRequestsPage() {
  const isCampaign = useRequireCampaignVertical();
  const [status, setStatus] = useState<CitizenRequestStatus | "">("");
  const [type, setType] = useState<CitizenRequestType | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useCitizenRequests({
    status: status || undefined,
    type: type || undefined,
  });
  const contactsById = useContactsLookup().data;

  if (!isCampaign) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="citizen-requests"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Solicitudes ciudadanas
        </PageTitle>
        <Button onClick={() => setCreateOpen(true)}>Nueva solicitud</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-40">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as CitizenRequestStatus | "")}
          >
            <option value="">Todos los estados</option>
            {CITIZEN_REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CITIZEN_REQUEST_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-48">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as CitizenRequestType | "")}
          >
            <option value="">Todos los tipos</option>
            {CITIZEN_REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {CITIZEN_REQUEST_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin solicitudes"
            description="Aquí aparecerán las quejas, ideas y peticiones que registre el bot o tu equipo."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/citizen-requests/${request.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {request.subject}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {request.radicado} ·{" "}
                      {CITIZEN_REQUEST_TYPE_LABEL[request.type]} ·{" "}
                      {contactsById?.get(request.contact_id)?.name ||
                        contactsById?.get(request.contact_id)?.phone ||
                        "…"}{" "}
                      · {formatDateTime(request.created_at)}
                    </p>
                  </div>
                  <Badge tone={CITIZEN_REQUEST_STATUS_TONE[request.status]}>
                    {CITIZEN_REQUEST_STATUS_LABEL[request.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

const schema = z.object({
  contact_id: z.string().min(1, "Selecciona un contacto."),
  type: z.enum([
    "COMPLAINT",
    "CLAIM",
    "IDEA",
    "REQUEST",
    "HELP",
    "MEETING_REQUEST",
    "OTHER",
  ]),
  subject: z.string().min(1, "Escribe el asunto.").max(200),
  description: z.string().max(2000).optional(),
});
type FormValues = z.infer<typeof schema>;

function CreateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useCreateCitizenRequest();
  const [contactQuery, setContactQuery] = useState("");
  const { data: contacts } = useContacts(contactQuery);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const request = await create.mutateAsync({
        contact_id: values.contact_id,
        type: values.type,
        subject: values.subject,
        description: values.description || null,
      });
      onClose();
      router.push(`/citizen-requests/${request.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva solicitud ciudadana">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Select error={errors.contact_id?.message} {...register("contact_id")}>
            <option value="">Selecciona…</option>
            {contacts?.items.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name || contact.phone}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select id="type" error={errors.type?.message} {...register("type")}>
            {CITIZEN_REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {CITIZEN_REQUEST_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="subject">Asunto</Label>
          <Input id="subject" error={errors.subject?.message} {...register("subject")} />
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            rows={4}
            error={errors.description?.message}
            {...register("description")}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
