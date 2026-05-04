# sitio-diego

Clon visual fiel del aesthetic de [sabesh.space](https://www.sabesh.space/) adaptado a tus datos.

## Stack

- **HTML + CSS + Tailwind CDN** (sin build step, sin npm)
- Tipografías: **Lexend Deca** (texto) y **Silkscreen** (footer pixel) vía Google Fonts
- Animaciones CSS puras (entrada, marquee, hover bouncy)

Esto es deliberado: cero dependencias = se mete tal cual en WordPress.

## Cómo verlo localmente

Doble clic en `index.html` (o servir con cualquier server estático):

```
python3 -m http.server 8000
# luego: http://localhost:8000
```

## Estructura

```
sitio-diego/
├── index.html       ← marcado completo (nav, hero, mapa, música, trabajo, logros, footer)
├── styles.css       ← clases custom (glass-border, transition-bounce, marquee, etc.)
└── images/
    ├── cover.jpg              ← foto principal "vista desde mi casa"
    ├── qro.jpg                ← imagen del footer (Querétaro)
    ├── homepage/
    │   ├── v60.png            ← taza de café del párrafo de intro
    │   └── libro.jpg          ← libro del párrafo de intro
    ├── captures/
    │   ├── 1.jpg, 2.jpg, 3.jpg ← 3 fotos del "abanico" hover
    └── work/
        ├── preprensa.jpg      ← thumb del trabajo actual
        └── cofinance.jpg      ← thumb del logro
```

Todas las imágenes son **placeholders SVG** — reemplazá los archivos manteniendo el nombre y todo se actualiza solo.

## Personalización rápida

| Qué cambiar              | Dónde                                                          |
| ------------------------ | -------------------------------------------------------------- |
| Nombre / intro           | `index.html` → primer `<p>` dentro de `.max-w-2xl`             |
| Ítems del nav            | `index.html` → `<nav>` arriba                                  |
| Coordenadas del mapa     | `index.html` → `<iframe src="...maps?ll=20.5888,-100.3899...">` |
| Tag de ubicación         | `index.html` → "🗺️ Querétaro"                                   |
| Trabajos                 | Sección "Trabajo" — duplicá el `<a>` para más entradas         |
| Logros                   | Sección "Logros" — mismo patrón                                |
| Color de fondo           | `styles.css` → `--bg`                                          |
| Texto del footer         | `index.html` → `hecho con 🫶🏽 en querétaro`                     |

## Cómo subirlo a WordPress

Hay 3 caminos según cuánto control quieras:

### Opción A — Página HTML completa (más simple)
1. En el admin de WP, instalá el plugin **"Insert Headers and Footers"** o usá un theme que permita HTML crudo.
2. Creá una página nueva, modo "HTML/Code".
3. Copiá el `<body>` de `index.html` y pegalo.
4. En el `<head>` del theme (o vía plugin), agregá los `<link>` de fuentes y el `<script src="cdn.tailwindcss.com">`.
5. Subí los archivos de `images/` y `styles.css` a `/wp-content/uploads/sitio-diego/` y ajustá las rutas.

### Opción B — Page Template custom (más limpio)
1. En tu tema, creá `page-yo.php`:
   ```php
   <?php /* Template Name: Yo */ ?>
   <!-- pegá acá el contenido de index.html -->
   ```
2. Ponelo en `/wp-content/themes/<tu-tema>/`.
3. Creá una página en WP y asignale el template "Yo".

### Opción C — Tema custom (full control)
1. Crear `/wp-content/themes/diego/` con `style.css`, `index.php`, `header.php`, `footer.php`.
2. Mover el HTML repartido entre esos archivos.
3. Encolar Tailwind y fuentes en `functions.php` con `wp_enqueue_style/script`.

> **Tip de producción:** Tailwind CDN funciona, pero para sitios públicos conviene compilar Tailwind a un CSS estático (`npx tailwindcss -i input.css -o build.css --minify`) y servir solo ese archivo. Pesa ~10-20kb gzipped vs ~300kb del CDN.

## Detalles del diseño replicado

- **Layout**: una columna `max-w-2xl` centrada, padding lateral generoso, top padding `20vh`.
- **Tipografía**: Lexend Deca light/medium, line-height grande (3.5–4rem) para que las imágenes inline respiren.
- **Hero**: párrafo con elementos interactivos inline (taza de café, abanico de 3 fotos con rotación hover, libro). Las fotos se separan con `cubic-bezier(0.34, 1.56, 0.64, 1)` (efecto spring).
- **Cover**: imagen + reflejo blurreado abajo (técnica `translate-y + blur + opacity`).
- **Mapa**: iframe de Google Maps sin interacción (`pointer-events-none`), centrado en Querétaro.
- **Music widget**: tornamesa SCSS con disco gradient, aguja rotada 38°, marquee abajo, "NOT PLAYING" en Impact con opacity 7% como watermark.
- **Cards de trabajo**: thumb 48px, dot verde "ahora" con glow, flecha ↗ al final, hover background `rgba(0,0,0,0.03)`.
- **Separador**: SVG ondulado entre secciones.
- **Footer**: tipografía pixel Silkscreen + imagen de la ciudad con reflejo blurreado.
