"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

export type UpdateBotRequest = components["schemas"]["UpdateBotRequest"];

export function useBots() {
  return useQuery({
    queryKey: ["bots"],
    queryFn: () => callApi(() => client.GET("/api/v1/bots")),
  });
}

export function useUpdateBot(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBotRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/bots/{bot_id}", { params: { path: { bot_id: botId } }, body }),
      ),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["bots"] }),
  });
}
