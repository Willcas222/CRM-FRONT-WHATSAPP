"use client";

import { useState } from "react";

import { ConfirmReasonModal } from "@/components/admin/confirm-reason-modal";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
  Spinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import type { components } from "@/lib/api-schema";
import { diffLines } from "@/lib/line-diff";
import {
  useCreatePromptVersion,
  usePromptHistory,
  usePrompts,
  useSetPromptActive,
} from "@/lib/hooks/admin-settings";
import { cn, formatDateTime } from "@/lib/utils";

type Version = components["schemas"]["PromptVersionOut"];

export default function AdminPromptsPage() {
  const { data, isLoading, error } = usePrompts();
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState<{
    name: string;
    content: string;
  } | null>(null);

  return (
    <>
      <PageHeader
        title="Prompts globales"
        help="prompts"
        description="Versiones inmutables: para cambiar un prompt se crea una versión nueva y se activa. Aún no los usa el bot de las cuentas."
        actions={
          <Button onClick={() => setCreating({ name: "", content: "" })}>
            Nuevo prompt
          </Button>
        }
      />

      {isLoading && <FullPageSpinner />}
      {error && <ErrorBanner message="No se pudieron cargar los prompts." />}

      {data && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit overflow-hidden">
            {data.length === 0 ? (
              <EmptyState title="Aún no hay prompts." />
            ) : (
              <ul>
                {data.map((prompt) => (
                  <li key={prompt.name}>
                    <button
                      onClick={() => setSelected(prompt.name)}
                      className={cn(
                        "block w-full border-b border-zinc-100 px-4 py-3 text-left last:border-0 dark:border-zinc-800/60",
                        selected === prompt.name
                          ? "bg-indigo-50 dark:bg-indigo-900/20"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
                      )}
                    >
                      <div className="font-mono text-sm font-medium">
                        {prompt.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        {prompt.versions_count} versiones ·
                        {prompt.active_version != null ? (
                          <Badge tone="green">
                            activa v{prompt.active_version}
                          </Badge>
                        ) : (
                          <Badge tone="amber">sin activa</Badge>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {selected ? (
            <History
              key={selected}
              name={selected}
              onNewVersion={(content) =>
                setCreating({ name: selected, content })
              }
            />
          ) : (
            <Card>
              <EmptyState
                title="Elige un prompt"
                description="Verás su historial y podrás compararlo."
              />
            </Card>
          )}
        </div>
      )}

      {creating && (
        <NewVersionForm
          key={creating.name + creating.content.length}
          initial={creating}
          onClose={() => setCreating(null)}
          onCreated={(name) => setSelected(name)}
        />
      )}
    </>
  );
}

function History({
  name,
  onNewVersion,
}: {
  name: string;
  onNewVersion: (content: string) => void;
}) {
  const { data, isLoading, error } = usePromptHistory(name);
  const setActive = useSetPromptActive();
  const [viewing, setViewing] = useState<number | null>(null);
  const [compareWith, setCompareWith] = useState<number | null>(null);
  const [pending, setPending] = useState<{
    version: Version;
    active: boolean;
  } | null>(null);

  if (isLoading) return <Spinner />;
  if (error || !data)
    return <ErrorBanner message="No se pudo cargar el historial." />;

  const shownNumber = viewing ?? data[0]?.version;
  const shown = data.find((v) => v.version === shownNumber);
  const other = data.find((v) => v.version === compareWith);

  return (
    <div className="space-y-4">
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {data.map((version) => (
              <tr
                key={version.id}
                className={cn(
                  "border-b border-zinc-100 last:border-0 dark:border-zinc-800/60",
                  version.version === shownNumber &&
                    "bg-indigo-50/60 dark:bg-indigo-900/10",
                )}
              >
                <td className="px-4 py-3 font-mono text-xs">
                  v{version.version}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={version.is_active ? "green" : "neutral"}>
                    {version.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {formatDateTime(version.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewing(version.version)}
                    >
                      Ver
                    </Button>
                    {version.version !== shownNumber && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCompareWith(version.version)}
                      >
                        Comparar con v{shownNumber}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={version.is_active ? "danger" : "secondary"}
                      onClick={() =>
                        setPending({ version, active: !version.is_active })
                      }
                    >
                      {version.is_active ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {shown && !other && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {name} · v{shown.version}
            </h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNewVersion(shown.content)}
            >
              Nueva versión desde esta
            </Button>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-950">
            {shown.content}
          </pre>
        </Card>
      )}

      {shown && other && (
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Cambios de v{other.version} a v{shown.version}
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCompareWith(null)}
            >
              Cerrar comparación
            </Button>
          </div>
          <div className="max-h-96 overflow-auto rounded-lg bg-zinc-50 p-2 font-mono text-xs dark:bg-zinc-950">
            {diffLines(other.content, shown.content).map((line, index) => (
              <div
                key={index}
                className={cn(
                  "whitespace-pre-wrap px-2",
                  line.kind === "add" &&
                    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
                  line.kind === "del" &&
                    "bg-red-100 text-red-900 line-through dark:bg-red-900/30 dark:text-red-200",
                )}
              >
                {line.kind === "add" ? "+ " : line.kind === "del" ? "- " : "  "}
                {line.text}
              </div>
            ))}
          </div>
        </Card>
      )}

      {pending && (
        <ConfirmReasonModal
          open
          onClose={() => setPending(null)}
          title={`${pending.active ? "Activar" : "Desactivar"} ${name} v${pending.version.version}`}
          warning={
            pending.active
              ? "Esta versión pasa a ser la única activa; la anterior se desactiva."
              : `«${name}» se queda sin versión activa.`
          }
          confirmLabel={pending.active ? "Activar" : "Desactivar"}
          danger={!pending.active}
          onConfirm={(reason) =>
            setActive.mutateAsync({
              name,
              version: pending.version.version,
              active: pending.active,
              reason,
            })
          }
        />
      )}
    </div>
  );
}

function NewVersionForm({
  initial,
  onClose,
  onCreated,
}: {
  initial: { name: string; content: string };
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const create = useCreatePromptVersion();
  const [name, setName] = useState(initial.name);
  const [content, setContent] = useState(initial.content);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existing = initial.name !== "";

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={existing ? `Nueva versión de ${initial.name}` : "Nuevo prompt"}
      >
        <div className="space-y-4">
          {error && <ErrorBanner message={error} />}
          {!existing && (
            <div>
              <Label htmlFor="prompt-name">Nombre (a-z, 0-9 y _)</Label>
              <Input
                id="prompt-name"
                value={name}
                onChange={(event) => setName(event.target.value.toLowerCase())}
                placeholder="general_agent"
              />
            </div>
          )}
          <div>
            <Label htmlFor="prompt-content">Contenido</Label>
            <Textarea
              id="prompt-content"
              rows={12}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Se crea INACTIVA: la activas después, desde el historial.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!name.trim() || !content.trim())
                  return setError("Nombre y contenido son obligatorios.");
                setError(null);
                setConfirming(true);
              }}
            >
              Crear versión
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmReasonModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Crear versión"
        warning="Una versión no se puede editar ni borrar después."
        confirmLabel="Crear"
        onConfirm={async (reason) => {
          const created = await create.mutateAsync({
            name: name.trim(),
            content,
            reason,
          });
          onCreated(created.name);
          onClose();
        }}
      />
    </>
  );
}
