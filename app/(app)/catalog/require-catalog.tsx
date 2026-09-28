"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Esta sección solo existe para el vertical Comercio/Tienda (backend ARCHITECTURE.md 11.8): una
 * cuenta con otro tipo de negocio es redirigida, igual que `(app)/layout.tsx` con la sesión. */
export function useRequireRetailVertical(): boolean {
  const { account } = useAuth();
  const router = useRouter();
  const isRetail = account?.vertical === "RETAIL";

  useEffect(() => {
    if (account && !isRetail) router.replace("/dashboard");
  }, [account, isRetail, router]);

  return isRetail;
}
