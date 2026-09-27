"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/misc";
import { asApiError, client } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { useHydrated } from "@/lib/use-hydrated";

const schema = z
  .object({
    password: z.string().min(10, "Mínimo 10 caracteres."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden.",
  });

type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const { response, error } = await client.POST(
        "/api/v1/auth/reset-password",
        { body: { token, new_password: values.password } },
      );
      if (response.ok) {
        toast.success("Contraseña cambiada. Inicia sesión con la nueva.");
        router.replace("/login");
        return;
      }
      const failure = asApiError(response.status, error);
      if (failure.details.some((d) => d.field === "token")) {
        setExpired(true);
      } else {
        setServerError(failure.details[0]?.issue ?? failure.message);
      }
    } catch {
      setServerError("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  }

  if (!token || expired) {
    return (
      <div
        role="alert"
        className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white p-7 text-sm text-zinc-700 shadow-2xl dark:bg-zinc-900 dark:text-zinc-200"
      >
        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
          El enlace no es válido o ya caducó
        </p>
        <p>Los enlaces sirven una sola vez y duran 30 minutos.</p>
        <Link
          href="/forgot-password"
          className="inline-block font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-300"
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  return (
    <form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white p-7 shadow-2xl dark:bg-zinc-900"
    >
      {serverError && <ErrorBanner message={serverError} />}
      <div>
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
      </div>
      <div>
        <Label htmlFor="confirm">Repite la contraseña</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
      </div>
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!hydrated}
        className="w-full"
      >
        Cambiar contraseña
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-800 via-sidebar to-zinc-950 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-white">
          Nueva contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-emerald-100/80">
          Elige una contraseña de al menos 10 caracteres
        </p>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
