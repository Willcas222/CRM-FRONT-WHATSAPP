"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import {
  useContact,
  useContactHistory,
  useUpdateContact,
} from "@/lib/hooks/contacts";
import { formatDateTime } from "@/lib/utils";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("Correo no válido.").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const EVENT_LABELS: Record<string, string> = {
  LEAD_CREATED: "Se creó un lead",
  LEAD_UPDATED: "Se actualizó el lead",
  CONTACT_INFO_SAVED: "Se guardaron datos del contacto",
  STAGE_CHANGED: "Cambió de etapa",
  AGENT_ASSIGNED: "Se asignó un agente",
  STATUS_CHANGED: "Cambió el estado",
  LEAD_QUALIFIED: "El lead se calificó",
  HANDOFF_REQUESTED: "Se pidió pasar a una persona",
  CONVERSATION_TAKEN: "Un agente tomó la conversación",
  CONVERSATION_RELEASED: "La conversación volvió al bot",
  TASK_CREATED: "Se creó una tarea",
  LEAD_CLOSED: "El lead se cerró",
};

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: contact, isLoading } = useContact(params.id);
  const { data: history } = useContactHistory(params.id);
  const updateContact = useUpdateContact(params.id);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (contact)
      reset({ name: contact.name ?? "", email: contact.email ?? "" });
  }, [contact, reset]);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await updateContact.mutateAsync({
        name: values.name || null,
        email: values.email || null,
      });
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "No se pudieron guardar los cambios.",
      );
    }
  }

  if (isLoading || !contact) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/contacts"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Contactos
        </Link>
        <PageTitle
          topic="contact-detail"
          className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {contact.name || contact.phone}
        </PageTitle>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Datos
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}
          <div>
            <Label>Teléfono</Label>
            <Input value={contact.phone} disabled />
          </div>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>

      {contact.open_lead && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Lead abierto
            </h2>
            <Badge tone="green">{contact.open_lead.status}</Badge>
          </div>
          <Link
            href={`/leads/${contact.open_lead.id}`}
            className="mt-2 block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {contact.open_lead.title}
          </Link>
        </Card>
      )}

      {contact.conversations.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Conversaciones
          </h2>
          <ul className="space-y-2">
            {contact.conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/inbox?c=${conversation.id}`}
                  className="flex items-center justify-between text-sm text-zinc-700 hover:underline dark:text-zinc-300"
                >
                  <span>{formatDateTime(conversation.last_message_at)}</span>
                  <Badge>{conversation.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Historial comercial
        </h2>
        {!history || history.items.length === 0 ? (
          <EmptyState title="Sin actividad todavía" />
        ) : (
          <ul className="space-y-3">
            {history.items.map((event) => (
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
