"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Panel", icon: IconGrid, requiresManage: false },
  { href: "/inbox", label: "Bandeja", icon: IconChat, requiresManage: false },
  { href: "/contacts", label: "Contactos", icon: IconUsers, requiresManage: false },
  { href: "/leads", label: "Leads", icon: IconTag, requiresManage: false },
  { href: "/pipeline", label: "Pipeline", icon: IconColumns, requiresManage: false },
  { href: "/automations", label: "Automatizaciones", icon: IconBolt, requiresManage: true },
  { href: "/settings", label: "Configuración", icon: IconGear, requiresManage: false },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const items = NAV.filter((item) => !item.requiresManage || canManage);

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center px-4">
        <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          CRM WhatsApp AI
        </span>
      </div>
      <ul className="flex-1 space-y-0.5 px-2 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function iconProps(className?: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function IconGrid({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M21 12a8 8 0 1 1-3.4-6.6" />
      <path d="M21 4v6h-6" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 13.2a4.5 4.5 0 0 1 5 4.3" />
    </svg>
  );
}

function IconTag({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M12.5 3H5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 .6 1.4l9.5 9.5a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8L13 3.6a2 2 0 0 0-1.4-.6Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

function IconColumns({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="4" width="5.5" height="16" rx="1.2" />
      <rect x="9.5" y="4" width="5.5" height="10" rx="1.2" />
      <rect x="16" y="4" width="5.5" height="13" rx="1.2" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
    </svg>
  );
}

function IconGear({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
