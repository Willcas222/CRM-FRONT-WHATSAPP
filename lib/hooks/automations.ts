"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type CreateAutomationRequest = components["schemas"]["CreateAutomationRequest"];
export type UpdateAutomationRequest = components["schemas"]["UpdateAutomationRequest"];

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: () => callApi(() => client.GET("/api/v1/automations")),
  });
}

export function useAutomation(automationId: string | undefined) {
  return useQuery({
    queryKey: ["automations", automationId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/automations/{automation_id}", {
          params: { path: { automation_id: automationId! } },
        }),
      ),
    enabled: !!automationId,
  });
}

export function useAutomationExecutions(automationId: string | undefined) {
  return useQuery({
    queryKey: ["automations", automationId, "executions"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/automations/{automation_id}/executions", {
          params: { path: { automation_id: automationId! } },
        }),
      ),
    enabled: !!automationId,
    refetchInterval: 5000,
  });
}

function useInvalidateAutomations() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["automations"] });
}

export function useCreateAutomation() {
  const invalidate = useInvalidateAutomations();
  return useMutation({
    mutationFn: (body: CreateAutomationRequest) =>
      callApi(() => client.POST("/api/v1/automations", { body })),
    onSuccess: invalidate,
  });
}

/** `PUT`: reemplaza disparador, condiciones y pasos enteros (no cambia `is_active`). */
export function useReplaceAutomation(automationId: string) {
  const invalidate = useInvalidateAutomations();
  return useMutation({
    mutationFn: (body: CreateAutomationRequest) =>
      callApi(() =>
        client.PUT("/api/v1/automations/{automation_id}", {
          params: { path: { automation_id: automationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

/** `PATCH`: solo nombre y activación. */
export function useUpdateAutomation(automationId: string) {
  const invalidate = useInvalidateAutomations();
  return useMutation({
    mutationFn: (body: UpdateAutomationRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/automations/{automation_id}", {
          params: { path: { automation_id: automationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteAutomation() {
  const invalidate = useInvalidateAutomations();
  return useMutation({
    mutationFn: (automationId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/automations/{automation_id}", {
          params: { path: { automation_id: automationId } },
        }),
      ),
    onSuccess: invalidate,
  });
}
