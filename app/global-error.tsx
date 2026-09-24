"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900">Algo salió mal.</h2>
          <button
            onClick={() => retry()}
            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
