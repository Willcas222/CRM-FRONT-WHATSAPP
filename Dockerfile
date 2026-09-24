# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
# Next.js usa binarios nativos que en Alpine necesitan la compatibilidad con glibc
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Dependencias ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Desarrollo ----
FROM deps AS dev
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

# ---- Compilación de producción ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- Imagen final de producción (salida "standalone") ----
FROM base AS prod
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
