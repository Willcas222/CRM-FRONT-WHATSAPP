"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { useOpenAlertCounts } from "@/lib/hooks/admin-ops";
import { usePlatformAuth } from "@/lib/platform-auth-context";
import { cn, initials } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/organizations", label: "Organizaciones", exact: false },
  { href: "/admin/plans", label: "Planes", exact: false },
  { href: "/admin/usage", label: "Uso", exact: false },
  { href: "/admin/ai", label: "IA", exact: false },
  { href: "/admin/whatsapp", label: "WhatsApp", exact: false },
  { href: "/admin/billing", label: "Facturación", exact: false },
  { href: "/admin/system-health", label: "Salud del sistema", exact: false },
  { href: "/admin/alerts", label: "Alertas", exact: false },
  { href: "/admin/feature-flags", label: "Feature flags", exact: false },
  { href: "/admin/global-config", label: "Config. global", exact: false },
  { href: "/admin/prompts", label: "Prompts", exact: false },
  { href: "/admin/maintenance", label: "Mantenimiento", exact: false },
  { href: "/admin/audit", label: "Auditoría", exact: false },
  { href: "/admin/team", label: "Equipo", exact: false },
  { href: "/admin/security", label: "Seguridad", exact: false },
  { href: "/admin/help", label: "Ayuda", exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, canWrite, logout } = usePlatformAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const counts = useOpenAlertCounts();
  const openAlerts = Object.values(counts.data ?? {}).reduce(
    (sum, n) => sum + n,
    0,
  );
  const critical = counts.data?.CRITICAL ?? 0;

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
  }

  return (
    <div className="flex h-dvh flex-col lg:flex-row">
      {/* Barra superior solo en móvil: abre el menú lateral (cajón) */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-3 lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-200 hover:bg-zinc-900"
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
        <span className="text-sm font-semibold text-zinc-50">
          CRM Plataforma
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-indigo-400">
          SuperAdmin
        </span>
        {openAlerts > 0 && (
          <span
            className={cn(
              "ml-auto rounded-full px-2 text-xs font-semibold",
              critical > 0
                ? "bg-red-600 text-white"
                : "bg-amber-500 text-black",
            )}
          >
            {openAlerts}
          </span>
        )}
      </header>
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-black/60 transition-opacity lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        aria-label="Menú del panel"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950 transition-transform duration-200",
          "lg:static lg:z-auto lg:h-full lg:w-56 lg:shrink-0 lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 flex-col justify-center px-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-50">
            CRM Plataforma
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-indigo-400">
            SuperAdmin
          </span>
        </div>
        <ul className="flex-1 space-y-0.5 px-2 py-2">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:py-2",
                    active
                      ? "bg-indigo-900/40 text-indigo-300"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    {item.label}
                    {item.href === "/admin/alerts" && openAlerts > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-semibold",
                          critical > 0
                            ? "bg-red-600 text-white"
                            : "bg-amber-500 text-black",
                        )}
                      >
                        {openAlerts}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {user && (
          <div className="border-t border-zinc-800 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-200">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg px-3 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-900"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-zinc-50 p-4 sm:p-6 dark:bg-zinc-950">
        {!canWrite && user && (
          <p className="mb-4 rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            Tu rol es de <strong>solo lectura</strong>: puedes consultar todo,
            pero no cambiar nada.
          </p>
        )}
        {user && !user.mfa_enabled && (
          <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            Tu cuenta no tiene verificación en dos pasos.{" "}
            <Link href="/admin/security" className="font-semibold underline">
              Actívala ahora
            </Link>
            : protege todas las organizaciones.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
