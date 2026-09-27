"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { components } from "@/lib/api-schema";
import { callPlatformApi, platformClient } from "@/lib/platform-client";

type CreatePlan = components["schemas"]["CreatePlanRequest"];
type UpdatePlan = components["schemas"]["UpdatePlanRequest"];
type CreateModel = components["schemas"]["CreateAIModelRequest"];
type UpdateModel = components["schemas"]["UpdateAIModelRequest"];

export function useAdminPlans() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () =>
      callPlatformApi(() => platformClient.GET("/api/v1/superadmin/plans")),
  });
}

function useInvalidate(key: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", key] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

export function useCreatePlan() {
  const invalidate = useInvalidate("plans");
  return useMutation({
    meta: { success: "Plan creado." },
    mutationFn: (body: CreatePlan) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/plans", { body }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdatePlan(planId: string) {
  const invalidate = useInvalidate("plans");
  return useMutation({
    meta: { success: "Plan actualizado." },
    mutationFn: (body: UpdatePlan) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/plans/{plan_id}", {
          params: { path: { plan_id: planId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAdminAiModels() {
  return useQuery({
    queryKey: ["admin", "ai-models"],
    queryFn: () =>
      callPlatformApi(() => platformClient.GET("/api/v1/superadmin/ai/models")),
  });
}

export function useCreateAiModel() {
  const invalidate = useInvalidate("ai-models");
  return useMutation({
    meta: { success: "Modelo de IA creado." },
    mutationFn: (body: CreateModel) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/ai/models", { body }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateAiModel(modelId: string) {
  const invalidate = useInvalidate("ai-models");
  return useMutation({
    meta: { success: "Modelo de IA actualizado." },
    mutationFn: (body: UpdateModel) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/ai/models/{model_id}", {
          params: { path: { model_id: modelId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}
