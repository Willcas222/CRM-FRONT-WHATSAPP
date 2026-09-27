"use client";

import { useQuery } from "@tanstack/react-query";

import { callPlatformApi, platformClient } from "@/lib/platform-client";

export interface AnalyticsWindow {
  since?: string;
  until?: string;
  account_id?: string;
}

export function useAdminOverview(window: AnalyticsWindow = {}) {
  return useQuery({
    queryKey: ["admin", "analytics", "overview", window],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/analytics/overview", {
          params: { query: window },
        }),
      ),
  });
}

export function useAdminAiConsumption(window: AnalyticsWindow = {}) {
  return useQuery({
    queryKey: ["admin", "analytics", "ai", window],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/analytics/ai-consumption", {
          params: { query: window },
        }),
      ),
  });
}

export function useAdminWhatsAppUsage(window: AnalyticsWindow = {}) {
  return useQuery({
    queryKey: ["admin", "analytics", "whatsapp", window],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/analytics/whatsapp-usage", {
          params: { query: window },
        }),
      ),
  });
}

export function useAdminCosts(window: AnalyticsWindow = {}) {
  return useQuery({
    queryKey: ["admin", "analytics", "costs", window],
    queryFn: () =>
      callPlatformApi(() =>
        platformClient.GET("/api/v1/superadmin/analytics/costs", {
          params: { query: window },
        }),
      ),
  });
}
