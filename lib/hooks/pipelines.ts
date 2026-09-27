"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type CreatePipelineRequest = components["schemas"]["CreatePipelineRequest"];
type UpdatePipelineRequest = components["schemas"]["UpdatePipelineRequest"];
type AddStageRequest = components["schemas"]["AddStageRequest"];
type UpdateStageRequest = components["schemas"]["UpdateStageRequest"];

export function usePipelines() {
  return useQuery({
    queryKey: ["pipelines"],
    queryFn: () => callApi(() => client.GET("/api/v1/pipelines")),
  });
}

export function useDefaultPipeline() {
  const { data, ...rest } = usePipelines();
  return {
    ...rest,
    data: data?.items.find((p) => p.is_default) ?? data?.items[0],
  };
}

function useInvalidatePipelines() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["pipelines"] });
}

export function useCreatePipeline() {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Pipeline creado." },
    mutationFn: (body: CreatePipelineRequest) =>
      callApi(() => client.POST("/api/v1/pipelines", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdatePipeline(pipelineId: string) {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Pipeline actualizado." },
    mutationFn: (body: UpdatePipelineRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/pipelines/{pipeline_id}", {
          params: { path: { pipeline_id: pipelineId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeletePipeline() {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Pipeline eliminado." },
    mutationFn: (pipelineId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/pipelines/{pipeline_id}", {
          params: { path: { pipeline_id: pipelineId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAddStage(pipelineId: string) {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Etapa añadida." },
    mutationFn: (body: AddStageRequest) =>
      callApi(() =>
        client.POST("/api/v1/pipelines/{pipeline_id}/stages", {
          params: { path: { pipeline_id: pipelineId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateStage() {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Etapa actualizada." },
    mutationFn: ({
      stageId,
      ...body
    }: UpdateStageRequest & { stageId: string }) =>
      callApi(() =>
        client.PATCH("/api/v1/stages/{stage_id}", {
          params: { path: { stage_id: stageId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteStage() {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Etapa eliminada." },
    mutationFn: (stageId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/stages/{stage_id}", {
          params: { path: { stage_id: stageId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useReorderStages(pipelineId: string) {
  const invalidate = useInvalidatePipelines();
  return useMutation({
    meta: { success: "Orden de las etapas guardado." },
    mutationFn: (stageIds: string[]) =>
      callApi(() =>
        client.PUT("/api/v1/pipelines/{pipeline_id}/stages/order", {
          params: { path: { pipeline_id: pipelineId } },
          body: { stage_ids: stageIds },
        }),
      ),
    onSuccess: invalidate,
  });
}
