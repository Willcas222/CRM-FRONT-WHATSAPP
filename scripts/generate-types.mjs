#!/usr/bin/env node
// Regenera lib/api-schema.ts desde el OpenAPI del backend real en ejecución (Fase 13).
// Requiere el backend levantado (docker compose up en back-api-crm). No se ejecuta en el build:
// el archivo generado se versiona, así el frontend compila sin el backend arriba.
import { execFileSync } from "node:child_process";

const url = process.env.BACKEND_URL ?? "http://localhost:8000";

execFileSync(
  "npx",
  ["openapi-typescript", `${url}/openapi.json`, "-o", "lib/api-schema.ts"],
  { stdio: "inherit", shell: true },
);
