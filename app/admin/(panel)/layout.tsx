"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { FullPageSpinner } from "@/components/ui/misc";
import { usePlatformAuth } from "@/lib/platform-auth-context";

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { status } = usePlatformAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  if (status !== "authenticated") return <FullPageSpinner />;
  return <AdminShell>{children}</AdminShell>;
}
