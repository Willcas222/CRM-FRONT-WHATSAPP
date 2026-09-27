"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AUTHENTICATOR_HINT,
  CodeField,
  RecoveryCodes,
  SecretKey,
  TotpQr,
} from "@/components/admin/mfa";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import {
  ApiError,
  type MfaSetup,
  usePlatformAuth,
} from "@/lib/platform-auth-context";
import { useHydrated } from "@/lib/use-hydrated";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof schema>;

/**
 * Inicio de sesión del panel, en hasta tres pasos:
 *   1. correo y contraseña;
 *   2a. con doble factor activado: el código de la app (o uno de recuperación);
 *   2b. si la plataforma lo exige y aún no se activó: configurarlo (QR → código → códigos de recuperación).
 */
type Step =
  | { name: "password" }
  | { name: "code"; challenge: string }
  | { name: "enroll"; challenge: string; setup: MfaSetup | null }
  | { name: "recovery"; codes: string[] };

function messageOf(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    if (error.code === "MFA_CODE_INVALID")
      return "El código no es válido o ya se usó. Espera el siguiente e inténtalo otra vez.";
    if (error.code === "TOKEN_EXPIRED")
      return "Pasaron más de 5 minutos. Vuelve a escribir tu contraseña.";
    if (error.status === 401) return "Correo o contraseña incorrectos.";
    return error.message;
  }
  return "No se pudo conectar con el servidor. Intenta de nuevo.";
}

export default function AdminLoginPage() {
  const hydrated = useHydrated();
  const {
    status,
    login,
    verifyMfa,
    startEnrollment,
    confirmEnrollment,
    finishEnrollment,
  } = usePlatformAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "password" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (status === "authenticated") router.replace("/admin");
  }, [status, router]);

  function restart(message?: string) {
    setStep({ name: "password" });
    setCode("");
    setError(message ?? null);
  }

  async function onPassword(values: FormValues) {
    setError(null);
    try {
      const result = await login(values.email, values.password);
      if (result.kind === "mfa")
        setStep({ name: "code", challenge: result.challenge });
      if (result.kind === "enroll") {
        setStep({ name: "enroll", challenge: result.challenge, setup: null });
        const setup = await startEnrollment(result.challenge);
        setStep({ name: "enroll", challenge: result.challenge, setup });
      }
    } catch (e) {
      setError(messageOf(e));
    }
  }

  async function onCode(challenge: string) {
    setBusy(true);
    setError(null);
    try {
      await verifyMfa(challenge, code.trim());
    } catch (e) {
      if (e instanceof ApiError && e.code === "TOKEN_EXPIRED")
        return restart(messageOf(e));
      setError(messageOf(e));
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  async function onEnroll(challenge: string) {
    setBusy(true);
    setError(null);
    try {
      const codes = await confirmEnrollment(challenge, code.trim());
      setStep({ name: "recovery", codes });
    } catch (e) {
      if (e instanceof ApiError && e.code === "TOKEN_EXPIRED")
        return restart(messageOf(e));
      setError(messageOf(e));
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-50">
          CRM Plataforma
        </h1>
        <p className="mt-1 text-center text-sm text-indigo-400">
          Acceso SuperAdmin
        </p>

        <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-zinc-900 p-6 text-zinc-100">
          {error && <ErrorBanner message={error} />}

          {step.name === "password" && (
            <form
              method="post"
              onSubmit={handleSubmit(onPassword)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!hydrated}
                className="w-full"
              >
                Entrar
              </Button>
            </form>
          )}

          {step.name === "code" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void onCode(step.challenge);
              }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-semibold">
                  Verificación en dos pasos
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Abre tu app autenticadora y escribe el código de 6 dígitos de
                  «CRM Plataforma». Si perdiste el teléfono, usa uno de tus
                  códigos de recuperación.
                </p>
              </div>
              <CodeField value={code} onChange={setCode} allowRecovery />
              <Button
                type="submit"
                loading={busy}
                disabled={code.trim().length < 6}
                className="w-full"
              >
                Verificar
              </Button>
              <button
                type="button"
                onClick={() => restart()}
                className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200"
              >
                ← Usar otra cuenta
              </button>
            </form>
          )}

          {step.name === "enroll" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void onEnroll(step.challenge);
              }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-base font-semibold">
                  Activa la verificación en dos pasos
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  La plataforma la exige para entrar. {AUTHENTICATOR_HINT}
                </p>
              </div>
              {step.setup ? (
                <>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
                    <li>En la app, pulsa «+» y escanea este código.</li>
                    <li>Escribe el código de 6 dígitos que aparece.</li>
                  </ol>
                  <TotpQr uri={step.setup.uri} />
                  <details className="text-sm text-zinc-400">
                    <summary className="cursor-pointer">
                      ¿No puedes escanear? Escribe la clave
                    </summary>
                    <div className="mt-2">
                      <SecretKey secret={step.setup.secret} />
                    </div>
                  </details>
                  <CodeField value={code} onChange={setCode} />
                  <Button
                    type="submit"
                    loading={busy}
                    disabled={code.length !== 6}
                    className="w-full"
                  >
                    Activar y entrar
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-zinc-400">Preparando…</p>
              )}
            </form>
          )}

          {step.name === "recovery" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">
                Tus códigos de recuperación
              </h2>
              <RecoveryCodes
                codes={step.codes}
                onDone={finishEnrollment}
                doneLabel="Entrar al panel"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
