"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Esta sección solo existe para el vertical Orientación y Servicios Espirituales (backend
 * ARCHITECTURE.md 11.9): una cuenta con otro tipo de negocio es redirigida, igual que
 * `(app)/layout.tsx` con la sesión. */
export function useRequireSpiritualGuidanceVertical(): boolean {
  const { account } = useAuth();
  const router = useRouter();
  const isSpiritualGuidance = account?.vertical === "SPIRITUAL_GUIDANCE";

  useEffect(() => {
    if (account && !isSpiritualGuidance) router.replace("/dashboard");
  }, [account, isSpiritualGuidance, router]);

  return isSpiritualGuidance;
}
