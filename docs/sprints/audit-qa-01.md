# ✅ Audit QA-01 — Setup Jest y Supertest. Tests unitarios para servicios de Auth y Guards

> Check de actividades y criterios de finalización del ítem QA-01 (GitHub Projects #20) contra lo implementado en Sprint 1. Commit de implementación: `62cac71`. Al cierre: 31 tests / 6 suites verdes (hoy 59 / 8 con los agregados de BE-03).

## Actividades

- [x] **Configurar Jest en el backend** — ✅ Hecho. Jest 30.4.2 + ts-jest 29.4.12 en `apps/api`; config en `package.json` (`rootDir: src`, `testRegex: .spec.ts`). Desvío menor: `"types": ["node", "jest"]` en `tsconfig.json` porque el TS 6 embebido de VS Code no auto-incluye `@types/jest`.
- [x] **Configurar Supertest para pruebas HTTP** — ✅ Hecho. supertest 7.2.2 + @types/supertest; tests de integración ligera con app NestJS real (`test/helpers/create-test-app.ts`). Desvío menor: import default (`import request from 'supertest'`) por `moduleResolution: nodenext`.
- [x] **Preparar base de datos de prueba o estrategia de rollback** — ✅ Hecho con desvío/decisión: **sin DB de pruebas**; estrategia = mock de `PrismaService` con `jest.fn()` (`test/helpers/mock-prisma.ts`) + `resetPrismaMock()` por test, y app real con Prisma mockeado vía `overrideProvider`. Más rápido y sin datos frágiles ni rollbacks.
- [x] **Escribir tests para registro de usuarios** — ✅ Hecho. Unitarios (`auth.service.spec`: 409 email duplicado, hash bcrypt verificable) + integración (`auth.integration.spec`: 201, 400 password débil, 400 campos faltantes, 409 duplicado).
- [x] **Escribir tests para login local** — ✅ Hecho. Unitarios (`validateLocal`: inexistente, cuenta Google sin password, password incorrecta, credenciales válidas; `login` delega emisión) + integración (201, 401 password incorrecta, 401 usuario inexistente).
- [x] **Escribir tests para refresh token** — ✅ Hecho. `tokens.service.spec`: emisión (JWT verificable + hash SHA-256 persistido) y rotación (válida revoca viejo, desconocido, revocado, expirado → 401) + delegación en `auth.service.spec`.
- [x] **Escribir tests para guards JWT** — ✅ Hecho. `jwt-auth.guard.spec` (delegación al guard base Passport + mapeo payload→user de JwtStrategy) + integración (`GET /api/users/me`: 401 sin token, 200 con token).
- [x] **Escribir tests para guards por rol** — ✅ Hecho. `roles.guard.spec` (sin metadata pasa; sin user 401; rol faltante 403; rol correcto pasa) + integración de products (CLIENTE 403, ADMIN 201/200/204). Nota: `RolesGuard` + `@Roles()` se crearon dentro de QA-01 (Opción A) porque el backlog pedía testearlos y aún no existían; quedaron operativos en BE-03.

## Criterios de finalización

- [x] **La suite de tests ejecuta correctamente** — ✅ `pnpm test` verde al cierre (31 tests / 6 suites); hoy 59 / 8 con los specs de BE-03.
- [x] **Auth queda cubierto con tests unitarios y de integración básicos** — ✅ Unitarios: AuthService (8) + TokensService (6). Integración HTTP: auth.integration (10).
- [x] **Los guards rechazan accesos sin token o con rol incorrecto** — ✅ 401 sin token (`/users/me`, `POST /products`), 403 con rol CLIENTE en rutas ADMIN; cubierto también a nivel unitario en RolesGuard.
- [x] **Los tests no dependen de datos manuales frágiles** — ✅ Mocks `jest.fn()` reseteados por test (`resetPrismaMock`), secretos fijos de test vía `ConfigModule.forRoot({ load })` en el helper, sin DB real ni seeds manuales.
- [x] **Existe script `npm run test` funcional** — ✅ `"test": "jest"` en `apps/api/package.json` (funciona con `npm run test` y `pnpm test` desde `apps/api`). Nota: la raíz del monorepo no tiene script de tests por diseño (los tests viven en el workspace api).

## Resumen de desvíos QA-01

1. Sin base de datos de pruebas ni rollback: mock de PrismaService + reset por test (decisión: suite rápida, determinista y sin datos frágiles).
2. `"types": ["node", "jest"]` en tsconfig por TS 6 embebido de VS Code.
3. Combinación Jest 30 + ts-jest 29.4 verificada como compatible (no requirió downgrade).
4. supertest con import default por `moduleResolution: nodenext`.
5. Throttler desactivado en tests de integración con `overrideGuard(ThrottlerGuard)`: el `@Throttle` por ruta sobreescribe el global de `forRoot` y generaba 429 en cascada.
6. Test dummy temporal (`smoke.spec.ts`) eliminado antes del commit (no es parte del entregable).
7. `RolesGuard` + decorador `@Roles()` creados dentro de QA-01 (no existían): decisión Opción A para cumplir el backlog de testear guards por rol.

## Conclusión

QA-01 quedó **completo y verde** para el alcance del Sprint 1. La única desviación relevante es la estrategia de testing sin DB real (mocks de Prisma), deliberada y documentada; no hay criterios abiertos. La suite creció de 31 a 59 tests al sumarse BE-03, manteniendo los mismos helpers.
