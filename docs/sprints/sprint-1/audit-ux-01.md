# ✅ Audit UX-01 — Wireframes básicos de Storefront y Admin. Setup de Tailwind

> Check de actividades y criterios de finalización del ítem UX-01 (GitHub Projects #1) contra lo implementado en Sprint 1. Commit de implementación: `46b0d4a` (`docs/ux/wireframes.md` + 6 PNG en `docs/ux/img/`).

## Actividades

- [x] **Diseñar wireframes de Home, listado de productos, detalle, carrito y checkout** — ✅ Hecho con desvío parcial: Home/listado (2.2 con filtros y paginación), detalle (2.3) y checkout (2.4) entregados. **Carrito lateral sin wireframe dedicado**: postergado por diseño a UX-02 (Sprint 2), que según backlog cubre "Vitrina, Carrito lateral y flujo de Checkout"; la tabla de mapeo del doc ya lo anuncia (fila "Carrito lateral → FE-02").
- [x] **Diseñar wireframes de login, registro y panel administrativo** — ✅ Hecho. Login/registro (2.1); panel admin con productos CRUD (3.1) y pedidos (3.2, preview Sprint 2-3).
- [x] **Definir paleta de colores, tipografías, espaciados y componentes base** — ✅ Hecho con nota: sección 1 del doc define paleta (tabla de clases Tailwind), tipografías (tamaños por uso) y componentes base. Espaciados definidos implícitamente vía clases de componentes (`px-4 py-2`, `p-4`, gaps de grid) sobre la escala default de Tailwind, sin escala custom.
- [x] **Preparar configuración inicial de Tailwind con tokens de diseño** — ✅ Hecho con desvío: los tokens se definieron como **guía de clases** en `wireframes.md` (sección 1), no como archivo de config con tokens custom. El setup efectivo de Tailwind 4 se realizó en FE-01 (`create-next-app --tailwind`); en Tailwind 4 los tokens custom se declaran en CSS (`@theme`), y se agregarán en UX-02/FE-02 solo si la guía lo requiere.
- [x] **Definir estados vacíos, de carga, error y éxito** — ⚠️ Parcial: no se formalizaron como sección del doc en UX-01. Se aplicaron de facto en FE-01: estado vacío ("No hay productos disponibles."), error (banner rojo con mensaje) y carga (botones "Iniciando sesión..." / "Creando cuenta..."). Guía formal de estados postergada a UX-02.

## Criterios de finalización

- [x] **Wireframes principales listos y revisados** — ✅ 6 PNG generados, revisados y ajustados en sesión (sección 2.4 renombrada a "Checkout"; tabla de mapeo corregida); commiteados en `46b0d4a` y renderizados en GitHub.
- [x] **Configuración base de Tailwind definida** — ✅ Con desvío (ver actividad 4): guía de clases versionada + Tailwind 4 operativo en `apps/web` desde FE-01; tokens custom postergados a UX-02/FE-02.
- [x] **Componentes base identificados: botones, inputs, cards, tablas, badges** — ✅ Botones, inputs y cards en la sección 1 (clases concretas); tablas y badges de estado identificados visualmente en los wireframes admin (3.1 y 3.2). Nota: tablas/badges aún sin guía de clases propia (se agregará al implementar FE-04).
- [x] **Guía visual inicial disponible para el equipo frontend** — ✅ `docs/ux/wireframes.md` versionado en el repo con sistema de diseño + mapeo de vistas por sprint; usado como referencia real en FE-01 (header, cards de vitrina y botones siguen la guía).

## Resumen de desvíos UX-01

1. Herramienta de generación: **Qwen (imágenes)** en vez de Uizard/Visily/v0: las plataformas sugeridas agotaron tokens y v0 no permitía exportar PNG. Los prompts no se incluyeron en el doc final (decisión de la usuaria).
2. Carrito lateral sin wireframe dedicado: postergado por diseño a UX-02 (Sprint 2); el mapeo del doc ya lo reserva.
3. Tokens de diseño como guía de clases en `wireframes.md` en vez de config con tokens custom: Tailwind 4 (instalado en FE-01) configura tokens vía CSS `@theme`; se definirán custom solo si UX-02/FE-02 lo requieren.
4. Estados vacíos/carga/error/éxito no formalizados en el doc UX-01: implementados de facto en FE-01; guía formal en UX-02.
5. Espaciados sin escala global explícita (se usa la escala default de Tailwind + clases de componentes).
6. Wireframes admin de pedidos/métricas incluidos como preview (Sprint 2-4), por encima del mínimo de Sprint 1.

## Conclusión

UX-01 quedó **completo para el alcance del Sprint 1**: 6 wireframes revisados y versionados + sistema de diseño que guio FE-01 de forma verificable. Los ítems parciales (carrito lateral, estados formales, tokens custom) quedan absorbidos por UX-02 en Sprint 2 por diseño del backlog, no como deuda no planificada.
