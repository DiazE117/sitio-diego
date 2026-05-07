/* ============================================================
   lifestyle-data.js — Posts del blog
   ============================================================
   ⚠️  AGREGÁ POSTS NUEVOS ARRIBA. Podés usar admin-lifestyle.html.

   Cada post:
   {
     slug:        "string-en-kebab-case",
     categoria:   "Diseño" | "Tecnología" | "Imprenta" | "IA" | "Gym" | etc,
     titulo:      "...",
     fecha:       "2026-05-04",            // YYYY-MM-DD
     subtitle:    "una línea italica al pie de la card",
     excerpt:     "primer párrafo o resumen — se muestra en la card",
     banner:      "images/lifestyle/<archivo>.jpg" | null,
     contenido:   "texto en markdown (multiline string)",
     url:         "rutina-lumbar.html"      // OPCIONAL: si es página standalone, usa esta URL en vez de post.html
   }
   ============================================================ */

window.POSTS = [
  {
    slug:      "rutina-lumbar-4-dias",
    categoria: "Gym",
    titulo:    "Rutina 4 días — columna lumbar",
    fecha:     "2026-05-04",
    subtitle:  "cuatro días, foco en cadena posterior, lumbar protegida",
    excerpt:   "Una rutina dividida en 4 días (sábado a martes) con énfasis en glúteo, cadena posterior y core, evitando todo lo que comprometa la columna lumbar. Pensada para volumen moderado y técnica primero — todos los movimientos elegidos para no cargar la espalda baja.",
    banner:    null,
    contenido: "",
    url:       "rutina-lumbar.html"
  }
];
