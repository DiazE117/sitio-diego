/* ============================================================
   trabajo.js — Lee ?slug=... y renderiza el detalle del trabajo
   ============================================================ */

(function () {
  const slug = new URLSearchParams(location.search).get('slug');
  const item = (window.TRABAJOS || []).find(t => t.slug === slug);

  if (!item) {
    document.getElementById('t-404').classList.remove('hidden');
    return;
  }

  const header = document.getElementById('t-header');
  header.classList.remove('hidden');

  document.getElementById('t-img').src = item.img || '';
  document.getElementById('t-img').alt = item.titulo || '';
  document.getElementById('t-tipo').textContent = item.tipo || '';
  document.getElementById('t-title').textContent = item.titulo || '';
  document.getElementById('t-rol').textContent = item.rol || '';
  document.getElementById('t-periodo').textContent = item.periodo || '';
  document.title = `${item.titulo || 'trabajo'} · diego díaz`;

  if (item.activo) document.getElementById('t-dot').classList.remove('hidden');

  /* Tags */
  const tagsEl = document.getElementById('t-tags');
  tagsEl.innerHTML = (item.tags || []).map(t =>
    `<span class="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/55">${t}</span>`
  ).join('');

  /* Link web opcional */
  if (item.web) {
    const web = document.getElementById('t-web');
    web.href = item.web;
    web.classList.remove('hidden');
  }

  /* Contenido markdown */
  const content = document.getElementById('t-content');
  if (window.marked) {
    marked.setOptions({ breaks: false, gfm: true });
    content.innerHTML = marked.parse((item.contenido || '').trim());
  } else {
    content.textContent = item.contenido || '';
  }
})();
