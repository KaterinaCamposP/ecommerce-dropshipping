# ✅ Audit BE-01 — Setup NestJS, Prisma, PostgreSQL y Docker

> Check de actividades y criterios de finalización del ítem BE-01 (GitHub Projects) contra lo implementado en Sprint 1. Incluye desvíos anotados.

## Actividades

- [x] **Inicializar proyecto NestJS 11.x con TypeScript** — ✅ Hecho. NestJS 11.x + TypeScript en monorepo pnpm (`apps/api`). Commit `d5eef22`.
- [x] **Configurar arquitectura modular por dominios** — ⚠️ Desvío progresivo: módulos creados por sprint (`auth`, `users`, `products`, `prisma`, `common`). Los dominios `cart`, `orders`, `payments`, `dropshipping` se crean en sus sprints (BE-04, BE-05, Sprint 3). Nota: el dominio de catálogo se nombró `products` en vez de `catalog`.
- [x] **Configurar Prisma y conexión hacia Neon** — ⚠️ Desvío: Prisma **7.10.0** con PostgreSQL 16 local en Docker; Neon queda pendiente para deploy (documentado en README). Desvíos extra: Prisma 7 exige driver adapter `@prisma/adapter-pg` en runtime y `prisma7.config.ts` para el CLI; Prisma 8 RC descartado por incompatibilidad.
- [x] **Definir schema inicial con entidades** — ⚠️ Desvío por alcance: schema Sprint 1 = `User`, `RefreshToken` (modelo extra), `Product`. `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment` quedan planificados en el ERD del README y se agregan en Sprints 2-3.
- [x] **Definir enums** — ⚠️ Desvío por alcance: solo `Role` (CLIENTE/ADMIN). `OrderStatus` y `PaymentProvider` entran con BE-05 / Sprint 3.
- [x] **Crear migración inicial** — ✅ Migración `init` aplicada (`20260826233759_init`).
- [x] **Preparar seeds básicos para pruebas locales** — ✅ Con desvío: seed idempotente (`tsx`) con admin ADMIN + 6 productos. **Sin carritos** (el modelo aún no existe; se extiende en BE-04).
- [x] **Configurar variables de entorno y `.env.example`** — ✅ Completo. Desvío menor: se agregó `CORS_ORIGIN` (necesario para el frontend, no estaba en el checklist).
- [x] **Preparar Docker local o script de arranque** — ✅ `docker-compose.yml` con PostgreSQL 16 (`ecommerce_db`). Desvío menor: sin propiedad `version` (obsoleta en Compose v2+).

## Criterios de finalización

- [x] **La API levanta correctamente en local** — ✅ `http://localhost:3000` con prefijo `/api` + Swagger en `/api/docs`.
- [ ] **La conexión con Neon funciona** — ❌ Pendiente. Desvío: desarrollo local con Docker; Neon se configura y valida en deploy (Sprint 4).
- [x] **Las migraciones aplican sin errores en un entorno limpio** — ✅ Con desvío documentado: error `P1000` por PostgreSQL nativo de Windows pisando el puerto 5432 → `Stop-Service` + `Set-Service -StartupType Manual`.
- [x] **El schema Prisma coincide con el modelo de datos del proyecto** — ⚠️ Parcial: coincide con el alcance Sprint 1 + modelo extra `RefreshToken` (decisión documentada). El modelo completo (ERD README) se completa en Sprints 2-3.
- [x] **Existen seeds suficientes para probar usuarios, productos y carritos** — ⚠️ Parcial: usuarios (`admin@test.com` ADMIN + clientes de prueba) y productos (6). Carritos pendientes de BE-04.
- [x] **README inicial con instrucciones de instalación y variables de entorno** — ✅ README completo: setup, env vars, decisiones de arquitectura y desviaciones técnicas.

## Resumen de desvíos BE-01

1. DB local con Docker (PostgreSQL 16) en vez de Neon; Neon pendiente para deploy.
2. Prisma 7.10.0 con driver adapter `@prisma/adapter-pg` + `prisma7.config.ts`; Prisma 8 RC descartado.
3. Arquitectura modular progresiva por sprint; catálogo como `products`; módulo extra `users`.
4. Schema Sprint 1 acotado (User/RefreshToken/Product); `RefreshToken` es modelo extra sobre el doc base.
5. Enums por sprint: solo `Role` por ahora.
6. Seed sin carritos (se extiende en BE-04).
7. `docker-compose.yml` sin `version` (obsoleta).
8. Conflicto puerto 5432 con PostgreSQL nativo de Windows (servicio en Manual).
9. pnpm 11: `allowBuilds` en `pnpm-workspace.yaml`; CLI NestJS vía `pnpm dlx` (falló `npx` por devEngines).
10. `CORS_ORIGIN` agregado a `.env.example`.

## Conclusión

BE-01 quedó **funcionalmente completo para el alcance del Sprint 1**. Los ítems marcados ⚠️/❌ son postergaciones por diseño (scope por sprint) o pendientes de deploy (Neon), no bloquean el avance. El único criterio realmente abierto es la validación de Neon, que se cierra en Sprint 4 (QA-04/deploy).
