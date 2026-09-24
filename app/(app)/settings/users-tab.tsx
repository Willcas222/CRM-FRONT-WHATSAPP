"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge, Card, ErrorBanner } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError, useAuth } from "@/lib/auth-context";
import { useCreateUser, useResetUserPassword, useUpdateUser, useUsers } from "@/lib/hooks/users";
import type { components } from "@/lib/api-schema";

type Role = components["schemas"]["Role"];

const ROLE_LABELS: Record<Role, string> = { OWNER: "Propietaria", ADMIN: "Administrador", AGENT: "Agente" };

export function UsersTab() {
  const { user: me } = useAuth();
  const { data, isLoading } = useUsers();
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Nuevo usuario</Button>
      </div>
      {error && <ErrorBanner message={error} />}
      <Card>
        {isLoading ? null : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Correo</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data?.items.map((u) => (
                <UserRow key={u.id} targetUser={u} me={me} onError={setError} />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onError={setError} />
    </div>
  );
}

function UserRow({
  targetUser,
  me,
  onError,
}: {
  targetUser: components["schemas"]["UserOut"];
  me: components["schemas"]["UserOut"] | null;
  onError: (message: string | null) => void;
}) {
  const updateUser = useUpdateUser(targetUser.id);
  const resetPassword = useResetUserPassword();
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const isSelf = targetUser.id === me?.id;
  const meIsAdminOnly = me?.role === "ADMIN";
  const locked = isSelf || (meIsAdminOnly && targetUser.role === "OWNER");

  async function changeRole(role: Role) {
    onError(null);
    try {
      await updateUser.mutateAsync({ role });
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo cambiar el rol.");
    }
  }

  async function toggleStatus() {
    onError(null);
    try {
      await updateUser.mutateAsync({
        status: targetUser.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
      });
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  }

  async function handleResetPassword() {
    const password = window.prompt("Nueva contraseña (mínimo 10 caracteres):");
    if (!password) return;
    onError(null);
    try {
      await resetPassword.mutateAsync({ userId: targetUser.id, newPassword: password });
      setNewPassword(password);
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo restablecer la contraseña.");
    }
  }

  return (
    <tr>
      <td className="px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
        {targetUser.name}
      </td>
      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{targetUser.email}</td>
      <td className="px-4 py-2.5">
        <Select
          value={targetUser.role}
          disabled={locked || updateUser.isPending}
          onChange={(e) => changeRole(e.target.value as Role)}
          className="py-1 text-xs"
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-2.5">
        <button onClick={toggleStatus} disabled={locked || updateUser.isPending}>
          <Badge tone={targetUser.status === "ACTIVE" ? "green" : "neutral"}>
            {targetUser.status === "ACTIVE" ? "Activo" : "Desactivado"}
          </Badge>
        </button>
      </td>
      <td className="px-4 py-2.5 text-right">
        <Button size="sm" variant="ghost" onClick={handleResetPassword}>
          Restablecer contraseña
        </Button>
        {newPassword && (
          <p className="mt-1 text-[11px] text-zinc-500">Nueva: {newPassword}</p>
        )}
      </td>
    </tr>
  );
}

const createSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre."),
  email: z.string().min(1, "Ingresa un correo.").email("Correo no válido."),
  password: z.string().min(10, "Al menos 10 caracteres."),
  role: z.enum(["OWNER", "ADMIN", "AGENT"]),
});
type CreateFormValues = z.infer<typeof createSchema>;

function CreateUserModal({
  open,
  onClose,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  onError: (message: string | null) => void;
}) {
  const createUser = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "AGENT" },
  });

  async function onSubmit(values: CreateFormValues) {
    onError(null);
    try {
      await createUser.mutateAsync(values);
      reset();
      onClose();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo crear el usuario.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo usuario">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" error={errors.name?.message} {...register("name")} />
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" error={errors.email?.message} {...register("email")} />
        </div>
        <div>
          <Label htmlFor="password">Contraseña inicial</Label>
          <Input
            id="password"
            type="text"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>
        <div>
          <Label htmlFor="role">Rol</Label>
          <Select id="role" {...register("role")}>
            <option value="AGENT">Agente</option>
            <option value="ADMIN">Administrador</option>
            <option value="OWNER">Propietaria</option>
          </Select>
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
