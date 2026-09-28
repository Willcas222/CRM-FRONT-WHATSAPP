"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageTitle } from "@/components/help/page-title";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge, Card, EmptyState, ErrorBanner, Spinner, FullPageSpinner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import {
  useCreateGuidanceService,
  useGuidanceServices,
  useUpdateGuidanceService,
  type GuidanceServiceOut,
} from "@/lib/hooks/spiritual";
import { useRequireSpiritualGuidanceVertical } from "./require-guidance";

export default function GuidancePage() {
  const isSpiritualGuidance = useRequireSpiritualGuidanceVertical();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const { data, isLoading } = useGuidanceServices();
  const [creating, setCreating] = useState(false);

  if (!isSpiritualGuidance) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <PageTitle
          topic="guidance"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Servicios de orientación
        </PageTitle>
        {canManage && <Button onClick={() => setCreating(true)}>Nuevo servicio</Button>}
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Sin servicios todavía"
            description="Crea el primero (una lectura, una limpieza, un acompañamiento…) para que el bot lo pueda ofrecer."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((service) => (
              <ServiceRow key={service.id} service={service} canManage={canManage} />
            ))}
          </ul>
        )}
      </Card>

      {creating && <CreateServiceModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function ServiceRow({
  service,
  canManage,
}: {
  service: GuidanceServiceOut;
  canManage: boolean;
}) {
  const update = useUpdateGuidanceService(service.id);

  return (
    <li className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{service.name}</p>
        {service.description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{service.description}</p>
        )}
        {service.estimated_duration_minutes && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Duración estimada: {service.estimated_duration_minutes} min
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!service.is_active && <Badge tone="neutral">Inactivo</Badge>}
        {canManage && (
          <button
            type="button"
            className="text-xs text-emerald-700 hover:underline dark:text-emerald-400"
            onClick={() => update.mutate({ is_active: !service.is_active })}
          >
            {service.is_active ? "Desactivar" : "Activar"}
          </button>
        )}
      </div>
    </li>
  );
}

const serviceSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre.").max(150),
  description: z.string().max(2000).optional(),
  estimated_duration_minutes: z.string().optional(),
});
type ServiceFormValues = z.infer<typeof serviceSchema>;

function CreateServiceModal({ onClose }: { onClose: () => void }) {
  const create = useCreateGuidanceService();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) });

  async function onSubmit(values: ServiceFormValues) {
    setError(null);
    try {
      await create.mutateAsync({
        name: values.name,
        description: values.description || null,
        estimated_duration_minutes: values.estimated_duration_minutes
          ? Number(values.estimated_duration_minutes)
          : null,
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo servicio">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>
        <div>
          <Label htmlFor="estimated_duration_minutes">Duración estimada en minutos (opcional)</Label>
          <Input
            id="estimated_duration_minutes"
            type="number"
            min={1}
            {...register("estimated_duration_minutes")}
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
