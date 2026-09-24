# DEPENDENCIES.md — Frontend

> Exigido por el MASTER_PLAN (sección 33): cada dependencia se justifica y se registra.
> Versiones verificadas contra npm el **2026-09-20**. Se instala solo lo que la fase en curso necesita.
> Las dependencias del backend se registran en su propio repositorio.

## En uso

| Paquete | Versión | Notas |
|---|---|---|
| next | 16.3.5 | Fijada exacta. **Leer `node_modules/next/dist/docs/` antes de escribir código** (AGENTS.md; riesgo R9). Sustituye a "Next.js 14+" del plan (decisión D3) |
| react, react-dom | 19.2.8 | Fijadas exactas |
| tailwindcss, @tailwindcss/postcss | ^4 | Stack del plan |
| typescript | ^5 | |
| eslint, eslint-config-next | ^9 / 16.3.5 | Lint |
| @types/node, @types/react, @types/react-dom | ^20 / ^19 | Tipos |

| @tanstack/react-query | ^5.103 | Caché y sincronización de datos del servidor (listas paginadas, refetch tras mutaciones). Único estado de servidor: sin Redux ni Zustand |
| react-hook-form | ^7.88 | Formularios (login, contactos, leads, automatizaciones futuras) sin recrear el árbol en cada tecla |
| zod | ^4.6 | Esquemas de validación en el cliente, espejo de las reglas del backend (feedback inmediato; el backend sigue siendo la autoridad, MASTER_PLAN sección 10) |
| @hookform/resolvers | ^5.9 | Conecta Zod con React Hook Form |
| @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | ^6.3 / ^10.0 / ^3.2 | Arrastrar y soltar del Kanban de leads (sección 13.7). Mantenido activamente; alternativa (`react-beautiful-dnd`) sin publicaciones desde 2022 |
| clsx | ^2.1 | Concatenar clases de Tailwind condicionales sin plantillas de texto propensas a error |
| openapi-typescript (dev) | ^7.13 | Genera `lib/api-schema.ts` desde `openapi.json` del backend real (`npm run generate-types`). El archivo generado se versiona: el frontend compila sin el backend levantado |
| openapi-fetch | ^0.17 | Cliente HTTP tipado a partir de `lib/api-schema.ts`: cada ruta, parámetro y cuerpo sale del contrato real del backend, sin duplicar tipos a mano |

`npm audit`: 0 vulnerabilidades tras instalar lo anterior (2026-09-22).

## Imagen base

`node:22-alpine`.
