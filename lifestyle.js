/* ============================================================
   lifestyle.js — Renderiza el index del blog agrupado por categoría
   ============================================================ */

(function () {
  const root  = document.getElementById('categories');
  const empty = document.getElementById('empty');
  const posts = (window.POSTS || []).slice();

  if (!posts.length) {
    empty.classList.remove('hidden');
    return;
  }

  /* Agrupar por categoría manteniendo orden de aparición */
  const orden = [];
  const grupos = {};
  posts.forEach(p => {
    const cat = p.categoria || 'general';
    if (!grupos[cat]) { grupos[cat] = []; orden.push(cat); }
    grupos[cat].push(p);
  });

  /* Ordenar por fecha desc dentro de cada categoría */
  Object.keys(grupos).forEach(k => {
    grupos[k].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  });

  function fmtDate(d) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${y}-${m}-${day}`;
  }

  function postCard(p) {
    const banner = p.banner
      ? `<div class="w-full h-24 shrink-0 overflow-hidden">
           <img src="${p.banner}" alt="" class="w-full h-full object-cover" loading="lazy" />
         </div>`
      : '';
    const excerpt = (p.excerpt || '').slice(0, 280);
    /* p.url tiene prioridad si está seteado (página standalone tipo rutina-lumbar.html) */
    const href = p.url || `post.html?slug=${encodeURIComponent(p.slug)}`;
    return `
      <a class="group block" href="${href}">
        <article class="h-full bg-[#1a1a1a] rounded-3xl border border-white/5 shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 ease-out flex flex-col relative overflow-hidden">
          ${banner}
          <div class="flex flex-col flex-grow p-5">
            <h3 class="text-sm font-semibold text-white/90 mb-3 line-clamp-2 group-hover:opacity-75 transition-opacity leading-snug">${p.titulo || ''}</h3>
            <p class="text-[11px] text-white/55 leading-relaxed flex-grow mb-3 ${p.banner ? 'line-clamp-4' : 'line-clamp-8'}">${excerpt}</p>
            ${p.fecha ? `<p class="text-[10px] text-white/35 mt-auto pt-3 border-t border-white/10">${fmtDate(p.fecha)}</p>` : ''}
            ${p.subtitle ? `<p class="text-[10px] text-white/40 mt-1 italic">${p.subtitle}</p>` : ''}
          </div>
        </article>
      </a>
    `;
  }

  root.innerHTML = orden.map(cat => `
    <section class="space-y-6">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-semibold text-white/95">${cat}</h2>
        <span class="text-sm text-white/40">(${grupos[cat].length})</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
        ${grupos[cat].map(postCard).join('')}
      </div>
    </section>
  `).join('');
})();
