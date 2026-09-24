"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { callApi, client } from "@/lib/api-client";
import type { components } from "@/lib/api-schema";

type CreateUserRequest = components["schemas"]["CreateUserRequest"];
type UpdateUserRequest = components["schemas"]["UpdateUserRequest"];

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => callApi(() => client.GET("/api/v1/users")),
  });
}

/** Mapa id -> usuario, para resolver `assigned_agent_id` en leads y conversaciones. */
export function useUsersLookup() {
  const { data, ...rest } = useUsers();
  const byId = new Map(data?.items.map((user) => [user.id, user]));
  return { ...rest, data: byId };
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["users"] });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (body: CreateUserRequest) => callApi(() => client.POST("/api/v1/users", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateUser(userId: string) {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (body: UpdateUserRequest) =>
      callApi(() =>
        client.PATCH("/api/v1/users/{user_id}", { params: { path: { user_id: userId } }, body }),
      ),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      callApi(() =>
        client.POST("/api/v1/users/{user_id}/password", {
          params: { path: { user_id: userId } },
          body: { new_password: newPassword },
        }),
      ),
  });
}
