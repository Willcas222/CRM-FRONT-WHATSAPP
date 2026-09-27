"use client";

import type { ReactNode } from "react";

import { PlatformAuthProvider } from "@/lib/platform-auth-context";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <PlatformAuthProvider>{children}</PlatformAuthProvider>;
}
