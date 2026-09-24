# CRM WhatsApp AI — Frontend (`front-crm`)

Interfaz web (Next.js 16, App Router, TypeScript, Tailwind 4) del SaaS CRM multi-tenant de automatización comercial con WhatsApp e IA.

**Este repositorio es independiente del backend.** Solo se comunican por HTTP. El contrato de la API, el modelo de datos y la arquitectura general están documentados en el repositorio del backend (carpeta hermana `back-api-crm`, en `docs/`: `ARCHITECTURE.md`, `API.md`, `DATABASE.md`). Los tipos TypeScript se generan desde el OpenAPI real del backend (`npm run generate-types`, ver `docs/DEPENDENCIES.md`).

> **Antes de escribir código:** esta versión de Next.js tiene cambios incompatibles con versiones anteriores. Lea la guía correspondiente en `node_modules/next/dist/docs/` (ver `AGENTS.md`).

Estado: **Fase 15 (automatizaciones en el frontend)**. Autenticación (login/registro con refresh silencioso, cierre de sesión automático tras 1 hora de inactividad), panel, bandeja de conversaciones (con las acciones de traspaso de la Fase 11: tomar, pasar a una persona, devolver, asignar; scroll siempre anclado al último mensaje), contactos, leads, Kanban de pipeline (arrastrar y soltar), configuración (cuenta, usuarios, canales de WhatsApp, pipeline, bot) y una nueva sección **Automatizaciones** (solo OWNER/ADMIN, `Permission.AUTOMATIONS_MANAGE`).

La sección Automatizaciones (`app/(app)/automations/`) permite crear, editar, activar/desactivar y eliminar reglas `Trigger → Condiciones → Pasos` consumiendo exclusivamente `/api/v1/automations` (MASTER_PLAN Fase 15: "El frontend debe consumir exclusivamente API"):

- **Disparador**: los 6 `TriggerType` del backend, con su configuración específica cuando aplica (`STAGE_CHANGED` → etapa opcional; `TIME_ELAPSED` → referencia + cantidad/unidad, convertida a `after_seconds`).
- **Condiciones** (hasta 10, todas deben cumplirse): los campos y operadores exactos de `automation_rules.py` (`contact.*`, `lead.stage_id/status/source`, o un dato personalizado `lead.metadata.<clave>`; operadores `eq/neq/in/gt/lt/contains/exists/not_exists`).
- **Pasos** (1 a 10): las 7 `ActionType` con su propio formulario de configuración (mensaje de WhatsApp, cambio de etapa, asignar/quitar agente, crear tarea, traspaso a un humano, webhook `https://` firmado, o ejecutar la IA).
- Cada automatización editada muestra su historial de ejecuciones (`GET /{id}/executions`, con resultado y error si falló).

La UI valida en el cliente las mismas reglas que ya valida el dominio (`automation_rules.py`) para dar error inmediato, pero el backend sigue siendo la única autoridad — MASTER_PLAN sección 10.

### Arquitectura del cliente

- `lib/api-schema.ts`: tipos generados del OpenAPI real (no editar a mano).
- `lib/api-client.ts`: cliente tipado (`openapi-fetch`) con el token de acceso en memoria (nunca en `localStorage`) y reintento automático tras un refresh silencioso cuando el token expira (`TOKEN_EXPIRED`, API.md 2.1).
- `lib/auth-context.tsx`: sesión (usuario, cuenta, permisos efectivos de `/me`); todo el árbol cuelga de `<AuthProvider>` (`app/providers.tsx`, junto con `QueryClientProvider` de TanStack Query).
- `lib/hooks/*`: un hook de TanStack Query por recurso (contactos, leads, pipelines, usuarios, inboxes, conversaciones, bots, automatizaciones). Como `LeadOut` no trae el contacto embebido (solo `contact_id`), `useContactsLookup` arma un mapa id → contacto del lado del cliente para las vistas de leads y el Kanban.
- `app/(app)/`: layout protegido (redirige a `/login` sin sesión) con la barra lateral y cada sección.

## Requisitos

Docker Desktop. No hace falta instalar Node en el equipo para ejecutarlo.

## Arranque

```bash
docker compose up --build       # http://localhost:3000
```

Necesita el backend levantado en su propio repositorio (`docker compose up` allí; publica `http://localhost:8000`). Si el backend no está activo, la página lo indica con "sin conexión".

Configuración opcional en `.env` (ver `.env.example`): puerto del frontend y `BACKEND_INTERNAL_URL`, la dirección del backend vista desde el contenedor (por defecto `http://host.docker.internal:8000`).

## Cómo se comunica con el backend

| Entorno | Mecanismo |
|---|---|
| Desarrollo | El navegador habla solo con `:3000`. Next reescribe `/api/*` hacia `BACKEND_INTERNAL_URL` (`next.config.ts`) |
| Producción | Un proxy inverso enruta `/` a este servicio y `/api`, `/webhooks` al backend (Fase 19). No hay reescrituras |

## Comandos

```bash
docker compose exec frontend npm run lint
docker compose exec frontend npx tsc --noEmit
docker compose exec frontend npm run generate-types   # regenera lib/api-schema.ts (backend arriba)
docker build --target prod -t front-crm .     # imagen de producción (salida "standalone")
docker compose down
```

> **Hallazgo (Fase 13):** `npm run build` (y por lo tanto `docker build --target prod`) falla hoy con `TypeError: Cannot read properties of null (reading 'useContext')` al pre-renderizar la página `/_global-error` que genera Next.js automáticamente. Se confirmó que es un defecto de Next.js 16.3.5 (versión `latest` de npm en la fecha de esta nota) y no del código de esta fase: el mismo error ocurre con un `app/layout.tsx` reducido al mínimo (sin `Providers` ni fuentes). El modo desarrollo (`docker compose up`, lo que usan todas las fases hasta el despliegue) no se ve afectado. Revisar antes de la Fase 19 (Deployment): probar una versión de Next.js más nueva o aplicar el *workaround* que documente el issue correspondiente en GitHub.

## Reglas

- El frontend **no contiene lógica de seguridad**: el backend es la autoridad (MASTER_PLAN, sección 10).
- No guardar secretos aquí: todo lo que llega al navegador es público.
- Dependencias: se registran con su justificación en `docs/DEPENDENCIES.md`.
