"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/**
 * QR del autenticador. Se dibuja EN EL NAVEGADOR a partir del `otpauth://`: la clave nunca se envía a un
 * servicio externo para generar la imagen.
 */
export function TotpQr({ uri }: { uri: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toString(uri, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
      .then((out) => alive && setSvg(out))
      .catch(() => alive && setSvg(null));
    return () => {
      alive = false;
    };
  }, [uri]);
  return (
    <div
      role="img"
      aria-label="Código QR para la app autenticadora"
      className="mx-auto h-48 w-48 rounded-xl bg-white p-2"
      // El SVG lo genera la librería a partir de nuestra propia cadena: no hay contenido de terceros
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

/** La clave para escribirla a mano, agrupada de 4 en 4 para leerla sin errores. */
export function SecretKey({ secret }: { secret: string }) {
  const grouped = secret.match(/.{1,4}/g)?.join(" ") ?? secret;
  return (
    <p className="select-all break-all rounded-lg bg-zinc-100 px-3 py-2 text-center font-mono text-sm tracking-wider text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
      {grouped}
    </p>
  );
}

export function CodeField({
  id = "mfa-code",
  value,
  onChange,
  allowRecovery = false,
  autoFocus = true,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  allowRecovery?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {allowRecovery
          ? "Código de 6 dígitos (o un código de recuperación)"
          : "Código de 6 dígitos"}
      </Label>
      <Input
        id={id}
        value={value}
        autoFocus={autoFocus}
        autoComplete="one-time-code"
        inputMode={allowRecovery ? "text" : "numeric"}
        maxLength={allowRecovery ? 11 : 6}
        placeholder={allowRecovery ? "123456 o ABCDE-FGHJK" : "123456"}
        className="text-center font-mono text-lg tracking-[0.3em]"
        onChange={(e) =>
          onChange(
            allowRecovery
              ? e.target.value.toUpperCase()
              : e.target.value.replace(/\D/g, ""),
          )
        }
      />
    </div>
  );
}

/** Los códigos de recuperación: se muestran UNA sola vez. La persona debe guardarlos antes de seguir. */
export function RecoveryCodes({
  codes,
  onDone,
  doneLabel = "Ya los guardé",
}: {
  codes: string[];
  onDone: () => void;
  doneLabel?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob(
      [
        `Códigos de recuperación — CRM Plataforma\nCada código sirve UNA vez.\n\n${text}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "codigos-recuperacion-crm.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        Guárdalos en un lugar seguro (un gestor de contraseñas). Si pierdes el
        teléfono, cada código te deja entrar <strong>una vez</strong>. No se
        volverán a mostrar.
      </div>
      <ul className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-3 font-mono text-sm dark:bg-zinc-800">
        {codes.map((code) => (
          <li
            key={code}
            className="text-center tracking-wider text-zinc-900 dark:text-zinc-100"
          >
            {code}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => void copy()}
        >
          {copied ? "¡Copiados!" : "Copiar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={download}
        >
          Descargar .txt
        </Button>
      </div>
      <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        Guardé mis códigos de recuperación en un lugar seguro.
      </label>
      <Button
        type="button"
        className="w-full"
        disabled={!confirmed}
        onClick={onDone}
      >
        {doneLabel}
      </Button>
    </div>
  );
}

export const AUTHENTICATOR_HINT =
  "Usa Google Authenticator, Microsoft Authenticator, Authy o la app de contraseñas de tu teléfono.";
