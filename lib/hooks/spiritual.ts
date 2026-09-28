"use client";

/** Vertical Orientación y Servicios Espirituales (Fase 14, backend ARCHITECTURE.md 11.9):
 * configuración ESTÁNDAR y genérica — las mismas pantallas sirven para cualquier organización con
 * `vertical = SPIRITUAL_GUIDANCE`, nunca a la medida de una organización concreta. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type GuidanceServiceOut = components["schemas"]["GuidanceServiceOut"];
export type ConsultationOut = components["schemas"]["ConsultationOut"];
export type ConsultationStatus = components["schemas"]["ConsultationStatus"];
export type ConsultationStatusHistoryOut = components["schemas"]["ConsultationStatusHistoryOut"];

type CreateGuidanceServiceRequest = components["schemas"]["CreateGuidanceServiceRequest"];
type UpdateGuidanceServiceRequest = components["schemas"]["UpdateGuidanceServiceRequest"];
type RequestConsultationRequest = components["schemas"]["RequestConsultationRequest"];

// ------------------------------------------------------------------ servicios

function useInvalidateGuidance() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["guidance"] });
}

export function useGuidanceServices() {
  return useQuery({
    queryKey: ["guidance", "services"],
    queryFn: () => callApi(() => client.GET("/api/v1/guidance/services")),
  });
}

export function useGuidanceService(serviceId: string | undefined) {
  return useQuery({
    queryKey: ["guidance", "services", serviceId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/guidance/services/{service_id}", {
          params: { path: { service_id: serviceId! } },
        }),
      ),
    enabled: !!serviceId,
  });
}

export function useCreateGuidanceService() {
  const invalidate = useInvalidateGuidance();
  return useMutation({
    meta: { success: "Servicio creado." },
    mutationFn: (body: CreateGuidanceServiceRequest) =>
      callApi(() => client.POST("/api/v1/guidance/services", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateGuidanceService(serviceId: string) {
  const invalidate = useInvalidateGuidance();
  return useMutation({
    meta: { success: "Servicio guardado." },
    mutationFn: (body: UpdateGuidanceServiceRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/guidance/services/{service_id}", {
          params: { path: { service_id: serviceId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ consultas

function useInvalidateConsultations() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["consultations"] });
}

export function useConsultations(filters: { status?: ConsultationStatus } = {}) {
  return useQuery({
    queryKey: ["consultations", filters],
    queryFn: () => callApi(() => client.GET("/api/v1/consultations", { params: { query: filters } })),
  });
}

export function useConsultation(consultationId: string | undefined) {
  return useQuery({
    queryKey: ["consultations", consultationId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/consultations/{consultation_id}", {
          params: { path: { consultation_id: consultationId! } },
        }),
      ),
    enabled: !!consultationId,
  });
}

export function useConsultationHistory(consultationId: string | undefined) {
  return useQuery({
    queryKey: ["consultations", consultationId, "history"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/consultations/{consultation_id}/history", {
          params: { path: { consultation_id: consultationId! } },
        }),
      ),
    enabled: !!consultationId,
  });
}

export function useRequestConsultation() {
  const invalidate = useInvalidateConsultations();
  return useMutation({
    meta: { success: "Consulta registrada." },
    mutationFn: (body: RequestConsultationRequest) =>
      callApi(() => client.POST("/api/v1/consultations", { body })),
    onSuccess: invalidate,
  });
}

export function useChangeConsultationStatus(consultationId: string) {
  const invalidate = useInvalidateConsultations();
  return useMutation({
    meta: { success: "Estado actualizado." },
    mutationFn: (body: { status: ConsultationStatus; reason?: string }) =>
      callApi(() =>
        client.POST("/api/v1/consultations/{consultation_id}/status", {
          params: { path: { consultation_id: consultationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useSetConsultationDetails(consultationId: string) {
  const invalidate = useInvalidateConsultations();
  return useMutation({
    meta: { success: "Detalles guardados." },
    mutationFn: (body: {
      service_id?: string | null;
      scheduled_at?: string | null;
      notes?: string | null;
    }) =>
      callApi(() =>
        client.PATCH("/api/v1/consultations/{consultation_id}/details", {
          params: { path: { consultation_id: consultationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAssignGuide(consultationId: string) {
  const invalidate = useInvalidateConsultations();
  return useMutation({
    meta: { success: "Guía asignado." },
    mutationFn: (body: { guide_id: string | null }) =>
      callApi(() =>
        client.PATCH("/api/v1/consultations/{consultation_id}/guide", {
          params: { path: { consultation_id: consultationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}
