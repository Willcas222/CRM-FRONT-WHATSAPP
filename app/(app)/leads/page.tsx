"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge, Card, EmptyState, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import { useContacts, useContactsLookup } from "@/lib/hooks/contacts";
import { useCreateLead, useLeads, type LeadFilters } from "@/lib/hooks/leads";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  BOT_ACTIVE: "Bot activo",
  HUMAN_PENDING: "En cola",
  HUMAN_ASSIGNED: "Con un agente",
  CLOSED_WON: "Ganado",
  CLOSED_LOST: "Perdido",
};

const STATUS_TONES: Record<string, "neutral" | "green" | "amber" | "red" | "blue"> = {
  BOT_ACTIVE: "blue",
  HUMAN_PENDING: "amber",
  HUMAN_ASSIGNED: "neutral",
  CLOSED_WON: "green",
  CLOSED_LOST: "red",
};

export default function LeadsPage() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useLeads(filters);
  const { data: contactsById } = useContactsLookup();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Leads</h1>
        <Button onClick={() => setCreateOpen(true)}>Nuevo lead</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por título o contacto…"
          value={filters.q ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="max-w-xs"
        />
        <Select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value || undefined) as LeadFilters["status"],
            }))
          }
          className="max-w-[180px]"
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <FullPageSpinner />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="Sin leads todavía" />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Título</th>
                <th className="px-4 py-2 font-medium">Contacto</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.items.map((lead) => {
                const contact = contactsById?.get(lead.contact_id);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  >
                    <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {lead.title}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                      {contact?.name || contact?.phone || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_TONES[lead.status]}>
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      {data?.has_more && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Hay más leads; refina la búsqueda para verlos.
        </p>
      )}

      <CreateLeadModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

const createSchema = z.object({
  contact_id: z.string().min(1, "Selecciona un contacto."),
  title: z.string().optional(),
});
type CreateFormValues = z.infer<typeof createSchema>;

function CreateLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const createLead = useCreateLead();
  const [contactQuery, setContactQuery] = useState("");
  const { data: contacts } = useContacts(contactQuery);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

  async function onSubmit(values: CreateFormValues) {
    setServerError(null);
    try {
      const lead = await createLead.mutateAsync({
        contact_id: values.contact_id,
        title: values.title || null,
        source: "MANUAL",
      });
      reset();
      onClose();
      router.push(`/leads/${lead.id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "No se pudo crear el lead.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo lead">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <ErrorBanner message={serverError} />}
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
          <Label htmlFor="title">Título (opcional)</Label>
          <Input id="title" error={errors.title?.message} {...register("title")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Crear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
