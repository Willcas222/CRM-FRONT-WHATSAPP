"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  Badge,
  Card,
  EmptyState,
  ErrorBanner,
  Spinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/auth-context";
import {
  useCreateKnowledgeDocument,
  useDeleteKnowledgeDocument,
  useKnowledgeDocuments,
  useUpdateKnowledgeDocument,
  type KnowledgeDocumentOut,
} from "@/lib/hooks/campaign";

export function KnowledgeTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading } = useKnowledgeDocuments();
  const deleteDocument = useDeleteKnowledgeDocument();
  const [editing, setEditing] = useState<KnowledgeDocumentOut | "new" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(document: KnowledgeDocumentOut) {
    if (!window.confirm(`¿Eliminar «${document.title}»?`)) return;
    setError(null);
    try {
      await deleteDocument.mutateAsync(document.id);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo eliminar.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Propuestas, ejes programáticos o preguntas frecuentes. El bot solo ve
          los documentos <strong>publicados</strong>.
        </p>
        {canManage && (
          <Button size="sm" onClick={() => setEditing("new")}>
            Nuevo documento
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
            title="Sin documentos todavía"
            description="Crea el primero para que el bot pueda responder sobre las propuestas."
          />
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.items.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {document.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {document.content}
                  </p>
                </div>
                <Badge tone={document.is_published ? "green" : "neutral"}>
                  {document.is_published ? "Publicado" : "Borrador"}
                </Badge>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(document)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={deleteDocument.isPending}
                      onClick={() => handleDelete(document)}
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
        <DocumentModal
          document={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

const schema = z.object({
  title: z.string().min(1, "Ingresa un título.").max(200),
  content: z.string().min(1, "Escribe el contenido.").max(8000),
  is_published: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function DocumentModal({
  document,
  onClose,
}: {
  document: KnowledgeDocumentOut | null;
  onClose: () => void;
}) {
  const create = useCreateKnowledgeDocument();
  const update = useUpdateKnowledgeDocument(document?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({
      title: document?.title ?? "",
      content: document?.content ?? "",
      is_published: document?.is_published ?? false,
    });
  }, [document, reset]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      if (document) await update.mutateAsync(values);
      else await create.mutateAsync(values);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={document ? "Editar documento" : "Nuevo documento"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" error={errors.title?.message} {...register("title")} />
        </div>
        <div>
          <Label htmlFor="content">Contenido</Label>
          <Textarea
            id="content"
            rows={8}
            error={errors.content?.message}
            {...register("content")}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register("is_published")} />
          Publicado (visible para el bot)
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
