"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Esta sección solo existe para el vertical Restaurante (backend ARCHITECTURE.md 11.7): una
 * cuenta con otro tipo de negocio es redirigida, igual que `(app)/layout.tsx` con la sesión. */
export function useRequireRestaurantVertical(): boolean {
  const { account } = useAuth();
  const router = useRouter();
  const isRestaurant = account?.vertical === "RESTAURANT";

  useEffect(() => {
    if (account && !isRestaurant) router.replace("/dashboard");
  }, [account, isRestaurant, router]);

  return isRestaurant;
}
