"use client";

import { useEffect, useRef, useState } from "react";

import {
  AUTHENTICATOR_HINT,
  CodeField,
  RecoveryCodes,
  SecretKey,
  TotpQr,
} from "@/components/admin/mfa";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Badge,
  Card,
  ErrorBanner,
  FullPageSpinner,
} from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api-client";
import {
  useBeginMfaSetup,
  useDisableMfa,
  useEnableMfa,
  useMfaStatus,
  useRegenerateRecoveryCodes,
} from "@/lib/hooks/admin-security";
import { usePlatformAuth } from "@/lib/platform-auth-context";
import { formatDateTime } from "@/lib/utils";

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return "Demasiados intentos. Espera unos minutos.";
    if (error.code === "MFA_CODE_INVALID")
      return "El código no es válido o ya se usó.";
    if (error.code === "INVALID_CREDENTIALS")
      return "La contraseña no es correcta.";
    return error.message;
  }
  return fallback;
}

export default function AdminSecurityPage() {
  const { refreshUser } = usePlatformAuth();
  const status = useMfaStatus();
  const [mode, setMode] = useState<"idle" | "setup" | "disable" | "regenerate">(
    "idle",
  );
  const [codes, setCodes] = useState<string[] | null>(null);

  if (status.isLoading || !status.data) return <FullPageSpinner />;
  const s = status.data;

  function done() {
    setCodes(null);
    setMode("idle");
    void refreshUser();
  }

  return (
    <>
      <PageHeader
        title="Seguridad"
        help="security"
        description="Tu verificación en dos pasos: además de la contraseña, un código de tu teléfono."
      />

      <Card className="max-w-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Verificación en dos pasos
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {s.enabled
                ? `Activada desde ${formatDateTime(s.enabled_at)}.`
                : "Sin ella, quien conozca tu contraseña entra al panel con todos tus permisos."}
            </p>
          </div>
          <Badge tone={s.enabled ? "green" : "amber"}>
            {s.enabled ? "Activada" : "Desactivada"}
          </Badge>
        </div>

        {s.required && (
          <p className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
            La plataforma exige la verificación en dos pasos para todo el
            equipo.
          </p>
        )}

        {s.enabled && (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Códigos de recuperación sin usar:{" "}
            <strong>{s.recovery_codes_left}</strong> de 8.
            {s.recovery_codes_left <= 2 && " Genera códigos nuevos pronto."}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {!s.enabled && (
            <Button onClick={() => setMode("setup")}>Activar</Button>
          )}
          {s.enabled && (
            <Button variant="secondary" onClick={() => setMode("regenerate")}>
              Generar códigos de recuperación nuevos
            </Button>
          )}
          {s.enabled && !s.required && (
            <Button variant="danger" onClick={() => setMode("disable")}>
              Desactivar
            </Button>
          )}
        </div>
      </Card>

      {mode === "setup" && (
        <SetupModal onClose={() => setMode("idle")} onEnabled={setCodes} />
      )}
      {mode === "disable" && <DisableModal onClose={done} />}
      {mode === "regenerate" && (
        <RegenerateModal onClose={() => setMode("idle")} onCodes={setCodes} />
      )}
      {codes && (
        <Modal
          open
          onClose={() => undefined}
          title="Tus códigos de recuperación"
        >
          <RecoveryCodes codes={codes} onDone={done} />
        </Modal>
      )}
    </>
  );
}

function SetupModal({
  onClose,
  onEnabled,
}: {
  onClose: () => void;
  onEnabled: (codes: string[]) => void;
}) {
  const begin = useBeginMfaSetup();
  const enable = useEnableMfa();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const requested = useRef(false);

  // Una sola petición por apertura del modal (el modo estricto de React monta dos veces en desarrollo)
  const { mutate } = begin;
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    mutate(undefined, {
      onError: (e) => setError(messageOf(e, "No se pudo iniciar.")),
    });
  }, [mutate]);

  async function confirm() {
    setError(null);
    try {
      const result = await enable.mutateAsync(code);
      onEnabled(result.recovery_codes);
      onClose();
    } catch (e) {
      setError(messageOf(e, "No se pudo activar."));
      setCode("");
    }
  }

  return (
    <Modal open onClose={onClose} title="Activar verificación en dos pasos">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {AUTHENTICATOR_HINT}
        </p>
        {begin.data ? (
          <>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              <li>En la app, pulsa «+» y escanea este código.</li>
              <li>
                Escribe el código de 6 dígitos que aparece para confirmar.
              </li>
            </ol>
            <TotpQr uri={begin.data.uri} />
            <details className="text-sm text-zinc-600 dark:text-zinc-400">
              <summary className="cursor-pointer">
                ¿No puedes escanear? Escribe la clave
              </summary>
              <div className="mt-2">
                <SecretKey secret={begin.data.secret} />
              </div>
            </details>
            <CodeField value={code} onChange={setCode} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                loading={enable.isPending}
                disabled={code.length !== 6}
                onClick={() => void confirm()}
              >
                Activar
              </Button>
            </div>
          </>
        ) : (
          !error && (
            <p className="text-center text-sm text-zinc-500">Preparando…</p>
          )
        )}
      </div>
    </Modal>
  );
}

function DisableModal({ onClose }: { onClose: () => void }) {
  const disable = useDisableMfa();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      await disable.mutateAsync({ password, code: code.trim() });
      onClose();
    } catch (e) {
      setError(messageOf(e, "No se pudo desactivar."));
    }
  }

  return (
    <Modal open onClose={onClose} title="Desactivar verificación en dos pasos">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Tu cuenta quedará protegida solo por la contraseña. Tus códigos de
          recuperación dejarán de servir.
        </p>
        <div>
          <Label htmlFor="pw">Contraseña</Label>
          <Input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <CodeField
          value={code}
          onChange={setCode}
          allowRecovery
          autoFocus={false}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            loading={disable.isPending}
            disabled={!password || code.trim().length < 6}
            onClick={() => void submit()}
          >
            Desactivar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function RegenerateModal({
  onClose,
  onCodes,
}: {
  onClose: () => void;
  onCodes: (codes: string[]) => void;
}) {
  const regenerate = useRegenerateRecoveryCodes();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      const result = await regenerate.mutateAsync(code);
      onCodes(result.recovery_codes);
      onClose();
    } catch (e) {
      setError(messageOf(e, "No se pudieron generar."));
      setCode("");
    }
  }

  return (
    <Modal open onClose={onClose} title="Códigos de recuperación nuevos">
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Los códigos anteriores dejarán de servir. Confirma con un código de tu
          app (no con uno de recuperación).
        </p>
        <CodeField value={code} onChange={setCode} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            loading={regenerate.isPending}
            disabled={code.length !== 6}
            onClick={() => void submit()}
          >
            Generar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
