"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { callPlatformApi, platformClient } from "@/lib/platform-client";

export interface AuditFilters {
  action?: string;
  entity_type?: string;
  account_id?: string;
}

export function useAdminAudit(filters: AuditFilters) {
  return useInfiniteQuery({
    queryKey: ["admin", "audit", filters],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/audit", {
          params: {
            query: {
              ...(filters.action ? { action: filters.action } : {}),
              ...(filters.entity_type
                ? { entity_type: filters.entity_type }
                : {}),
              ...(filters.account_id ? { account_id: filters.account_id } : {}),
              limit: 25,
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          },
        }),
      ),
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  });
}
