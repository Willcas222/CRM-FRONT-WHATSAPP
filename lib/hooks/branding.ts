"use client";

/** Personalización de marca (Fase 15, backend ARCHITECTURE.md 11.10): logo, colores y fondo del
 * chat por cuenta. `useBranding` siempre trae la vista YA RESUELTA por el backend (con la paleta
 * estándar aplicada donde la cuenta no definió nada): este archivo nunca necesita conocer esos
 * valores por defecto. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type BrandingOut = components["schemas"]["BrandingOut"];
export type UpdateBrandingRequest = components["schemas"]["UpdateBrandingRequest"];
export type ChatBackgroundType = components["schemas"]["ChatBackgroundType"];

function useInvalidateBranding() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["branding"] });
}

export function useBranding() {
  return useQuery({
    queryKey: ["branding"],
    queryFn: () => callApi(() => client.GET("/api/v1/branding")),
  });
}

export function useUpdateBranding() {
  const invalidate = useInvalidateBranding();
  return useMutation({
    meta: { success: "Personalización guardada." },
    mutationFn: (body: UpdateBrandingRequest) =>
      callApi(() => client.PATCH("/api/v1/branding", { body })),
    onSuccess: invalidate,
  });
}

type UploadKind = "logo" | "favicon" | "chat-background";

// `openapi-typescript` no puede representar `format: binary` más que como `string`: el cuerpo
// real en tiempo de ejecución es `FormData` (que `openapi-fetch` reconoce y envía tal cual, sin
// serializar a JSON), por eso el cast — no hay forma de tipar esto con precisión desde el OpenAPI.
function uploadPath(kind: UploadKind) {
  return `/api/v1/branding/${kind}` as "/api/v1/branding/logo";
}

function useUploadBrandingAsset(kind: UploadKind) {
  const invalidate = useInvalidateBranding();
  return useMutation({
    meta: { success: "Archivo subido." },
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      // `openapi-fetch` envía un `FormData` tal cual (deja que el navegador ponga el
      // `Content-Type` con el boundary); no hace falta indicarlo aparte.
      return callApi(() => client.POST(uploadPath(kind), { body: form as unknown as { file: string } }));
    },
    onSuccess: invalidate,
  });
}

export function useUploadBrandingLogo() {
  return useUploadBrandingAsset("logo");
}

export function useUploadBrandingFavicon() {
  return useUploadBrandingAsset("favicon");
}

export function useUploadBrandingChatBackground() {
  return useUploadBrandingAsset("chat-background");
}
