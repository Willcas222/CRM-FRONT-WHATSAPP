"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge, Card, ErrorBanner, FullPageSpinner } from "@/components/ui/misc";
import { ApiError } from "@/lib/auth-context";
import {
  useAddStage,
  useDeleteStage,
  usePipelines,
  useReorderStages,
  useUpdateStage,
} from "@/lib/hooks/pipelines";
import type { components } from "@/lib/api-schema";

type StageOut = components["schemas"]["StageOut"];
type StageType = StageOut["type"];

const TYPE_LABELS: Record<StageType, string> = { OPEN: "Abierta", WON: "Ganada", LOST: "Perdida" };

export function PipelinesTab() {
  const { data, isLoading } = usePipelines();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}
      {data?.items.map((pipeline) => (
        <Card key={pipeline.id} className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {pipeline.name}
            </h2>
            {pipeline.is_default && <Badge tone="green">Por defecto</Badge>}
          </div>
          <StageList pipeline={pipeline} onError={setError} />
        </Card>
      ))}
    </div>
  );
}

function StageList({
  pipeline,
  onError,
}: {
  pipeline: components["schemas"]["PipelineOut"];
  onError: (message: string | null) => void;
}) {
  const reorderStages = useReorderStages(pipeline.id);
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();
  const addStage = useAddStage(pipeline.id);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<StageType>("OPEN");

  const stages = [...pipeline.stages].sort((a, b) => a.order_index - b.order_index);

  async function move(stageId: string, direction: -1 | 1) {
    const index = stages.findIndex((s) => s.id === stageId);
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const ids = stages.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    onError(null);
    try {
      await reorderStages.mutateAsync(ids);
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo reordenar.");
    }
  }

  async function rename(stageId: string, name: string) {
    onError(null);
    try {
      await updateStage.mutateAsync({ stageId, name });
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo renombrar la etapa.");
    }
  }

  async function remove(stageId: string) {
    if (!window.confirm("¿Eliminar esta etapa? Solo se puede si no tiene leads.")) return;
    onError(null);
    try {
      await deleteStage.mutateAsync(stageId);
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo eliminar la etapa.");
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    onError(null);
    try {
      await addStage.mutateAsync({ name: newName.trim(), type: newType });
      setNewName("");
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo crear la etapa.");
    }
  }

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => (
        <div
          key={stage.id}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
        >
          <div className="flex flex-col">
            <button
              disabled={index === 0}
              onClick={() => move(stage.id, -1)}
              className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
            >
              ▲
            </button>
            <button
              disabled={index === stages.length - 1}
              onClick={() => move(stage.id, 1)}
              className="text-zinc-400 hover:text-zinc-700 disabled:opacity-30 dark:hover:text-zinc-200"
            >
              ▼
            </button>
          </div>
          <Input
            defaultValue={stage.name}
            onBlur={(e) => e.target.value !== stage.name && rename(stage.id, e.target.value)}
            className="max-w-xs"
          />
          <Badge tone={stage.type === "OPEN" ? "blue" : stage.type === "WON" ? "green" : "red"}>
            {TYPE_LABELS[stage.type]}
          </Badge>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" onClick={() => remove(stage.id)}>
            Eliminar
          </Button>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2">
        <Input
          placeholder="Nueva etapa…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={newType}
          onChange={(e) => setNewType(e.target.value as StageType)}
          className="max-w-[140px]"
        >
          <option value="OPEN">Abierta</option>
          <option value="WON">Ganada</option>
          <option value="LOST">Perdida</option>
        </Select>
        <Button variant="secondary" onClick={handleAdd} loading={addStage.isPending}>
          Añadir
        </Button>
      </div>
    </div>
  );
}
