/* ============================================================
   admin-lifestyle.js — Editor de posts del blog
   ============================================================ */

(function () {
  const F = {
    categoria: document.getElementById('f-categoria'),
    fecha:     document.getElementById('f-fecha'),
    titulo:    document.getElementById('f-titulo'),
    slug:      document.getElementById('f-slug'),
    subtitle:  document.getElementById('f-subtitle'),
    excerpt:   document.getElementById('f-excerpt'),
    banner:    document.getElementById('f-banner'),
    contenido: document.getElementById('f-contenido')
  };
  const P = {
    cat:      document.getElementById('p-cat'),
    titulo:   document.getElementById('p-titulo'),
    subtitle: document.getElementById('p-subtitle'),
    fecha:    document.getElementById('p-fecha'),
    content:  document.getElementById('p-content')
  };
  const addBtn       = document.getElementById('addBtn');
  const resetBtn     = document.getElementById('resetBtn');
  const status       = document.getElementById('status');
  const queue        = document.getElementById('queue');
  const output       = document.getElementById('output');
  const codeOut      = document.getElementById('codeOut');
  const copyBtn      = document.getElementById('copyBtn');
  const downloadJsBtn = document.getElementById('downloadJsBtn');

  /* Estado: posts nuevos en cola para sumar */
  const nuevos = [];
  let slugManuallyEdited = false;

  /* ----------- Helpers ----------- */
  function slugify(s) {
    return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }
  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  /* Set fecha de hoy por default */
  F.fecha.value = todayISO();

  /* ----------- Preview en vivo ----------- */
  function updatePreview() {
    P.cat.textContent      = F.categoria.value;
    P.titulo.textContent   = F.titulo.value || 'título del post';
    P.subtitle.textContent = F.subtitle.value;
    P.fecha.textContent    = F.fecha.value;
    if (window.marked) {
      marked.setOptions({ breaks: true, gfm: true });
      P.content.innerHTML = marked.parse(F.contenido.value || '');
    } else {
      P.content.textContent = F.contenido.value;
    }
  }
  Object.values(F).forEach(el => el.addEventListener('input', updatePreview));

  /* Auto-slug desde el título mientras no se haya editado a mano */
  F.titulo.addEventListener('input', () => {
    if (!slugManuallyEdited) F.slug.value = slugify(F.titulo.value);
  });
  F.slug.addEventListener('input', () => { slugManuallyEdited = true; });

  /* ----------- Acciones ----------- */
  function gather() {
    return {
      slug:      F.slug.value || slugify(F.titulo.value),
      categoria: F.categoria.value || 'general',
      titulo:    F.titulo.value,
      fecha:     F.fecha.value,
      subtitle:  F.subtitle.value,
      excerpt:   F.excerpt.value,
      banner:    F.banner.value || null,
      contenido: F.contenido.value
    };
  }

  function reset() {
    F.titulo.value = '';
    F.slug.value = '';
    F.subtitle.value = '';
    F.excerpt.value = '';
    F.banner.value = '';
    F.contenido.value = '';
    slugManuallyEdited = false;
    F.fecha.value = todayISO();
    updatePreview();
    F.titulo.focus();
  }

  function addToQueue() {
    const post = gather();
    if (!post.titulo) { F.titulo.focus(); return; }
    if (!post.slug)   { F.slug.focus(); return; }
    nuevos.push(post);
    renderQueue();
    renderOutput();
    reset();
  }

  function renderQueue() {
    status.textContent = `${nuevos.length} post${nuevos.length === 1 ? '' : 's'} en cola`;
    if (!nuevos.length) { queue.innerHTML = ''; return; }

    queue.innerHTML = `
      <p class="text-sm text-white/55">posts agregados:</p>
      <div class="flex flex-wrap gap-2">
        ${nuevos.map((p, i) => `
          <span class="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="text-white/45 mono">[${p.categoria}]</span>
            <span class="text-white/80">${p.titulo}</span>
            <button class="text-white/35 hover:text-red-400" data-i="${i}" data-action="remove">×</button>
          </span>
        `).join('')}
      </div>
    `;
    queue.querySelectorAll('[data-action="remove"]').forEach(b => {
      b.addEventListener('click', () => {
        nuevos.splice(parseInt(b.dataset.i, 10), 1);
        renderQueue();
        renderOutput();
      });
    });
  }

  /* ----------- Generar lifestyle-data.js ----------- */
  function renderOutput() {
    if (!nuevos.length) { output.classList.add('hidden'); return; }
    output.classList.remove('hidden');

    const existentes = (window.POSTS || []).slice();
    /* Nuevos primero (más recientes arriba) */
    const todos = [...nuevos.slice().reverse(), ...existentes];

    const j = (s) => JSON.stringify(s);
    const fmt = p => `  {
    slug:      ${j(p.slug)},
    categoria: ${j(p.categoria)},
    titulo:    ${j(p.titulo)},
    fecha:     ${j(p.fecha)},
    subtitle:  ${j(p.subtitle || '')},
    excerpt:   ${j(p.excerpt || '')},
    banner:    ${p.banner ? j(p.banner) : 'null'},
    contenido: ${j(p.contenido || '')}
  }`;

    codeOut.value = `/* ============================================================
   lifestyle-data.js — Posts del blog
   ============================================================
   Generado por admin-lifestyle.html el ${new Date().toLocaleString('es-MX')}.
   ============================================================ */

window.POSTS = [
${todos.map(fmt).join(',\n')}
];
`;
  }

  /* ----------- Wire ----------- */
  addBtn.addEventListener('click', addToQueue);
  resetBtn.addEventListener('click', reset);

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeOut.value);
      copyBtn.textContent = '¡copiado!';
      setTimeout(() => copyBtn.textContent = 'copiar', 1500);
    } catch (_) {
      codeOut.select(); document.execCommand('copy');
    }
  });
  downloadJsBtn.addEventListener('click', () => {
    const blob = new Blob([codeOut.value], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lifestyle-data.js'; a.click();
    URL.revokeObjectURL(url);
  });

  /* Preview inicial */
  updatePreview();
})();
