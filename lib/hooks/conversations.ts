"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type SendMessageRequest = components["schemas"]["SendMessageRequest"];
type HandoffRequest = components["schemas"]["HandoffRequest"];
type AssignConversationRequest = components["schemas"]["AssignConversationRequest"];

export interface ConversationFilters {
  status?: components["schemas"]["ConversationStatus"];
  assignedTo?: string;
  q?: string;
}

export function useConversations(filters: ConversationFilters = {}) {
  return useQuery({
    queryKey: ["conversations", filters],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/conversations", {
          params: {
            query: {
              status: filters.status,
              assigned_to: filters.assignedTo,
              q: filters.q || undefined,
              limit: 50,
            },
          },
        }),
      ),
    refetchInterval: 5000,
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/conversations/{conversation_id}", {
          params: { path: { conversation_id: conversationId! } },
        }),
      ),
    enabled: !!conversationId,
    refetchInterval: 4000,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["conversations", conversationId, "messages"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/conversations/{conversation_id}/messages", {
          params: { path: { conversation_id: conversationId! }, query: { limit: 50 } },
        }),
      ),
    enabled: !!conversationId,
    refetchInterval: 3500,
  });
}

function useInvalidateConversation(conversationId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["conversations", conversationId] });
    void queryClient.invalidateQueries({ queryKey: ["conversations"], exact: true });
  };
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageRequest) =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/messages", {
          params: { path: { conversation_id: conversationId } },
          body,
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["conversations", conversationId, "messages"],
      });
    },
  });
}

export function useMarkConversationRead(conversationId: string) {
  const invalidate = useInvalidateConversation(conversationId);
  return useMutation({
    mutationFn: () =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/read", {
          params: { path: { conversation_id: conversationId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useHandoffConversation(conversationId: string) {
  const invalidate = useInvalidateConversation(conversationId);
  return useMutation({
    mutationFn: (body: HandoffRequest) =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/handoff", {
          params: { path: { conversation_id: conversationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useTakeConversation(conversationId: string) {
  const invalidate = useInvalidateConversation(conversationId);
  return useMutation({
    mutationFn: () =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/take", {
          params: { path: { conversation_id: conversationId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useReleaseConversation(conversationId: string) {
  const invalidate = useInvalidateConversation(conversationId);
  return useMutation({
    mutationFn: () =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/release", {
          params: { path: { conversation_id: conversationId } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAssignConversation(conversationId: string) {
  const invalidate = useInvalidateConversation(conversationId);
  return useMutation({
    mutationFn: (body: AssignConversationRequest) =>
      callApi(() =>
        client.POST("/api/v1/conversations/{conversation_id}/assign", {
          params: { path: { conversation_id: conversationId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}
