import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No anunciar la tecnología del servidor (X-Powered-By: Next.js): información gratis para un atacante
  poweredByHeader: false,
  // Imagen de producción mínima (ver frontend/Dockerfile)
  output: "standalone",

  // En desarrollo el navegador habla con un solo origen (:3000) y Next reenvía /api al backend.
  // En producción el proxy inverso enruta /api y /webhooks, por lo que no se reescribe nada.
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    const backend = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
