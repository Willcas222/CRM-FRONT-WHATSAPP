import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM WhatsApp AI",
  description: "CRM multi-tenant de automatización comercial con WhatsApp e IA",
};

// La CSP con nonce (middleware.ts) exige que la página se renderice en cada petición: un nonce es
// de un solo uso, y una página estática se generaría UNA vez en la compilación sin ninguno real.
// Como toda la aplicación vive detrás de inicio de sesión y ya trae sus datos por la API (no hay
// nada que valga la pena servir desde caché), el costo de renderizar cada vez es aceptable.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
