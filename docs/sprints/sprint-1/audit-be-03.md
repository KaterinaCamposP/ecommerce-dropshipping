# ✅ Audit BE-03 — Módulo Catalog: CRUD de productos, paginación, filtros y roles (ADMIN/CLIENTE)

> Check de actividades y criterios de finalización del ítem BE-03 (GitHub Projects #11) contra lo implementado en Sprint 1. Commit de implementación: `d7939f1` (incluye DTOs, service, controller, tests unitarios/integración y seed).

## Actividades

- [x] **Implementar `GET /api/products`** — ✅ Hecho. ProductsController.findAll público con OptionalJwtAuthGuard; responde `{ data, meta }`.
- [x] **Agregar paginación** — ✅ Hecho. `page`/`limit` en QueryProductsDto (defaults 1/10), `skip/take` en Prisma y `meta: { total, page, limit, totalPages }`; orden por `createdAt desc`.
- [x] **Agregar filtro por categoría** — ✅ Hecho. `where.category` exacto vía query param.
- [x] **Agregar filtro por precio** — ✅ Hecho. `minPrice`/`maxPrice` → `price: { gte, lte }`.
- [x] **Agregar búsqueda por texto** — ✅ Hecho. `search` → `OR` con `contains` + `mode: insensitive` sobre `title` y `description`.
- [x] **Implementar `GET /api/products/:id`** — ✅ Hecho. findOne con 404 si no existe y visibilidad por rol (inactivo → 404 para no-admin, 200 para ADMIN).
- [x] **Implementar CRUD administrativo de productos** — ✅ Hecho. POST (201), PATCH (200) y DELETE (204) en ProductsController; create/update/remove en ProductsService con chequeo de existencia previo (404).
- [x] **Proteger creación, edición y eliminación con rol `ADMIN`** — ✅ Hecho. `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` en los 3 endpoints de escritura.
- [x] **Validar DTOs con `class-validator`** — ✅ Hecho. CreateProductDto, UpdateProductDto (PartialType) y QueryProductsDto (`@Type(() => Number)` para query params); ValidationPipe global con `whitelist`, `forbidNonWhitelisted` y `transform`.
- [x] **Considerar campos `dropiProductId`, `active`, `stock`, `price`, `imageUrl`, `category`** — ✅ Hecho. Schema Product completo; `active` default true y usado para visibilidad; `dropiProductId` unique nullable reservado para Dropi.

## Criterios de finalización

- [x] **La listada pública de productos funciona** — ✅ Verificado manual (anónimo: `meta.total=5` ocultando 1 inactivo) + test de integración (200 con meta de paginación).
- [x] **Los filtros y la paginación funcionan correctamente** — ✅ Tests unitarios (skip/take, totalPages, categoría, rango de precio, búsqueda, active por rol) + tests de integración.
- [x] **El detalle de producto responde correctamente** — ✅ 200 con id válido, 404 inexistente, y 404/200 para inactivos según rol (tests de integración).
- [x] **Solo `ADMIN` puede crear, editar o eliminar productos** — ✅ 401 sin token, 403 con token CLIENTE, 201/200/204 con token ADMIN (tests de integración + verificación manual con el admin seeded).
- [x] **Los payloads inválidos son rechazados con validación** — ✅ 400 en body sin title/stock y con precio negativo (tests de integración); ValidationPipe global activo.
- [x] **El modelo queda preparado para sincronización futura con Dropi** — ✅ `dropiProductId String? @unique` en el schema. Nota: el job de sincronización (`@nestjs/schedule`) no era parte de Sprint 1; entra con la integración Dropi (Sprint 3, BE-08+). No bloquea el criterio.

## Resumen de desvíos BE-03

1. `@IsDecimal` reemplazado por `@IsNumber({ maxDecimalPlaces: 2 })` + `@Min(0)`: `@IsDecimal` de class-validator espera string y rechazaba payloads JSON numéricos (detectado por un test de integración con 400).
2. OptionalJwtAuthGuard en lecturas: catálogo público, pero ADMIN con token ve productos inactivos (decisión de diseño no explícita en el checklist).
3. Productos inactivos responden 404 (no 403) para no-admin: no se filtra la existencia del recurso.
4. DELETE con `@HttpCode(204)` sin body.
5. Seed: comando final `pnpm prisma db seed` (estándar Prisma 7, configurado en `prisma7.config.ts` con `tsx`) en vez del `pnpm db:seed` sugerido; idempotente (upsert del admin + check de conteo de productos).
6. Throttler desactivado en tests de integración con `overrideGuard(ThrottlerGuard)` (el `@Throttle` por ruta sobreescribe el global; mismo helper heredado de QA-01).
7. Dominio de catálogo nombrado `products` en vez de `catalog` (desvío arrastrado de BE-01, ya documentado).

## Conclusión

BE-03 quedó **completo** para el alcance del Sprint 1: CRUD con lecturas públicas paginadas/filtradas/buscables, escritura protegida por RBAC, DTOs validados, seed idempotente y modelo preparado para Dropi. Sin criterios abiertos; la sincronización con Dropi queda postergada por diseño al Sprint 3.
