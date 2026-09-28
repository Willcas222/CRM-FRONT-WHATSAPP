"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Los pedidos son del mismo motor para Restaurante y Comercio/Tienda (ARCHITECTURE.md 11.8): a
 * diferencia de `/menu` y `/catalog` (exclusivos de su propio vertical), esta pantalla se comparte
 * entre los dos. */
export function useRequireOrdersVertical(): boolean {
  const { account } = useAuth();
  const router = useRouter();
  const allowed = account?.vertical === "RESTAURANT" || account?.vertical === "RETAIL";

  useEffect(() => {
    if (account && !allowed) router.replace("/dashboard");
  }, [account, allowed, router]);

  return allowed;
}
