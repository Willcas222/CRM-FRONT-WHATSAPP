import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSP estricta con nonce (receta oficial de Next.js: https://nextjs.org/docs/app/guides/content-security-policy).
 *
 * Antes la CSP (puesta por Caddy) no restringía `script-src`: restringirlo de verdad exige que cada
 * script tenga un nonce, porque Next.js inyecta scripts en línea para la hidratación. Aquí se genera un
 * nonce nuevo por petición y se manda en dos sitios:
 *  - como cabecera de PETICIÓN (`x-nonce` / la propia CSP): Next.js la lee y añade el nonce automáticamente
 *    a los scripts y estilos que él mismo inyecta, sin tocar cada página.
 *  - como cabecera de RESPUESTA (`Content-Security-Policy`): es la que hace cumplir el navegador.
 *
 * `strict-dynamic`: un script con el nonce correcto puede cargar otros scripts (los "chunks" de Next),
 * y el navegador ignora la lista de orígenes de `script-src` (por eso igual se sirve todo desde `self`:
 * es el respaldo para navegadores viejos que no entienden `strict-dynamic`).
 *
 * `style-src` sí lleva `unsafe-inline`: los nonces no cubren el atributo `style` (las barras de
 * progreso de la Ficha del cliente lo usan), y por especificación CSP un nonce no sirve para eso.
 * El riesgo de una inyección de CSS es mucho menor que el de una de JavaScript.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Todo menos los estáticos de Next (no son HTML: la CSP no les hace falta y calcular un nonce
      // por cada uno sería puro gasto) y las peticiones de precarga del router (llevarían un nonce
      // que no coincide con el de la navegación real y romperían la página precargada).
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
