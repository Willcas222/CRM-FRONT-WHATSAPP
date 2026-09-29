"use client";

/** Aplica de verdad la personalización de marca (Fase 15, B-3) a TODA la interfaz, sobrescribiendo
 * en tiempo de ejecución las mismas variables CSS que `app/globals.css` ya usa para pintar la app
 * (`--color-emerald-*`, `--color-sidebar`, `--chat-wall*`) — cero cambios en el resto de
 * componentes, que siguen usando sus clases de Tailwind de siempre.
 *
 * Solo tres tonos de `emerald` (500/600/700, los que de verdad usan botones, pestañas activas,
 * interruptores y anillos de foco) se sobrescriben con `color_acento_botones`: la app de hoy no
 * distingue un "color primario" de un "color de botón" por separado, así que `color_primario`
 * comparte ese mismo efecto — no hay dos acentos distintos que personalizar todavía.
 *
 * Nunca toca nada si `usar_personalizacion` es falso: en ese caso solo quita cualquier
 * sobrescritura anterior (por ejemplo, tras apagar el interruptor sin recargar la página) y la
 * hoja de estilos vuelve a mandar sola, exactamente como para una cuenta que nunca personalizó nada.
 */
import { useEffect } from "react";

import { useBranding } from "@/lib/hooks/branding";

const OVERRIDABLE_PROPERTIES = [
  "--color-emerald-500",
  "--color-emerald-600",
  "--color-emerald-700",
  "--color-sidebar",
  "--color-button-text",
  "--color-bubble-out",
  "--color-bubble-out-dark",
  "--chat-wall",
  "--chat-wall-image",
  "--chat-wall-bg-size",
] as const;

function hexToRgb(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function setFavicon(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

function restoreFavicon() {
  document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute("href", "/favicon.ico");
}

export function BrandingInjector() {
  const { data } = useBranding();

  useEffect(() => {
    const root = document.documentElement.style;

    if (!data?.usar_personalizacion) {
      for (const property of OVERRIDABLE_PROPERTIES) root.removeProperty(property);
      restoreFavicon();
      return;
    }

    root.setProperty("--color-emerald-500", data.color_acento_botones);
    root.setProperty("--color-emerald-600", data.color_acento_botones);
    root.setProperty("--color-emerald-700", data.color_acento_botones);
    root.setProperty("--color-sidebar", data.color_fondo_sidebar);
    root.setProperty("--color-button-text", data.color_texto_botones);
    // La burbuja saliente del inbox (mensajes del bot/agente) usa el mismo acento que los botones,
    // igual que ya se ve en la vista previa de "Personalización y Marca".
    root.setProperty("--color-bubble-out", data.color_acento_botones);
    root.setProperty("--color-bubble-out-dark", data.color_acento_botones);
    root.setProperty("--chat-wall", data.color_fondo_chat);

    if (data.chat_bg_tipo === "IMAGEN" && data.chat_bg_imagen_url) {
      // El backend garantiza un color efectivo no nulo cuando `usar_personalizacion` es verdadero
      // (`branding_rules.effective_branding`); el `??` es solo para que TypeScript lo acepte, el
      // esquema generado marca el campo como opcional porque también sirve para el estado crudo.
      const rgb = hexToRgb(data.color_fondo_chat ?? "#EFEAE2");
      const wash = 1 - data.chat_bg_opacidad;
      root.setProperty(
        "--chat-wall-image",
        `linear-gradient(rgba(${rgb}, ${wash}), rgba(${rgb}, ${wash})), url("${data.chat_bg_imagen_url}")`,
      );
      root.setProperty("--chat-wall-bg-size", "cover, cover");
    } else if (data.chat_bg_tipo === "COLOR") {
      root.setProperty("--chat-wall-image", "none");
      root.removeProperty("--chat-wall-bg-size");
    } else {
      // PATRON: se deja el patrón de puntos por defecto de `globals.css`, solo cambia el color base.
      root.removeProperty("--chat-wall-image");
      root.removeProperty("--chat-wall-bg-size");
    }

    if (data.favicon_url) setFavicon(data.favicon_url);
    else restoreFavicon();
  }, [data]);

  return null;
}
