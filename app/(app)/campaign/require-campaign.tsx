"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Esta sección solo existe para el vertical Campaña política (backend ARCHITECTURE.md 11.6): una
 * cuenta con otro tipo de negocio es redirigida, igual que `(app)/layout.tsx` con la sesión. */
export function useRequireCampaignVertical(): boolean {
  const { account } = useAuth();
  const router = useRouter();
  const isCampaign = account?.vertical === "POLITICAL_CAMPAIGN";

  useEffect(() => {
    if (account && !isCampaign) router.replace("/dashboard");
  }, [account, isCampaign, router]);

  return isCampaign;
}
