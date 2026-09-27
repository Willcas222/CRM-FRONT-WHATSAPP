"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { components } from "@/lib/api-schema";
import { callPlatformApi, platformClient } from "@/lib/platform-client";

type AccountStatus = components["schemas"]["AccountStatus"];
type UpdateLimits = components["schemas"]["UpdateAccountLimitsRequest"];

export function useAdminAccounts(
  params: { search?: string; limit?: number } = {},
) {
  const query = {
    ...(params.search ? { search: params.search } : {}),
    limit: params.limit ?? 20,
  };
  return useQuery({
    queryKey: ["admin", "accounts", "search", query],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/accounts", {
          params: { query },
        }),
      ),
  });
}

export function useAdminAccountList(filters: {
  search?: string;
  status?: AccountStatus;
}) {
  return useInfiniteQuery({
    queryKey: ["admin", "accounts", "list", filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/accounts", {
          params: {
            query: {
              ...(filters.search ? { search: filters.search } : {}),
              ...(filters.status ? { status: filters.status } : {}),
              limit: 25,
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          },
        }),
      ),
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  });
}

export function useAdminAccount(accountId: string) {
  return useQuery({
    queryKey: ["admin", "account", accountId],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/accounts/{account_id}", {
          params: { path: { account_id: accountId } },
        }),
      ),
  });
}

export function useAdminAccountLimits(accountId: string) {
  return useQuery({
    queryKey: ["admin", "account-limits", accountId],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/accounts/{account_id}/limits", {
          params: { path: { account_id: accountId } },
        }),
      ),
  });
}

function useInvalidateAccount(accountId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: ["admin", "account", accountId],
    });
    void queryClient.invalidateQueries({ queryKey: ["admin", "accounts"] });
    void queryClient.invalidateQueries({
      queryKey: ["admin", "account-limits", accountId],
    });
    void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
  };
}

export function useChangeAccountStatus(accountId: string) {
  const invalidate = useInvalidateAccount(accountId);
  return useMutation({
    meta: { success: "Estado de la organización actualizado." },
    mutationFn: (body: { status: AccountStatus; reason: string }) =>
      callPlatformApi(() =>
        platformClient.PATCH(
          "/api/v1/superadmin/accounts/{account_id}/status",
          {
            params: { path: { account_id: accountId } },
            body,
          },
        ),
      ),
    onSuccess: invalidate,
  });
}

export function useAssignAccountPlan(accountId: string) {
  const invalidate = useInvalidateAccount(accountId);
  return useMutation({
    meta: { success: "Plan asignado a la organización." },
    mutationFn: ({
      planId,
      reason,
    }: {
      planId: string | null;
      reason: string;
    }) =>
      callPlatformApi(() =>
        platformClient.PATCH("/api/v1/superadmin/accounts/{account_id}/plan", {
          params: { path: { account_id: accountId } },
          body: { plan_id: planId, reason },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateAccountLimits(accountId: string) {
  const invalidate = useInvalidateAccount(accountId);
  return useMutation({
    meta: { success: "Límites de la organización guardados." },
    mutationFn: (body: UpdateLimits) =>
      callPlatformApi(() =>
        platformClient.PATCH(
          "/api/v1/superadmin/accounts/{account_id}/limits",
          {
            params: { path: { account_id: accountId } },
            body,
          },
        ),
      ),
    onSuccess: invalidate,
  });
}
