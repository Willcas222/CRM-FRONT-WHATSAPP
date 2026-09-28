"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Panel", icon: IconGrid, requiresManage: false },
  { href: "/inbox", label: "Bandeja", icon: IconChat, requiresManage: false },
  {
    href: "/contacts",
    label: "Contactos",
    icon: IconUsers,
    requiresManage: false,
  },
  { href: "/leads", label: "Leads", icon: IconTag, requiresManage: false },
  {
    href: "/pipeline",
    label: "Pipeline",
    icon: IconColumns,
    requiresManage: false,
  },
  {
    href: "/automations",
    label: "Automatizaciones",
    icon: IconBolt,
    requiresManage: true,
  },
  // Vertical Campaña política (Fase 11): solo visible para ese tipo de negocio.
  {
    href: "/campaign",
    label: "Campaña",
    icon: IconFlag,
    requiresManage: false,
    requiresVertical: "POLITICAL_CAMPAIGN",
  },
  {
    href: "/citizen-requests",
    label: "Solicitudes",
    icon: IconInbox,
    requiresManage: false,
    requiresVertical: "POLITICAL_CAMPAIGN",
  },
  // Vertical Restaurante (Fase 12): solo visible para ese tipo de negocio.
  {
    href: "/menu",
    label: "Menú",
    icon: IconMenu,
    requiresManage: false,
    requiresVertical: "RESTAURANT",
  },
  // Vertical Comercio/Tienda (Fase 13): reutiliza el mismo motor de catálogo y pedidos que
  // Restaurante (ARCHITECTURE.md 11.8), con su propia pantalla "Catálogo".
  {
    href: "/catalog",
    label: "Catálogo",
    icon: IconMenu,
    requiresManage: false,
    requiresVertical: "RETAIL",
  },
  {
    href: "/orders",
    label: "Pedidos",
    icon: IconBag,
    requiresManage: false,
    requiresVertical: ["RESTAURANT", "RETAIL"],
  },
  // Vertical Orientación y Servicios Espirituales (Fase 14): solo visible para ese tipo de negocio.
  {
    href: "/guidance",
    label: "Servicios",
    icon: IconSparkle,
    requiresManage: false,
    requiresVertical: "SPIRITUAL_GUIDANCE",
  },
  {
    href: "/consultations",
    label: "Consultas",
    icon: IconInbox,
    requiresManage: false,
    requiresVertical: "SPIRITUAL_GUIDANCE",
  },
  {
    href: "/settings",
    label: "Configuración",
    icon: IconGear,
    requiresManage: false,
  },
  { href: "/help", label: "Ayuda", icon: IconHelp, requiresManage: false },
] as const;

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, account } = useAuth();
  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  const items = NAV.filter((item) => {
    if (item.requiresManage && !canManage) return false;
    if (!("requiresVertical" in item)) return true;
    const allowed = item.requiresVertical;
    return Array.isArray(allowed)
      ? (allowed as readonly string[]).includes(account?.vertical ?? "")
      : account?.vertical === allowed;
  });

  return (
    <>
      {/* En móvil el menú es un cajón: el fondo oscuro lo cierra al tocar fuera */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        aria-label="Menú principal"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-emerald-50 transition-transform duration-200",
          "lg:static lg:z-auto lg:w-60 lg:shrink-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
            <IconChat className="h-4.5 w-4.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            CRM WhatsApp AI
          </span>
        </div>
        <ul className="flex-1 space-y-1 px-3 py-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-emerald-100/75 hover:bg-sidebar-hover hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-sidebar-line px-5 py-4 text-xs text-emerald-100/50">
          Atención con IA y personas
        </div>
      </nav>
    </>
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
      <path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3 20.5l1.6-5A8.4 8.4 0 1 1 21 11.5Z" />
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

function IconHelp({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.9" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}

function IconFlag({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 3v18" />
      <path d="M5 4.5c2-1.3 4-1.3 6 0s4 1.3 6 0V14c-2 1.3-4 1.3-6 0s-4-1.3-6 0Z" />
    </svg>
  );
}

function IconInbox({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12.5h4.5l1.5 3h6l1.5-3H21" />
      <rect x="3" y="6" width="18" height="14" rx="2" />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 3v18" />
      <path d="M6 3c-1.5 0-2.5 1.5-2.5 4S4.5 11 6 11" />
      <path d="M18 3v7a2.5 2.5 0 0 1-5 0V3" />
      <path d="M18 12v9" />
    </svg>
  );
}

function IconBag({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 8h12l1 12.5a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20.5Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }): ReactNode {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5c0 1.9-1.6 3.5-3.5 3.5 1.9 0 3.5 1.6 3.5 3.5 0-1.9 1.6-3.5 3.5-3.5-1.9 0-3.5-1.6-3.5-3.5Z" />
    </svg>
  );
}
