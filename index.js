/* ============================================================
   index.js — Llena el "abanico" del párrafo con las últimas 3
   fotos definidas en fotos-data.js (orden = más reciente primero)
   ============================================================ */

(function () {
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
