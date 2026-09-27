"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { components } from "@/lib/api-schema";
import { callPlatformApi, platformClient } from "@/lib/platform-client";

type CreateTeamUser = components["schemas"]["CreateTeamUserRequest"];
type UpdateTeamUser = components["schemas"]["UpdateTeamUserRequest"];

// ------------------------------------------------------------------ mi doble factor

export function useMfaStatus() {
  return useQuery({
    queryKey: ["admin", "me", "mfa"],
    queryFn: () =>
      callPlatformApi(() => platformClient.GET("/api/v1/superadmin/me/mfa")),
  });
}

function useInvalidateMfa() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "me", "mfa"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
  };
}

export function useBeginMfaSetup() {
  return useMutation({
    meta: { success: false, error: false },
    mutationFn: () =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/me/mfa/setup"),
      ),
  });
}

export function useEnableMfa() {
  const invalidate = useInvalidateMfa();
  return useMutation({
    meta: { success: "Verificación en dos pasos activada.", error: false },
    mutationFn: (code: string) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/me/mfa/enable", {
          body: { code },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDisableMfa() {
  const invalidate = useInvalidateMfa();
  return useMutation({
    meta: { success: "Verificación en dos pasos desactivada.", error: false },
    mutationFn: (body: { password: string; code: string }) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/me/mfa/disable", { body }),
      ),
    onSuccess: invalidate,
  });
}

export function useRegenerateRecoveryCodes() {
  const invalidate = useInvalidateMfa();
  return useMutation({
    meta: {
      success: "Códigos de recuperación nuevos generados.",
      error: false,
    },
    mutationFn: (code: string) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/me/mfa/recovery-codes", {
          body: { code },
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ equipo

export function useTeam() {
  return useQuery({
    queryKey: ["admin", "team"],
    queryFn: () =>
      callPlatformApi(() => platformClient.GET("/api/v1/superadmin/team")),
  });
}

function useInvalidateTeam() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

export function useCreateTeamUser() {
  const invalidate = useInvalidateTeam();
  return useMutation({
    meta: { success: "Persona añadida al equipo." },
    mutationFn: (body: CreateTeamUser) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/team", { body }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateTeamUser(userId: string) {
  const invalidate = useInvalidateTeam();
  return useMutation({
    meta: { success: "Rol o estado actualizado." },
    mutationFn: (body: UpdateTeamUser) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/team/{user_id}", {
          params: { path: { user_id: userId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useResetTeamMfa(userId: string) {
  const invalidate = useInvalidateTeam();
  return useMutation({
    meta: { success: "Doble factor restablecido." },
    mutationFn: (reason: string) =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/team/{user_id}/mfa/reset", {
          params: { path: { user_id: userId } },
          body: { reason },
        }),
      ),
    onSuccess: invalidate,
  });
}
