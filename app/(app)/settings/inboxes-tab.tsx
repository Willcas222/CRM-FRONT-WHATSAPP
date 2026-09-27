"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge, Card, ErrorBanner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import {
  useActivateInbox,
  useCreateInbox,
  useDeactivateInbox,
  useInboxes,
  useUpdateInbox,
} from "@/lib/hooks/inboxes";
import type { components } from "@/lib/api-schema";

export function InboxesTab() {
  const { data, isLoading } = useInboxes();
  const [createOpen, setCreateOpen] = useState(false);
  const [tokenInbox, setTokenInbox] = useState<
    components["schemas"]["InboxOut"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const deactivateInbox = useDeactivateInbox();
  const activateInbox = useActivateInbox();

  async function handleActivate(inboxId: string) {
    setError(null);
    try {
      await activateInbox.mutateAsync(inboxId);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo activar el canal.",
      );
    }
  }

  async function handleDeactivate(inboxId: string) {
    setError(null);
    try {
      await deactivateInbox.mutateAsync(inboxId);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "No se pudo desactivar el canal.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Nuevo canal</Button>
      </div>
      {error && <ErrorBanner message={error} />}
      <Card>
        {isLoading ? null : !data || data.items.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
            Sin canales todavía.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((inbox) => (
              <li
                key={inbox.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {inbox.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {inbox.display_phone_number} · token{" "}
                    {inbox.token_hint ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={inbox.status === "ACTIVE" ? "green" : "neutral"}>
                    {inbox.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setTokenInbox(inbox)}
                  >
                    Actualizar token
                  </Button>
                  {inbox.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeactivate(inbox.id)}
                    >
                      Desactivar
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleActivate(inbox.id)}>
                      Activar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <CreateInboxModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onError={setError}
      />
      <UpdateTokenModal
        inbox={tokenInbox}
        onClose={() => setTokenInbox(null)}
        onError={setError}
      />
    </div>
  );
}

const tokenSchema = z.object({
  access_token: z
    .string()
    .min(20, "El token de Meta tiene al menos 20 caracteres."),
});
type TokenFormValues = z.infer<typeof tokenSchema>;

function UpdateTokenModal({
  inbox,
  onClose,
  onError,
}: {
  inbox: components["schemas"]["InboxOut"] | null;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const updateInbox = useUpdateInbox(inbox?.id ?? "");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormValues>({ resolver: zodResolver(tokenSchema) });

  async function onSubmit(values: TokenFormValues) {
    onError(null);
    try {
      await updateInbox.mutateAsync({ access_token: values.access_token });
      reset();
      onClose();
    } catch (e) {
      onError(
        e instanceof ApiError ? e.message : "No se pudo actualizar el token.",
      );
    }
  }

  return (
    <Modal
      open={!!inbox}
      onClose={onClose}
      title={`Actualizar token · ${inbox?.name ?? ""}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          El token de prueba de Meta caduca cada 24 h. Pega aquí el nuevo (API
          Setup en el panel de Meta for Developers).
        </p>
        <div>
          <Label htmlFor="new_access_token">Nuevo token de acceso</Label>
          <Input
            id="new_access_token"
            error={errors.access_token?.message}
            {...register("access_token")}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const schema = z.object({
  name: z.string().min(1, "Ingresa un nombre."),
  phone_number_id: z.string().min(5, "Identificador de Meta (solo dígitos)."),
  display_phone_number: z.string().min(1, "Ingresa el número visible."),
  waba_id: z.string().optional(),
  access_token: z
    .string()
    .min(20, "El token de Meta tiene al menos 20 caracteres."),
});
type FormValues = z.infer<typeof schema>;

function CreateInboxModal({
  open,
  onClose,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const createInbox = useCreateInbox();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    onError(null);
    try {
      await createInbox.mutateAsync({
        ...values,
        waba_id: values.waba_id || null,
      });
      reset();
      onClose();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo crear el canal.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo canal de WhatsApp">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="phone_number_id">Phone Number ID (Meta)</Label>
          <Input
            id="phone_number_id"
            error={errors.phone_number_id?.message}
            {...register("phone_number_id")}
          />
        </div>
        <div>
          <Label htmlFor="display_phone_number">Número visible</Label>
          <Input
            id="display_phone_number"
            placeholder="+57 300 111 2233"
            error={errors.display_phone_number?.message}
            {...register("display_phone_number")}
          />
        </div>
        <div>
          <Label htmlFor="waba_id">WABA ID (opcional)</Label>
          <Input
            id="waba_id"
            error={errors.waba_id?.message}
            {...register("waba_id")}
          />
        </div>
        <div>
          <Label htmlFor="access_token">Token de acceso de Meta</Label>
          <Input
            id="access_token"
            error={errors.access_token?.message}
            {...register("access_token")}
          />
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
