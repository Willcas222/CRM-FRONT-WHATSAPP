"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type UpdateAccountRequest = components["schemas"]["UpdateAccountRequest"];

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { success: "Nombre de la organización actualizado." },
    mutationFn: (body: UpdateAccountRequest) =>
      callApi(() => client.PATCH("/api/v1/account", { body })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}
