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

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, account, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenu}
          aria-label="Abrir menú"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 lg:hidden dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {account && (
          <p className="truncate text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {account.name}
          </p>
        )}
      </div>

      {user && (
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="hidden text-zinc-700 sm:inline dark:text-zinc-300">
              {user.name}
            </span>
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
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
