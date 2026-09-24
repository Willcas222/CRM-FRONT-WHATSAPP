"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";

/** Solo OWNER y ADMIN administran automatizaciones (`Permission.AUTOMATIONS_MANAGE` en el backend);
 * el resto es redirigido, igual que hace `(app)/layout.tsx` con la sesión. */
export function useRequireManage(): boolean {
  const { user } = useAuth();
  const router = useRouter();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";

  useEffect(() => {
    if (user && !canManage) router.replace("/dashboard");
  }, [user, canManage, router]);

  return canManage;
}
