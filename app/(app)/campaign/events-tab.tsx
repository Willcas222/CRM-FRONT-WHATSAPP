"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, EmptyState, ErrorBanner, Spinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import {
  useCampaignEvents,
  useCreateCampaignEvent,
  useDeleteCampaignEvent,
  useUpdateCampaignEvent,
  type CampaignEventOut,
} from "@/lib/hooks/campaign";
import { formatDateTime } from "@/lib/utils";

/** ISO -> valor de `<input type="datetime-local">` en hora local. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function EventsTab({ canManage }: { canManage: boolean }) {
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const { data, isLoading } = useCampaignEvents({ upcomingOnly });
  const deleteEvent = useDeleteCampaignEvent();
  const [editing, setEditing] = useState<CampaignEventOut | "new" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(event: CampaignEventOut) {
    if (!window.confirm(`¿Eliminar «${event.title}»?`)) return;
    setError(null);
    try {
      await deleteEvent.mutateAsync(event.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo eliminar.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Solo próximos
        </label>
        {canManage && (
          <Button size="sm" onClick={() => setEditing("new")}>
            Nuevo evento
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin eventos"
            description="Crea uno para anunciarlo a los ciudadanos."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {event.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(event.starts_at)}
                    {event.location ? ` · ${event.location}` : ""}
                    {!event.is_public ? " · Privado" : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(event)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={deleteEvent.isPending}
                      onClick={() => handleDelete(event)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {editing && (
        <EventModal
          event={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

const schema = z.object({
  title: z.string().min(1, "Ingresa un título.").max(200),
  starts_at: z.string().min(1, "Elige fecha y hora."),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  is_public: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function EventModal({
  event,
  onClose,
}: {
  event: CampaignEventOut | null;
  onClose: () => void;
}) {
  const create = useCreateCampaignEvent();
  const update = useUpdateCampaignEvent(event?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({
      title: event?.title ?? "",
      starts_at: event ? toLocalInput(event.starts_at) : "",
      description: event?.description ?? "",
      location: event?.location ?? "",
      is_public: event?.is_public ?? true,
    });
  }, [event, reset]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const body = {
        title: values.title,
        starts_at: new Date(values.starts_at).toISOString(),
        description: values.description || null,
        location: values.location || null,
        is_public: values.is_public,
      };
      if (event) await update.mutateAsync(body);
      else await create.mutateAsync(body);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <Modal open onClose={onClose} title={event ? "Editar evento" : "Nuevo evento"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" error={errors.title?.message} {...register("title")} />
        </div>
        <div>
          <Label htmlFor="starts_at">Fecha y hora</Label>
          <Input
            id="starts_at"
            type="datetime-local"
            error={errors.starts_at?.message}
            {...register("starts_at")}
          />
        </div>
        <div>
          <Label htmlFor="location">Lugar (opcional)</Label>
          <Input id="location" error={errors.location?.message} {...register("location")} />
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("is_public")} />
          Público
        </label>
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
