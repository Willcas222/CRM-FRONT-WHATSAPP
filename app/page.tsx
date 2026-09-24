"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullPageSpinner } from "@/components/ui/misc";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  return <FullPageSpinner />;
}
