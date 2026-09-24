"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Propietaria",
  ADMIN: "Administrador",
  AGENT: "Agente",
};

export function Topbar() {
  const { user, account, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>{account && <p className="text-sm text-zinc-500 dark:text-zinc-400">{account.name}</p>}</div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{user.name}</span>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user.email}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
