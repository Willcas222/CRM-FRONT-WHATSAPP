"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type CreateInboxRequest = components["schemas"]["CreateInboxRequest"];
type UpdateInboxRequest = components["schemas"]["UpdateInboxRequest"];

export function useInboxes() {
  return useQuery({
    queryKey: ["inboxes"],
    queryFn: () => callApi(() => client.GET("/api/v1/inboxes")),
  });
}

function useInvalidateInboxes() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["inboxes"] });
}

export function useCreateInbox() {
  const invalidate = useInvalidateInboxes();
  return useMutation({
    mutationFn: (body: CreateInboxRequest) => callApi(() => client.POST("/api/v1/inboxes", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateInbox(inboxId: string) {
  const invalidate = useInvalidateInboxes();
  return useMutation({
    mutationFn: (body: UpdateInboxRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/inboxes/{inbox_id}", { params: { path: { inbox_id: inboxId } }, body }),
      ),
    onSuccess: invalidate,
  });
}

/** Reactiva un canal desactivado (PATCH status=ACTIVE). El backend no lo reactiva al rotar el token. */
export function useActivateInbox() {
  const invalidate = useInvalidateInboxes();
  return useMutation({
    mutationFn: (inboxId: string) =>
      callApi(() =>
        client.PATCH("/api/v1/inboxes/{inbox_id}", {
          params: { path: { inbox_id: inboxId } },
          body: { status: "ACTIVE" },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeactivateInbox() {
  const invalidate = useInvalidateInboxes();
  return useMutation({
    mutationFn: (inboxId: string) =>
      callApi(() =>
        client.DELETE("/api/v1/inboxes/{inbox_id}", { params: { path: { inbox_id: inboxId } } }),
      ),
    onSuccess: invalidate,
  });
}
