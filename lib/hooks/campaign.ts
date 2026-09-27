"use client";

/** Vertical Campaña política (Fase 11, backend ARCHITECTURE.md 11.6): configuración ESTÁNDAR y
 * genérica — las mismas pantallas sirven para cualquier organización con `vertical =
 * POLITICAL_CAMPAIGN`, nunca a la medida de un candidato o campaña concretos. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type CandidateProfileOut = components["schemas"]["CandidateProfileOut"];
export type KnowledgeDocumentOut =
  components["schemas"]["KnowledgeDocumentOut"];
export type CampaignEventOut = components["schemas"]["CampaignEventOut"];
export type CitizenRequestOut = components["schemas"]["CitizenRequestOut"];
export type CitizenRequestType = components["schemas"]["CitizenRequestType"];
export type CitizenRequestStatus =
  components["schemas"]["CitizenRequestStatus"];

type UpdateCandidateProfileRequest =
  components["schemas"]["UpdateCandidateProfileRequest"];
type CreateKnowledgeDocumentRequest =
  components["schemas"]["CreateKnowledgeDocumentRequest"];
type UpdateKnowledgeDocumentRequest =
  components["schemas"]["UpdateKnowledgeDocumentRequest"];
type CreateCampaignEventRequest =
  components["schemas"]["CreateCampaignEventRequest"];
type UpdateCampaignEventRequest =
  components["schemas"]["UpdateCampaignEventRequest"];
type CreateCitizenRequestRequest =
  components["schemas"]["CreateCitizenRequestRequest"];

// ------------------------------------------------------------------ perfil del candidato

export function useCandidateProfile() {
  return useQuery({
    queryKey: ["campaign", "profile"],
    queryFn: () => callApi(() => client.GET("/api/v1/campaign/profile")),
  });
}

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { success: "Perfil del candidato guardado." },
    mutationFn: (body: UpdateCandidateProfileRequest) =>
      callApi(() => client.PUT("/api/v1/campaign/profile", { body })),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["campaign", "profile"] }),
  });
}

// ------------------------------------------------------------------ información oficial

function useInvalidateKnowledge() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: ["campaign", "knowledge"] });
}

export function useKnowledgeDocuments() {
  return useQuery({
    queryKey: ["campaign", "knowledge"],
    queryFn: () => callApi(() => client.GET("/api/v1/campaign/knowledge")),
  });
}

export function useCreateKnowledgeDocument() {
  const invalidate = useInvalidateKnowledge();
  return useMutation({
    meta: { success: "Documento creado." },
    mutationFn: (body: CreateKnowledgeDocumentRequest) =>
      callApi(() => client.POST("/api/v1/campaign/knowledge", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateKnowledgeDocument(documentId: string) {
  const invalidate = useInvalidateKnowledge();
  return useMutation({
    meta: { success: "Documento guardado." },
    mutationFn: (body: UpdateKnowledgeDocumentRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/campaign/knowledge/{document_id}", {
          params: { path: { document_id: documentId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteKnowledgeDocument() {
  const invalidate = useInvalidateKnowledge();
  return useMutation({
    meta: { success: "Documento eliminado." },
    mutationFn: (documentId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/campaign/knowledge/{document_id}", {
          params: { path: { document_id: documentId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ eventos

function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: ["campaign", "events"] });
}

export function useCampaignEvents(params: { upcomingOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["campaign", "events", params],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/campaign/events", {
          params: {
            query: { upcoming_only: params.upcomingOnly ?? false },
          },
        }),
      ),
  });
}

export function useCreateCampaignEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    meta: { success: "Evento creado." },
    mutationFn: (body: CreateCampaignEventRequest) =>
      callApi(() => client.POST("/api/v1/campaign/events", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateCampaignEvent(eventId: string) {
  const invalidate = useInvalidateEvents();
  return useMutation({
    meta: { success: "Evento guardado." },
    mutationFn: (body: UpdateCampaignEventRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/campaign/events/{event_id}", {
          params: { path: { event_id: eventId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteCampaignEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    meta: { success: "Evento eliminado." },
    mutationFn: (eventId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/campaign/events/{event_id}", {
          params: { path: { event_id: eventId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

// ------------------------------------------------------------------ solicitudes ciudadanas

function useInvalidateCitizenRequests() {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: ["citizen-requests"] });
}

export function useCitizenRequests(
  filters: { status?: CitizenRequestStatus; type?: CitizenRequestType } = {},
) {
  return useQuery({
    queryKey: ["citizen-requests", filters],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/citizen-requests", { params: { query: filters } }),
      ),
  });
}

export function useCitizenRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ["citizen-requests", requestId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/citizen-requests/{request_id}", {
          params: { path: { request_id: requestId! } },
        }),
      ),
    enabled: !!requestId,
  });
}

export function useCitizenRequestHistory(requestId: string | undefined) {
  return useQuery({
    queryKey: ["citizen-requests", requestId, "history"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/citizen-requests/{request_id}/history", {
          params: { path: { request_id: requestId! } },
        }),
      ),
    enabled: !!requestId,
  });
}

export function useCreateCitizenRequest() {
  const invalidate = useInvalidateCitizenRequests();
  return useMutation({
    meta: { success: "Solicitud registrada." },
    mutationFn: (body: CreateCitizenRequestRequest) =>
      callApi(() => client.POST("/api/v1/citizen-requests", { body })),
    onSuccess: invalidate,
  });
}

export function useChangeCitizenRequestStatus(requestId: string) {
  const invalidate = useInvalidateCitizenRequests();
  return useMutation({
    meta: { success: "Estado actualizado." },
    mutationFn: (body: { status: CitizenRequestStatus; reason?: string }) =>
      callApi(() =>
        client.POST("/api/v1/citizen-requests/{request_id}/status", {
          params: { path: { request_id: requestId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}
