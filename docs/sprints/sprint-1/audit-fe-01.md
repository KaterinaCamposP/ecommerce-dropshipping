# ✅ Audit FE-01 — Setup Next.js 15 (App Router), Layouts globales y página de Login/Registro

> Check de actividades y criterios de finalización del ítem FE-01 (GitHub Projects #5) contra lo implementado en Sprint 1. Commits de implementación: `d863e9c` (setup + layout + vitrina) y `b1a5d23` (login/registro + sesión).

## Actividades

- [x] **Inicializar proyecto Next.js 15 con App Router y TypeScript** — ✅ Hecho. `create-next-app@15` (Next 15.5.25) con flags `--typescript --tailwind --eslint --app --src-dir`; integrado al monorepo pnpm; dev en puerto 3001 (el que CORS autoriza).
- [x] **Configurar Tailwind CSS usando la base definida por UX** — ✅ Hecho. Tailwind 4 vía create-next-app; las clases aplicadas siguen la guía de `docs/ux/wireframes.md` (paleta neutral/blue, cards, botones, inputs). Nota: Tailwind 4 configura por CSS (`@theme`), no hay `tailwind.config.js` con tokens custom (ver desvíos).
- [x] **Crear layouts globales para storefront, autenticación y administración** — ⚠️ Parcial por diseño: layout global raíz (`layout.tsx` con `Header` + `main`) cubre storefront y auth (login/registro usan card centrada sobre el layout global). **Layout anidado de admin postergado a FE-04** (Sprint 4), cuando exista el panel en el frontend.
- [x] **Implementar pantallas de login y registro** — ✅ Hecho. `/login` y `/register` como Client Components con formularios completos y enlaces cruzados entre ambas.
- [x] **Conectar login y registro con los endpoints de autenticación** — ✅ Hecho. `api.post('/auth/login')` y `api.post('/auth/register')` vía `src/lib/api.ts` (base `NEXT_PUBLIC_API_URL` con fallback a `http://localhost:3000/api`); guardado de tokens y redirect a home.
- [x] **Manejar estados de carga, error y validación básica de formularios** — ✅ Hecho. Carga (botón disabled + "Iniciando sesión..." / "Creando cuenta..."), error (banner rojo con el mensaje de la API, ej. 401/409) y validación básica (HTML nativo `required`/`type=email` + mensajes del class-validator del backend reflejados en el banner).

## Criterios de finalización

- [x] **El proyecto frontend levanta correctamente en local** — ✅ `pnpm dev` → `http://localhost:3001` con GET / 200; vitrina SSR consumiendo `GET /api/products` (5 productos del seed).
- [x] **Las pantallas de login y registro están funcionales** — ✅ Verificado manual: login con `admin@test.com` redirige y cambia el header; registro desde el form creó `usuario@test.com` (confirmado en Prisma Studio).
- [x] **La aplicación consume correctamente la API de auth** — ✅ Cliente fetch tipado con `Authorization: Bearer` desde localStorage; errores HTTP capturados y mostrados (401 login inválido, 409 email duplicado).
- [x] **Existe manejo básico de sesión o persistencia de tokens** — ✅ `accessToken`/`refreshToken` en localStorage; `Header` cambia según sesión (Entrar/Registrarse ↔ Mi cuenta/Salir); logout limpia tokens y redirige. Desvío/decisión: localStorage como MVP; httpOnly cookies + interceptor de refresh postergados al hardening (BE-11, Sprint 4).
- [x] **La estructura de carpetas está preparada para escalar** — ✅ `src/app` (rutas App Router), `src/components`, `src/lib` (cliente API), `src/hooks` (reservado); rutas por dominio (`/login`, `/register`) listas para anidar layouts y grupos de rutas.

## Resumen de desvíos FE-01

1. Layout global único (raíz) en vez de tres layouts (storefront/auth/admin): layouts anidados progresivos; el layout de admin con sidebar entra en FE-04 (Sprint 4).
2. JWT en localStorage (decisión MVP documentada): migración a httpOnly cookies + interceptor de refresh postergada a BE-11/Sprint 4.
3. Tailwind 4 con configuración CSS-based: la guía UX-01 se aplicó como clases concretas; tokens custom vía `@theme` solo si UX-02/FE-02 los requieren.
4. Validación de formularios con HTML nativo + mensajes del backend; validación client-side avanzada (react-hook-form/zod) no implementada en Sprint 1.
5. FE-01 cerrado en 2 commits incrementales (setup+vitrina, luego login/registro) para mantener la racha diaria de commits sin romper Conventional Commits.
6. Home con vitrina SSR incluida en FE-01 (fuera del checklist): primer punto de integración con BE-03 y verificación visual del sistema de diseño.
7. Hydration error en dev causado por la extensión Dark Reader del navegador: no es bug del proyecto (documentado; no afecta sin la extensión).

## Conclusión

FE-01 quedó **completo para el alcance del Sprint 1**: Next.js 15 + Tailwind operativos, pantallas de autenticación funcionales e integradas con la API real, sesión persistida y estructura escalable. Los ítems parciales (layout admin, cookies httpOnly, validación avanzada) quedan postergados por diseño a FE-04 y BE-11, no como deuda no planificada.
