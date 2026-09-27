import type { ReactNode } from "react";

import { HelpButton } from "@/components/help/help-button";
import type { HelpAudience } from "@/lib/help";
import { cn } from "@/lib/utils";

/**
 * Título de una pantalla con su «!» de ayuda al lado. Recibe las mismas clases que tenía el `<h1>`:
 * los márgenes pasan al contenedor para que el botón quede alineado con el texto.
 */
export function PageTitle({
  topic,
  audience = "organization",
  className,
  children,
}: {
  topic: string;
  audience?: HelpAudience;
  className?: string;
  children: ReactNode;
}) {
  const tokens = (className ?? "").split(/\s+/).filter(Boolean);
  const isMargin = (t: string) => /^-?m[trblxy]?-/.test(t);
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        tokens.filter(isMargin).join(" "),
      )}
    >
      <h1
        className={cn("min-w-0", tokens.filter((t) => !isMargin(t)).join(" "))}
      >
        {children}
      </h1>
      <HelpButton topic={topic} audience={audience} />
    </div>
  );
}
