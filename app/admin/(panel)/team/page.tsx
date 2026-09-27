"use client";

import { useState } from "react";

import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import { PageHeader } from "@/components/admin/page-header";
import { ReasonField, REASON_MIN } from "@/components/admin/reason-field";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";
import {
  useCreateTeamUser,
  useResetTeamMfa,
  useTeam,
  useUpdateTeamUser,
} from "@/lib/hooks/admin-security";
import { usePlatformAuth } from "@/lib/platform-auth-context";
import { formatDateTime } from "@/lib/utils";

type Member = components["schemas"]["PlatformUserOut"];
type PlatformRole = Member["role"];

const ROLE_LABEL: Record<PlatformRole, string> = {
  SUPERADMIN: "SuperAdmin",
  VIEWER: "Solo lectura",
};

const ROLE_HINT: Record<PlatformRole, string> = {
  SUPERADMIN:
    "Ve y cambia todo: organizaciones, planes, límites, configuración y el equipo.",
  VIEWER:
    "Ve todo el panel, pero no puede cambiar nada. Útil para contabilidad o soporte.",
};

export default function AdminTeamPage() {
  const { user, canWrite } = usePlatformAuth();
  const team = useTeam();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [resetting, setResetting] = useState<Member | null>(null);
  const [showDisabled, setShowDisabled] = useState(false);
  const all = team.data ?? [];
  const disabledCount = all.filter((m) => m.status !== "ACTIVE").length;
  // Activas primero (SuperAdmin antes que solo lectura); las desactivadas, solo si se piden
  const members = [...all]
    .filter((m) => showDisabled || m.status === "ACTIVE")
    .sort(
      (a, b) =>
        Number(b.status === "ACTIVE") - Number(a.status === "ACTIVE") ||
        Number(b.role === "SUPERADMIN") - Number(a.role === "SUPERADMIN") ||
        a.name.localeCompare(b.name),
    );

  return (
    <>
      <PageHeader
        title="Equipo"
        help="team"
        description="Quién entra al panel y con qué rol. Cada cambio pide un motivo y queda en la auditoría."
        actions={
          canWrite && (
            <Button onClick={() => setCreating(true)}>Nueva persona</Button>
          )
        }
      />

      <Card>
        {team.isLoading ? (
          <FullPageSpinner />
        ) : members.length === 0 ? (
          <EmptyState title="Aún no hay nadie en el equipo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Persona</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Doble factor</th>
                  <th className="px-4 py-3 font-medium">Último acceso</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {members.map((member) => {
                  const isMe = member.id === user?.id;
                  return (
                    <tr
                      key={member.id}
                      className={member.status !== "ACTIVE" ? "opacity-60" : ""}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {member.name}{" "}
                          {isMe && (
                            <span className="text-xs text-zinc-500">(tú)</span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500">{member.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            member.role === "SUPERADMIN" ? "blue" : "neutral"
                          }
                        >
                          {ROLE_LABEL[member.role]}
                        </Badge>
                        {member.status !== "ACTIVE" && (
                          <span className="ml-2 text-xs text-zinc-500">
                            Desactivada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={member.mfa_enabled ? "green" : "amber"}>
                          {member.mfa_enabled ? "Activado" : "Sin activar"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {formatDateTime(member.last_login_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canWrite && !isMe && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditing(member)}
                            >
                              Rol / estado
                            </Button>
                            {member.mfa_enabled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setResetting(member)}
                              >
                                Restablecer doble factor
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {disabledCount > 0 && (
        <label className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={showDisabled}
            onChange={(e) => setShowDisabled(e.target.checked)}
          />
          Mostrar personas desactivadas ({disabledCount})
        </label>
      )}

      {creating && <CreateModal onClose={() => setCreating(false)} />}
      {editing && (
        <EditModal member={editing} onClose={() => setEditing(null)} />
      )}
      {resetting && (
        <ResetModal member={resetting} onClose={() => setResetting(null)} />
      )}
    </>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const create = useCreateTeamUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PlatformRole>("VIEWER");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (reason.trim().length < REASON_MIN)
      return setError("Escribe el motivo (mínimo 3 caracteres).");
    try {
      await create.mutateAsync({
        name,
        email,
        role,
        password,
        reason: reason.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva persona en el equipo">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="t-name">Nombre</Label>
          <Input
            id="t-name"
            value={name}
            maxLength={200}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="t-email">Correo</Label>
          <Input
            id="t-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="t-role">Rol</Label>
          <Select
            id="t-role"
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
          >
            <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
            <option value="SUPERADMIN">{ROLE_LABEL.SUPERADMIN}</option>
          </Select>
          <p className="mt-1 text-xs text-zinc-500">{ROLE_HINT[role]}</p>
        </div>
        <div>
          <Label htmlFor="t-pw">
            Contraseña inicial (mínimo 10 caracteres)
          </Label>
          <Input
            id="t-pw"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Entrégala por un canal privado. Pídele que active la verificación en
            dos pasos al entrar.
          </p>
        </div>
        <ReasonField value={reason} onChange={setReason} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={create.isPending} onClick={() => void submit()}>
            Crear
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function EditModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const update = useUpdateTeamUser(member.id);
  const [role, setRole] = useState<PlatformRole>(member.role);
  const [active, setActive] = useState(member.status === "ACTIVE");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const changed =
    role !== member.role || active !== (member.status === "ACTIVE");

  async function submit() {
    setError(null);
    if (reason.trim().length < REASON_MIN)
      return setError("Escribe el motivo (mínimo 3 caracteres).");
    try {
      await update.mutateAsync({
        ...(role !== member.role ? { role } : {}),
        ...(active !== (member.status === "ACTIVE")
          ? { status: active ? "ACTIVE" : "DISABLED" }
          : {}),
        reason: reason.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <Modal open onClose={onClose} title={`Rol y estado de ${member.name}`}>
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="e-role">Rol</Label>
          <Select
            id="e-role"
            value={role}
            onChange={(e) => setRole(e.target.value as PlatformRole)}
          >
            <option value="VIEWER">{ROLE_LABEL.VIEWER}</option>
            <option value="SUPERADMIN">{ROLE_LABEL.SUPERADMIN}</option>
          </Select>
          <p className="mt-1 text-xs text-zinc-500">{ROLE_HINT[role]}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Puede entrar al panel (desmarcar la desactiva y cierra su acceso de
          inmediato)
        </label>
        <ReasonField value={reason} onChange={setReason} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={update.isPending}
            disabled={!changed}
            onClick={() => void submit()}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ResetModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const reset = useResetTeamMfa(member.id);
  return (
    <ConfirmReasonModal
      open
      onClose={onClose}
      title={`Restablecer el doble factor de ${member.name}`}
      warning="Úsalo solo si perdió el teléfono Y sus códigos de recuperación. Su clave actual y sus códigos dejarán de servir; tendrá que configurarlo de nuevo al entrar. Confirma su identidad por otro medio antes de hacerlo."
      confirmLabel="Restablecer"
      danger
      onConfirm={(reason) => reset.mutateAsync(reason)}
    />
  );
}
