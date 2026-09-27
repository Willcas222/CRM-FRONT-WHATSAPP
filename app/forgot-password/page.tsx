"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { asApiError, client } from "@/lib/api-client";
import { useHydrated } from "@/lib/use-hydrated";

const schema = z.object({
  email: z.string().min(1, "Ingresa tu correo.").email("Correo no válido."),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const hydrated = useHydrated();
  const [sent, setSent] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const { response, error } = await client.POST(
        "/api/v1/auth/forgot-password",
        { body: { email: values.email } },
      );
      if (response.status === 429) {
        setServerError(
          "Has pedido demasiados enlaces. Espera unos minutos e intenta de nuevo.",
        );
        return;
      }
      if (error !== undefined || !response.ok) {
        throw asApiError(response.status, error);
      }
      setSent(values.email);
    } catch {
      setServerError("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-800 via-sidebar to-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-emerald-100/80">
          Te enviaremos un enlace para elegir una nueva
        </p>

        {sent ? (
          <div
            role="status"
            className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white p-7 text-sm text-zinc-700 shadow-2xl dark:bg-zinc-900 dark:text-zinc-200"
          >
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              Revisa tu correo
            </p>
            <p>
              Si <strong>{sent}</strong> está registrado, te enviamos un enlace
              para cambiar la contraseña. Sirve una sola vez y caduca en 30
              minutos.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ¿No llega? Mira en spam o correo no deseado. Si sigue sin llegar,
              pide a un administrador de tu organización que restablezca tu
              contraseña.
            </p>
          </div>
        ) : (
          <form
            method="post"
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white p-7 shadow-2xl dark:bg-zinc-900"
          >
            {serverError && <ErrorBanner message={serverError} />}
            <div>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!hydrated}
              className="w-full"
            >
              Enviar enlace
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-emerald-100/80">
          <Link
            href="/login"
            className="font-semibold text-white underline underline-offset-2"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
