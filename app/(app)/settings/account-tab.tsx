"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, ErrorBanner } from "@/components/ui/misc";
import { ApiError, useAuth } from "@/lib/auth-context";
import { useUpdateAccount } from "@/lib/hooks/account";

const schema = z.object({ name: z.string().min(1, "Ingresa el nombre de la cuenta.") });
type FormValues = z.infer<typeof schema>;

export function AccountTab() {
  const { account, user, refetchMe } = useAuth();
  const updateAccount = useUpdateAccount();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const canRename = user?.role === "OWNER";
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (account) reset({ name: account.name });
  }, [account, reset]);

  async function onSubmit(values: FormValues) {
    setError(null);
    setSaved(false);
    try {
      await updateAccount.mutateAsync({ name: values.name });
      await refetchMe();
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudieron guardar los cambios.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Datos de la cuenta
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
          {error && <ErrorBanner message={error} />}
          {saved && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">Cambios guardados.</p>
          )}
          <div>
            <Label htmlFor="account_name">Nombre</Label>
            <Input
              id="account_name"
              disabled={!canRename}
              error={errors.name?.message}
              {...register("name")}
            />
            {!canRename && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Solo la propietaria puede cambiar el nombre de la cuenta.
              </p>
            )}
          </div>
          {canRename && (
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Guardar
            </Button>
          )}
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tu perfil</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-zinc-500 dark:text-zinc-400">Nombre</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{user?.name}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Correo</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{user?.email}</dd>
          <dt className="text-zinc-500 dark:text-zinc-400">Rol</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{user?.role}</dd>
        </dl>
      </Card>
    </div>
  );
}
