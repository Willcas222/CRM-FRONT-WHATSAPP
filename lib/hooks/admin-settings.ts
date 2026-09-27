"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { components } from "@/lib/api-schema";
import { callPlatformApi, platformClient } from "@/lib/platform-client";

type UpdateFlag = components["schemas"]["UpdateFeatureFlagRequest"];
type CreateFlag = components["schemas"]["CreateFeatureFlagRequest"];
type SetMaintenance = components["schemas"]["UpdateMaintenanceRequest"];

function useRefresh(...keys: string[]) {
  const queryClient = useQueryClient();
  return () => {
    for (const key of keys)
      void queryClient.invalidateQueries({ queryKey: ["admin", key] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

// ------------------------------------------------------------------ configuración global

export function useGlobalConfig() {
  return useQuery({
    queryKey: ["admin", "global-config"],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/global-config"),
      ),
  });
}

export function useUpdateGlobalConfig() {
  const refresh = useRefresh("global-config");
  return useMutation({
    meta: { success: "Configuración global guardada." },
    mutationFn: (body: { values: Record<string, unknown>; reason: string }) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/global-config", { body }),
      ),
    onSuccess: refresh,
  });
}

// ------------------------------------------------------------------ feature flags

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/feature-flags"),
      ),
  });
}

export function useEffectiveFlags(accountId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "feature-flags", "effective", accountId],
    enabled: !!accountId,
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET(
          "/api/v1/superadmin/feature-flags/effective/{account_id}",
          {
            params: { path: { account_id: accountId as string } },
          },
        ),
      ),
  });
}

export function useCreateFlag() {
  const refresh = useRefresh("feature-flags");
  return useMutation({
    meta: { success: "Flag creado." },
    mutationFn: (body: CreateFlag) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/feature-flags", { body }),
      ),
    onSuccess: refresh,
  });
}

export function useUpdateFlag(flagId: string) {
  const refresh = useRefresh("feature-flags");
  return useMutation({
    meta: { success: "Flag actualizado." },
    mutationFn: (body: UpdateFlag) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/feature-flags/{flag_id}", {
          params: { path: { flag_id: flagId } },
          body,
        }),
      ),
    onSuccess: refresh,
  });
}

// ------------------------------------------------------------------ prompts

export function usePrompts() {
  return useQuery({
    queryKey: ["admin", "prompts"],
    queryFn: () =>
      callPlatformApi(() => platformClient.GET("/api/v1/superadmin/prompts")),
  });
}

export function usePromptHistory(name: string | null) {
  return useQuery({
    queryKey: ["admin", "prompts", "history", name],
    enabled: !!name,
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/prompts/{name}", {
          params: { path: { name: name as string } },
        }),
      ),
  });
}

export function useCreatePromptVersion() {
  const refresh = useRefresh("prompts");
  return useMutation({
    meta: { success: "Nueva versión del prompt creada." },
    mutationFn: (body: { name: string; content: string; reason: string }) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/prompts", { body }),
      ),
    onSuccess: refresh,
  });
}

export function useSetPromptActive() {
  const refresh = useRefresh("prompts");
  return useMutation({
    meta: { success: "Versión del prompt actualizada." },
    mutationFn: ({
      name,
      version,
      active,
      reason,
    }: {
      name: string;
      version: number;
      active: boolean;
      reason: string;
    }) =>
      callPlatformApi(() =>
        active
          ? platformClient.POST(
              "/api/v1/superadmin/prompts/{name}/versions/{version}/activate",
              {
                params: { path: { name, version } },
                body: { reason },
              },
            )
          : platformClient.POST(
              "/api/v1/superadmin/prompts/{name}/versions/{version}/deactivate",
              {
                params: { path: { name, version } },
                body: { reason },
              },
            ),
      ),
    onSuccess: refresh,
  });
}

// ------------------------------------------------------------------ mantenimiento

export function useMaintenance() {
  return useQuery({
    queryKey: ["admin", "maintenance"],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/maintenance"),
      ),
    refetchInterval: 15_000,
  });
}

export function useSetMaintenance() {
  const refresh = useRefresh("maintenance", "global-config");
  return useMutation({
    meta: { success: "Modo mantenimiento actualizado." },
    mutationFn: (body: SetMaintenance) =>
      callPlatformApi(() =>
        platformClient.PUT("/api/v1/superadmin/maintenance", { body }),
      ),
    onSuccess: refresh,
  });
}
