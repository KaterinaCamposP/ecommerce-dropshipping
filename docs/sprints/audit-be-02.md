# ✅ Audit BE-02 — Módulo Auth: JWT (Access/Refresh), Local (bcrypt) y Google OAuth (Passport)

> Check de actividades y criterios de finalización del ítem BE-02 (GitHub Projects #10) contra lo implementado en Sprint 1. Commits de implementación: `aa23104` (auth local + refresh) y `aba0ac8` (google oauth con fallback). Tests: `62cac71`.

## Actividades

- [x] **Implementar `POST /api/auth/register`** — ✅ Hecho. AuthController + RegisterDto (class-validator); 409 si el email existe; rate limit 5/min (@Throttle).
- [x] **Hashear contraseñas con `bcrypt`** — ✅ Hecho. `bcrypt.hash` (costo 10) en registro; `bcrypt.compare` en login; el hash nunca se expone (sanitize-user).
- [x] **Implementar `POST /api/auth/login`** — ✅ Hecho. LocalStrategy + LocalAuthGuard; 401 en credenciales inválidas o cuenta Google sin password local.
- [x] **Generar `accessToken` con expiración de 1 hora** — ✅ Hecho. JWT firmado con `JWT_ACCESS_SECRET`, `expiresIn: JWT_ACCESS_EXPIRES_IN` ("1h"); payload `sub/email/role`.
- [x] **Generar `refreshToken` con expiración de 7 días** — ✅ Hecho con desvío/mejora: token **opaco** (128 hex) persistido como hash SHA-256 en `RefreshToken` con `expiresAt` = 7 días (`JWT_REFRESH_EXPIRES_IN`), en vez de JWT stateless.
- [x] **Implementar `POST /api/auth/refresh`** — ✅ Hecho. `TokensService.rotate`: valida hash, expiración y revocación; revoca el viejo y emite nuevos (rotación); 401 en token desconocido/revocado/expirado.
- [x] **Implementar flujo Google OAuth con Passport** — ✅ Hecho con desvío: fallback 501 en ambas rutas si no hay credenciales (decisión documentada; la app arranca sin OAuth).
  - [x] `GET /api/auth/google` — GoogleAuthGuard con fallback 501.
  - [x] `GET /api/auth/google/callback` — GoogleStrategy + `findOrCreateGoogleUser`.
- [x] **Crear o vincular cuenta Google con usuario local** — ✅ Implementado (`findByGoogleId` / `createWithGoogle` / `linkGoogleId` si el email ya existe localmente). ⚠️ Sin verificación E2E con cuenta Google real (sin credenciales locales).
- [x] **Implementar `GET /api/users/me`** — ✅ Hecho. Protegido con JwtAuthGuard; responde el usuario sin `passwordHash`.
- [x] **Configurar Guards JWT y RBAC para roles `CLIENTE` y `ADMIN`** — ✅ Hecho. JwtStrategy/JwtAuthGuard en BE-02; rol viaja en el payload JWT. El RBAC (`RolesGuard` + `@Roles`) se commiteó en QA-01 (`62cac71`) y quedó operativo en BE-03.

## Criterios de finalización

- [x] **Registro local funciona correctamente** — ✅ Verificado manual (`kate@test.com`, `usuario@test.com` desde el form web) + tests unitarios e integración (201/400/409).
- [x] **Login local devuelve tokens válidos** — ✅ JWT verificable (sub/email/role) + refresh token; cubierto por tests unitarios e integración.
- [x] **Refresh token funciona correctamente** — ✅ Tests unitarios de TokensService: rotación válida, revocado, expirado y desconocido; endpoint verificado manualmente.
- [ ] **Google OAuth crea o vincula cuentas correctamente** — ⚠️ Implementado con fallback 501 verificado; **verificación E2E con credenciales reales pendiente** (se cierra al disponer de un proyecto Google OAuth, p.ej. Sprint 4/QA-04).
- [x] **El endpoint `/users/me` protege rutas con JWT** — ✅ 401 sin token / 200 con token (manual + tests de integración).
- [x] **Los roles `CLIENTE` y `ADMIN` están operativos** — ✅ Enum `Role` en schema y payload JWT; RolesGuard con tests unitarios (pasa sin metadata, 401 sin user, 403 rol faltante); operación real demostrada en BE-03 (CLIENTE 403 / ADMIN 201 en products).

## Resumen de desvíos BE-02

1. Refresh token opaco persistido con hash SHA-256 y rotación con revocación (modelo extra `RefreshToken`), en vez de JWT stateless: decisión "Refresh Token persistido" (README).
2. Google OAuth con fallback 501 sin credenciales: la app funciona sin OAuth; el flujo real se activa solo con `GOOGLE_CLIENT_ID/SECRET` cargados.
3. Rate limiting adelantado a Sprint 1 en register/login/refresh (`@nestjs/throttler`); hardening global queda en BE-11.
4. RBAC (`RolesGuard` + `@Roles`) commiteado en QA-01 y aplicado por primera vez en BE-03; BE-02 deja el rol en el JWT y el enum `Role` operativo.
5. Flujo Google sin verificación E2E con cuenta real (sin credenciales locales); la lógica create/link quedó implementada y el fallback verificado.
6. Access JWT con payload `sub/email/role` y expiración configurable por env (`JWT_ACCESS_EXPIRES_IN`).

## Conclusión

BE-02 quedó **completo para el alcance del Sprint 1**, con dos mejoras sobre el doc base (refresh persistido con rotación/revocación y fallback de OAuth). El único criterio abierto es la verificación E2E de Google OAuth con credenciales reales, condicionada a disponer de un proyecto OAuth (cierre sugerido: Sprint 4 / QA-04).
