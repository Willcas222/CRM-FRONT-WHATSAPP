"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import { useCandidateProfile, useUpdateCandidateProfile } from "@/lib/hooks/campaign";
import { formatDateTime } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Ingresa el nombre.").max(150),
  role: z.string().max(150).optional(),
  bio: z.string().max(4000).optional(),
});
type FormValues = z.infer<typeof schema>;

export function ProfileTab({ canManage }: { canManage: boolean }) {
  const { data: profile, isLoading } = useCandidateProfile();
  const updateProfile = useUpdateCandidateProfile();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({
      name: profile?.name ?? "",
      role: profile?.role ?? "",
      bio: profile?.bio ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const updated = await updateProfile.mutateAsync({
        name: values.name,
        role: values.role || null,
        bio: values.bio || null,
      });
      reset({
        name: updated.name,
        role: updated.role ?? "",
        bio: updated.bio ?? "",
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  if (isLoading) return <FullPageSpinner />;

  return (
    <Card className="p-5">
      <h2 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Perfil del candidato
      </h2>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Esto es lo que el bot cuenta a los ciudadanos cuando preguntan quién es
        el candidato.
        {profile && ` Última actualización: ${formatDateTime(profile.updated_at)}.`}
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg space-y-4"
      >
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            disabled={!canManage}
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
        <div>
          <Label htmlFor="role">Cargo o aspiración</Label>
          <Input
            id="role"
            placeholder="Por ejemplo: Alcaldía de Ejemplo"
            disabled={!canManage}
            error={errors.role?.message}
            {...register("role")}
          />
        </div>
        <div>
          <Label htmlFor="bio">Biografía corta</Label>
          <Textarea
            id="bio"
            rows={5}
            disabled={!canManage}
            error={errors.bio?.message}
            {...register("bio")}
          />
        </div>
        {!canManage && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Solo la Propietaria y los Administradores pueden editar el perfil.
          </p>
        )}
        {canManage && (
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Guardar
          </Button>
        )}
      </form>
    </Card>
  );
}
