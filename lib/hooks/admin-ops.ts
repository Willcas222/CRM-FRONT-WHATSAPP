"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { callPlatformApi, platformClient } from "@/lib/platform-client";

export function useSystemHealth() {
  return useQuery({
    queryKey: ["admin", "system-health"],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/system-health"),
      ),
    refetchInterval: 15_000,
  });
}

export interface AlertFilters {
  status?: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  severity?: "INFO" | "WARNING" | "CRITICAL";
  account_id?: string;
  only_open?: boolean;
}

export function useAlerts(filters: AlertFilters) {
  return useInfiniteQuery({
    queryKey: ["admin", "alerts", filters],
    initialPageParam: null as string | null,
    refetchInterval: 30_000,
    queryFn: ({ pageParam }) =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/alerts", {
          params: {
            query: {
              ...filters,
              limit: 25,
              ...(pageParam ? { cursor: pageParam } : {}),
            },
          },
        }),
      ),
    getNextPageParam: (last) => (last.has_more ? last.next_cursor : undefined),
  });
}

/** Solo el conteo de no resueltas por gravedad: alimenta el resumen y la insignia del menú. */
export function useOpenAlertCounts() {
  return useQuery({
    queryKey: ["admin", "alerts", "counts"],
    refetchInterval: 30_000,
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/alerts", {
          params: { query: { only_open: true, limit: 1 } },
        }),
      ),
    select: (page) => page.open_by_severity,
  });
}

export function useAlertAction() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { success: "Alerta actualizada." },
    mutationFn: ({
      id,
      action,
    }: {
      id: string;
      action: "acknowledge" | "resolve";
    }) =>
      callPlatformApi(() =>
        action === "acknowledge"
          ? platformClient.POST(
              "/api/v1/superadmin/alerts/{alert_id}/acknowledge",
              {
                params: { path: { alert_id: id } },
              },
            )
          : platformClient.POST(
              "/api/v1/superadmin/alerts/{alert_id}/resolve",
              {
                params: { path: { alert_id: id } },
              },
            ),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
    },
  });
}

export function useEvaluateAlerts() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { success: "Alertas evaluadas." },
    mutationFn: () =>
      callPlatformApi(() =>
        platformClient.POST("/api/v1/superadmin/alerts/evaluate"),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
  });
}
