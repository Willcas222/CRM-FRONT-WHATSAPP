"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, EmptyState, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import { useContacts, useCreateContact } from "@/lib/hooks/contacts";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  phone: z.string().min(6, "Ingresa un número válido, con indicativo (+57...)."),
  name: z.string().optional(),
  email: z.string().email("Correo no válido.").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function ContactsPage() {
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useContacts(q);
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Contactos</h1>
        <Button onClick={() => setCreateOpen(true)}>Nuevo contacto</Button>
      </div>

      <Input
        placeholder="Buscar por nombre, teléfono o correo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        {isLoading ? (
          <FullPageSpinner />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin contactos todavía"
            description="Los contactos también se crean solos cuando un cliente escribe por WhatsApp."
          />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Correo</th>
                <th className="px-4 py-2 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.items.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                    {contact.name || <span className="text-zinc-400">Sin nombre</span>}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{contact.phone}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                    {contact.email || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                    {formatDate(contact.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {data?.has_more && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Hay más contactos; refina la búsqueda para verlos.
        </p>
      )}

      <CreateContactModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function CreateContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const createContact = useCreateContact();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const contact = await createContact.mutateAsync({
        phone: values.phone,
        name: values.name || null,
        email: values.email || null,
      });
      reset();
      onClose();
      router.push(`/contacts/${contact.id}`);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "No se pudo crear el contacto.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo contacto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <ErrorBanner message={serverError} />}
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+573001112233"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" error={errors.email?.message} {...register("email")} />
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
