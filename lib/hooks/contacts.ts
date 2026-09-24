"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type ContactOut = components["schemas"]["ContactOut"];
type CreateContactRequest = components["schemas"]["CreateContactRequest"];
type UpdateContactRequest = components["schemas"]["UpdateContactRequest"];

export function useContacts(q: string) {
  return useQuery({
    queryKey: ["contacts", { q }],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/contacts", { params: { query: { q: q || undefined, limit: 50 } } }),
      ),
  });
}

export function useContact(contactId: string | undefined) {
  return useQuery({
    queryKey: ["contacts", contactId],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/contacts/{contact_id}", { params: { path: { contact_id: contactId! } } }),
      ),
    enabled: !!contactId,
  });
}

export function useContactHistory(contactId: string | undefined) {
  return useQuery({
    queryKey: ["contacts", contactId, "history"],
    queryFn: () =>
      callApi(() =>
        client.GET("/api/v1/contacts/{contact_id}/history", {
          params: { path: { contact_id: contactId! }, query: { limit: 50 } },
        }),
      ),
    enabled: !!contactId,
  });
}

/** Todos los contactos de la cuenta, en un mapa por id: las listas de leads no traen el contacto
 * embebido (solo `contact_id`, ver LeadOut), así que se resuelve del lado del cliente. Se corta
 * en 1000 contactos como salvaguarda razonable para el MVP. */
export function useContactsLookup() {
  return useQuery({
    queryKey: ["contacts", "__lookup"],
    queryFn: async () => {
      const byId = new Map<string, ContactOut>();
      let cursor: string | null | undefined;
      for (let page = 0; page < 10; page += 1) {
        const result = await callApi(() =>
          client.GET("/api/v1/contacts", { params: { query: { limit: 100, cursor } } }),
        );
        for (const contact of result.items) byId.set(contact.id, contact);
        if (!result.has_more) break;
        cursor = result.next_cursor;
      }
      return byId;
    },
    staleTime: 30_000,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContactRequest) =>
      callApi(() => client.POST("/api/v1/contacts", { body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateContactRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/contacts/{contact_id}", { params: { path: { contact_id: contactId } }, body }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
