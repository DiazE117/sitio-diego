/* ============================================================
   index.js — Llena el "abanico" del párrafo con las últimas 3
   fotos definidas en fotos-data.js (orden = más reciente primero)
   ============================================================ */

(function () {
  /* ----------- Café actual en el párrafo de intro ----------- */
  const cafeImg = document.getElementById('cafe-img');
  const cafeLink = document.getElementById('cafe-link');
  if (cafeImg && window.CAFE?.actual?.length) {
    const actual = window.CAFE.actual[0]; // El primero = el más reciente
    cafeImg.src = actual.img;
    cafeImg.alt = actual.nombre || 'café';
    if (cafeLink) {
      cafeLink.title = `tomando ${actual.nombre}${actual.tostador ? ' · ' + actual.tostador : ''}`;
    }
  }

  /* ----------- Libro actual en el párrafo de intro ----------- */
  const libroImg = document.getElementById('libro-img');
  const libroLink = document.getElementById('libro-link');
  if (libroImg && window.LIBROS?.leyendo?.length) {
    const actual = window.LIBROS.leyendo[0];
    if (actual.cover) libroImg.src = actual.cover;
    libroImg.alt = actual.titulo || 'libro';
    if (libroLink) libroLink.title = `leyendo ${actual.titulo}${actual.autor ? ' · ' + actual.autor : ''}`;
  }

  /* ----------- Abanico de fotos (últimas 3) ----------- */
  const abanico = document.getElementById('abanico');
  if (!abanico || !window.FOTOS || !window.FOTOS.length) return;

  const ultimas = window.FOTOS.slice(0, 3);

  // Clases de cada slot del abanico (izquierda, centro, derecha)
  const slots = [
    {
      wrapper: 'glass-border absolute rounded-lg z-10 transition-bounce rotate-[-5deg] -translate-x-[8px] group-hover:rotate-[-12deg] group-hover:-translate-x-[28px] group-hover:-translate-y-[2px]',
    },
    {
      wrapper: 'glass-border absolute rounded-lg z-20 transition-bounce translate-y-0 group-hover:-translate-y-[6px]',
    },
    {
      wrapper: 'glass-border absolute rounded-lg z-30 transition-bounce rotate-[5deg] translate-x-[8px] group-hover:rotate-[12deg] group-hover:translate-x-[28px] group-hover:-translate-y-[2px]',
    }
  ];

  abanico.innerHTML = ultimas.map((foto, i) => {
    const slot = slots[i] || slots[2];
    return `
      <span class="${slot.wrapper}">
        <img src="${foto.src}" alt="${foto.alt || ''}"
             class="block w-[2.4rem] sm:w-[3.2rem] h-[3rem] sm:h-[4rem] rounded-[7px] object-cover" />
      </span>
    `;
  }).join('');
})();
