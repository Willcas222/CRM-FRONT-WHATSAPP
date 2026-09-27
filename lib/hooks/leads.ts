"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type CreateLeadRequest = components["schemas"]["CreateLeadRequest"];
type UpdateLeadRequest = components["schemas"]["UpdateLeadRequest"];
type MoveLeadRequest = components["schemas"]["MoveLeadRequest"];
type CloseLeadRequest = components["schemas"]["CloseLeadRequest"];
type AssignLeadRequest = components["schemas"]["AssignLeadRequest"];

export interface LeadFilters {
  q?: string;
  status?: components["schemas"]["LeadStatus"];
  assignedAgentId?: string;
  pipelineId?: string;
}

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/leads", {
          params: {
            query: {
              q: filters.q || undefined,
              status: filters.status,
              assigned_agent_id: filters.assignedAgentId,
              pipeline_id: filters.pipelineId,
              limit: 100,
            },
          },
        }),
      ),
  });
}

/** Todos los leads ABIERTOS de un pipeline, sin paginar (para el Kanban: hasta 500 tarjetas). */
export function usePipelineLeads(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ["leads", "pipeline", pipelineId],
    queryFn: async () => {
      const items: components["schemas"]["LeadOut"][] = [];
      let cursor: string | null | undefined;
      for (let page = 0; page < 5; page += 1) {
        const result = await callApi(() =>
          client.GET("/api/v1/leads", {
            params: { query: { pipeline_id: pipelineId, limit: 100, cursor } },
          }),
        );
        items.push(...result.items);
        if (!result.has_more) break;
        cursor = result.next_cursor;
      }
      return items;
    },
    enabled: !!pipelineId,
  });
}

export function useLead(leadId: string | undefined) {
  return useQuery({
    queryKey: ["leads", leadId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/leads/{lead_id}", {
          params: { path: { lead_id: leadId! } },
        }),
      ),
    enabled: !!leadId,
  });
}

export function useLeadEvents(leadId: string | undefined) {
  return useQuery({
    queryKey: ["leads", leadId, "events"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/leads/{lead_id}/events", {
          params: { path: { lead_id: leadId! }, query: { limit: 50 } },
        }),
      ),
    enabled: !!leadId,
  });
}

function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["leads"] });
}

export function useCreateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    meta: { success: "Lead creado." },
    mutationFn: (body: CreateLeadRequest) =>
      callApi(() => client.POST("/api/v1/leads", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateLead(leadId: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    meta: { success: "Lead actualizado." },
    mutationFn: (body: UpdateLeadRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/leads/{lead_id}", {
          params: { path: { lead_id: leadId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useMoveLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    meta: { success: "Lead movido de etapa." },
    mutationFn: ({ leadId, ...body }: MoveLeadRequest & { leadId: string }) =>
      callApi(() =>
        client.POST("/api/v1/leads/{lead_id}/move", {
          params: { path: { lead_id: leadId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useCloseLead(leadId: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    meta: { success: "Lead cerrado." },
    mutationFn: (body: CloseLeadRequest) =>
      callApi(() =>
        client.POST("/api/v1/leads/{lead_id}/close", {
          params: { path: { lead_id: leadId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAssignLead(leadId: string) {
  const invalidate = useInvalidateLeads();
  return useMutation({
    meta: { success: "Responsable asignado." },
    mutationFn: (body: AssignLeadRequest) =>
      callApi(() =>
        client.POST("/api/v1/leads/{lead_id}/assign", {
          params: { path: { lead_id: leadId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}
