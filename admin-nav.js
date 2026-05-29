/* ============================================================
   admin-nav.js — Barra de pestañas unificada del panel admin
   Inyecta la navegación en <div id="admin-nav"></div>
   y marca la activa según el archivo actual.
   ============================================================ */

(function () {
  const items = [
    { href: 'admin.html',           label: 'inicio' },
    { href: 'admin-fotos.html',     label: 'fotos' },
    { href: 'admin-cafe.html',      label: 'café' },
    { href: 'admin-libros.html',    label: 'libros' },
    { href: 'admin-lifestyle.html', label: 'blog' },
    { href: 'admin-trabajo.html',   label: 'trabajos' }
  ];

  const here = (location.pathname.split('/').pop() || 'admin.html').toLowerCase();
  const mount = document.getElementById('admin-nav');
  if (!mount) return;

  mount.innerHTML = `
    <div class="admin-tabs">
      <a href="index.html" class="admin-tab admin-tab-back">← sitio</a>
      <span class="admin-tab-sep"></span>
      ${items.map(it => {
        const active = it.href === here;
        return `<a href="${it.href}" class="admin-tab${active ? ' admin-tab-active' : ''}">${it.label}</a>`;
      }).join('')}
    </div>`;
})();
