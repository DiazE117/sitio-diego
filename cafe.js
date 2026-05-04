/* ============================================================
   cafe.js — Renderiza la sección de café desde window.CAFE
   ============================================================ */

(function () {
  if (!window.CAFE) return;

  const { actual = [], anteriores = [], equipo = [] } = window.CAFE;

  /* ----------- Helpers ----------- */
  function stickerFilter() {
    /* "Recorte de revista": outline blanco + sombra */
    return "drop-shadow(0px 3px 0 white) drop-shadow(3px 0px 0 white) drop-shadow(0px -3px 0 white) drop-shadow(-3px 0px 0 white) drop-shadow(0 8px 16px rgba(0,0,0,0.35))";
  }

  function bouncyImg(src, alt, rotate, size = 'big') {
    const dims = size === 'big'
      ? 'width="180" height="240"'
      : size === 'mid' ? 'width="160" height="210"' : 'width="150" height="200"';

    const hoverRot = rotate >= 0 ? -1 : 2;
    return `
      <div class="bouncy-sticker cursor-pointer transition-bounce" style="transform:rotate(${rotate}deg);filter:${stickerFilter()};will-change:transform" data-rot="${rotate}" data-hover-rot="${hoverRot}">
        <img src="${src}" alt="${alt || ''}" ${dims} loading="lazy" class="object-contain saturate-[1.15] contrast-[1.1]" />
      </div>
    `;
  }

  /* ----------- Sección: en taza ahora ----------- */
  const actualEl = document.getElementById('granos-actual');
  actualEl.innerHTML = actual.map(g => `
    <div class="flex flex-col items-center text-center">
      ${bouncyImg(g.img, g.nombre, g.rotate || 0, 'big')}
      <h3 class="font-display text-2xl tracking-tight mt-5">${g.nombre}</h3>
      ${g.tostador ? `<p class="text-sm text-white/40 mt-0.5">por ${g.tostador}</p>` : ''}
      ${g.notas?.length ? `
        <div class="flex flex-wrap gap-1.5 mt-3 justify-center">
          ${g.notas.map(n => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/55">${n}</span>`).join('')}
        </div>
      ` : ''}
      ${g.detalle?.length ? `
        <div class="mt-2.5 text-xs text-white/35 space-y-0.5">
          ${g.detalle.map(d => `<p>${d}</p>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  /* ----------- Sección: anteriores ----------- */
  const prevEl = document.getElementById('granos-anteriores');
  prevEl.innerHTML = anteriores.map(g => `
    <div class="flex flex-col items-center text-center">
      ${bouncyImg(g.img, g.nombre, g.rotate || 0, 'small')}
      <h3 class="font-display text-base sm:text-lg tracking-tight mt-4">${g.nombre}</h3>
    </div>
  `).join('');

  /* ----------- Sección: equipo ----------- */
  const equipoEl = document.getElementById('equipo');
  equipoEl.innerHTML = equipo.map(e => `
    <div class="flex flex-col items-center text-center">
      ${bouncyImg(e.img, e.nombre, e.rotate || 0, 'mid')}
      <h3 class="font-display text-2xl tracking-tight mt-4">${e.nombre}</h3>
      ${e.desc ? `<p class="text-sm text-white/40 mt-1.5 max-w-[18rem] leading-relaxed">${e.desc}</p>` : ''}
    </div>
  `).join('');

  /* ----------- Contadores ----------- */
  document.getElementById('granos-count').textContent  = actual.length + anteriores.length;
  document.getElementById('equipo-count').textContent  = equipo.length;

  /* ----------- Hover bouncy: rotación opuesta + scale ----------- */
  document.querySelectorAll('.bouncy-sticker').forEach(el => {
    const baseRot  = parseFloat(el.dataset.rot)  || 0;
    const hoverRot = parseFloat(el.dataset.hoverRot) || 0;
    el.addEventListener('mouseenter', () => {
      el.style.transform = `rotate(${hoverRot}deg) scale(1.1)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = `rotate(${baseRot}deg) scale(1)`;
    });
  });

})();
