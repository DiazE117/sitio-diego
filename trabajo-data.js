/* ============================================================
   trabajo-data.js — Trabajos y proyectos (páginas de detalle)
   ============================================================
   Cada entrada:
   {
     slug:      "kebab-case",
     tipo:      "trabajo" | "proyecto",
     titulo:    "...",
     rol:       "subtítulo / rol",
     periodo:   "ahora" | "2024 — 2025" | etc,
     activo:    true,                    // dot verde "ahora"
     img:       "images/work/<archivo>",
     web:       "https://..." | null,     // link externo opcional
     tags:      ["...", "..."],
     contenido: "markdown del detalle"
   }
   ============================================================ */

window.TRABAJOS = [
  {
    slug:    "pre-prensa",
    tipo:    "trabajo",
    titulo:  "Pre-prensa",
    rol:     "pre-prensista",
    periodo: "ahora",
    activo:  true,
    img:     "images/work/preprensa.jpg",
    web:     null,
    tags:    ["gestión de color", "imposición", "control de calidad", "impresión"],
    contenido: `
Trabajo como **pre-prensista**, el paso que conecta el diseño con la prensa.
Mi labor es asegurar que cada archivo salga impecable antes de imprimirse.

## Qué hago

- **Gestión de color** — perfiles ICC, calibración y pruebas para que lo impreso coincida con lo diseñado.
- **Imposición** — acomodo de páginas en el pliego para optimizar papel y acabados.
- **Control de calidad** — revisión de sangrados, resolución, sobreimpresiones y trapping.
- **Pruebas de color** — pruebas físicas y digitales antes del tiraje.

## Por qué me gusta

La pre-prensa es donde el oficio se vuelve invisible: si todo sale bien, nadie lo nota.
Es un trabajo de precisión y detalle que me obliga a entender tanto el diseño como la
mecánica de la impresión — justo la intersección que me apasiona.
`
  },
  {
    slug:    "cofinance",
    tipo:    "proyecto",
    titulo:  "CoFinance",
    rol:     "creador · app de finanzas personales",
    periodo: "proyecto propio",
    activo:  false,
    img:     "images/work/cofinance.jpg",
    web:     null,
    tags:    ["producto", "diseño", "desarrollo", "finanzas"],
    contenido: `
**CoFinance** es una aplicación para llevar el control de las finanzas personales
de forma simple y visual. Un proyecto propio donde me encargué del diseño y el
desarrollo de punta a punta.

## La idea

Llevar las cuentas personales suele ser tedioso. CoFinance busca que registrar gastos
e ingresos sea rápido, y que entender en qué se va el dinero sea inmediato — con
visualizaciones claras en lugar de hojas de cálculo.

## Mi rol

- **Diseño de producto** — flujo, interfaz y experiencia.
- **Desarrollo** — implementación de la app.
- **Identidad visual** — logo y estética.
`
  }
];
