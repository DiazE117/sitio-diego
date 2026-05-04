/* ============================================================
   libros.js — Renderiza los libros desde window.LIBROS
   ============================================================ */

(function () {
  if (!window.LIBROS) return;

  const { leyendo = [], terminados = [] } = window.LIBROS;

  function bookCard(b, isCurrent = false) {
    const gradient = b.gradient || 'linear-gradient(135deg, #3a3a3a, #1a1a1a)';
    const tags = (b.tags || []).map(t =>
      `<span class="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40">${t}</span>`
    ).join('');
    const dot = isCurrent
      ? `<div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"></div>`
      : '';
    const cover = b.cover
      ? `<img src="${b.cover}" alt="${b.titulo}" class="w-full h-full object-cover" loading="lazy" />`
      : '';

    return `
      <div class="group w-[8.5rem] flex-shrink-0">
        <div class="relative w-full aspect-[2/3] rounded-md overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-2 group-hover:rotate-[-1deg] transition-all duration-300 cursor-default"
             style="background:${gradient}">
          ${cover}
          ${dot}
        </div>
        <div class="mt-2.5 px-0.5">
          <p class="text-xs font-medium text-white/85 leading-snug line-clamp-2">${b.titulo || ''}</p>
          ${b.autor ? `<p class="text-[10px] text-white/40 mt-0.5">${b.autor}</p>` : ''}
          ${tags ? `<div class="flex flex-wrap gap-1 mt-1.5">${tags}</div>` : ''}
        </div>
      </div>
    `;
  }

  /* Render leyendo */
  const leyendoEl = document.getElementById('leyendo');
  const leyendoVacio = document.getElementById('leyendo-vacio');
  if (leyendo.length) {
    leyendoEl.innerHTML = leyendo.map(b => bookCard(b, true)).join('');
  } else {
    leyendoVacio.classList.remove('hidden');
  }
  document.getElementById('leyendo-count').textContent = leyendo.length;

  /* Render terminados */
  const termEl = document.getElementById('terminados');
  const termVacio = document.getElementById('terminados-vacio');
  if (terminados.length) {
    termEl.innerHTML = terminados.map(b => bookCard(b, false)).join('');
  } else {
    termVacio.classList.remove('hidden');
  }
  document.getElementById('terminados-count').textContent = terminados.length;
})();
