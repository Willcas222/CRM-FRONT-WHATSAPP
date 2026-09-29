"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FullPageSpinner } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth-context";
import { BrandingInjector } from "@/lib/branding-injector";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return <FullPageSpinner />;
  }

  return (
    <div className="flex h-dvh">
      <BrandingInjector />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
