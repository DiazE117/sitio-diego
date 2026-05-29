/* ============================================================
   admin-trabajo.js — Editor de trabajos/proyectos → trabajo-data.js
   ============================================================ */

(function () {
  const F = {
    tipo:      document.getElementById('f-tipo'),
    periodo:   document.getElementById('f-periodo'),
    titulo:    document.getElementById('f-titulo'),
    slug:      document.getElementById('f-slug'),
    rol:       document.getElementById('f-rol'),
    activo:    document.getElementById('f-activo'),
    web:       document.getElementById('f-web'),
    tags:      document.getElementById('f-tags'),
    img:       document.getElementById('f-img'),
    contenido: document.getElementById('f-contenido')
  };
  const P = {
    img:     document.getElementById('p-img'),
    tipo:    document.getElementById('p-tipo'),
    titulo:  document.getElementById('p-titulo'),
    dot:     document.getElementById('p-dot'),
    rol:     document.getElementById('p-rol'),
    periodo: document.getElementById('p-periodo'),
    tags:    document.getElementById('p-tags'),
    content: document.getElementById('p-content')
  };
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const imgName = document.getElementById('f-img-name');
  const dlImgBtn = document.getElementById('dlImgBtn');
  const addBtn = document.getElementById('addBtn');
  const resetBtn = document.getElementById('resetBtn');
  const status = document.getElementById('status');
  const queue = document.getElementById('queue');
  const output = document.getElementById('output');
  const codeOut = document.getElementById('codeOut');
  const copyBtn = document.getElementById('copyBtn');
  const downloadJsBtn = document.getElementById('downloadJsBtn');

  const nuevos = [];
  let slugEdited = false;
  let imgFile = null, imgURL = null;

  function slugify(s) {
    return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /* ----------- Preview ----------- */
  function updatePreview() {
    P.tipo.textContent = F.tipo.value;
    P.titulo.textContent = F.titulo.value || 'título';
    P.rol.textContent = F.rol.value;
    P.periodo.textContent = F.periodo.value;
    P.dot.classList.toggle('hidden', !F.activo.checked);
    P.tags.innerHTML = F.tags.value.split(',').map(t => t.trim()).filter(Boolean)
      .map(t => `<span class="text-xs px-2.5 py-1 rounded-full bg-white/[0.06] text-white/55">${t}</span>`).join('');
    if (window.marked) {
      marked.setOptions({ breaks: false, gfm: true });
      P.content.innerHTML = marked.parse((F.contenido.value || '').trim());
    }
    const src = imgURL || F.img.value;
    if (src) { P.img.src = src; P.img.style.display = ''; } else { P.img.style.display = 'none'; }
  }
  Object.values(F).forEach(el => {
    el.addEventListener('input', updatePreview);
    el.addEventListener('change', updatePreview);
  });

  F.titulo.addEventListener('input', () => {
    if (!slugEdited) F.slug.value = slugify(F.titulo.value);
    /* sugerir filename del logo si vino de archivo */
    if (imgFile) {
      const ext = (imgFile.name.split('.').pop() || 'jpg').toLowerCase();
      const fn = `${slugify(F.titulo.value) || 'logo'}.${ext}`;
      F.img.value = `images/work/${fn}`;
      imgName.textContent = fn;
      updatePreview();
    }
  });
  F.slug.addEventListener('input', () => { slugEdited = true; });

  /* ----------- Logo dropzone ----------- */
  function handleImg(file) {
    if (!file || !file.type.startsWith('image/')) return;
    imgFile = file;
    if (imgURL) URL.revokeObjectURL(imgURL);
    imgURL = URL.createObjectURL(file);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fn = `${slugify(F.titulo.value) || 'logo'}.${ext}`;
    F.img.value = `images/work/${fn}`;
    imgName.textContent = fn;
    dlImgBtn.classList.remove('hidden');
    updatePreview();
  }
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => handleImg(e.target.files[0]));
  ['dragenter', 'dragover'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', e => handleImg(e.dataTransfer.files[0]));
  dlImgBtn.addEventListener('click', () => {
    if (!imgURL) return;
    const a = document.createElement('a');
    a.href = imgURL;
    a.download = (F.img.value.split('/').pop()) || 'logo.jpg';
    a.click();
  });

  /* ----------- Acciones ----------- */
  function gather() {
    return {
      slug:      F.slug.value || slugify(F.titulo.value),
      tipo:      F.tipo.value,
      titulo:    F.titulo.value,
      rol:       F.rol.value,
      periodo:   F.periodo.value,
      activo:    F.activo.checked,
      img:       F.img.value || null,
      web:       F.web.value || null,
      tags:      F.tags.value.split(',').map(t => t.trim()).filter(Boolean),
      contenido: F.contenido.value
    };
  }
  function reset() {
    F.titulo.value = ''; F.slug.value = ''; F.rol.value = '';
    F.web.value = ''; F.tags.value = ''; F.img.value = ''; F.contenido.value = '';
    F.activo.checked = false; F.periodo.value = 'ahora'; F.tipo.value = 'trabajo';
    slugEdited = false; imgFile = null;
    if (imgURL) { URL.revokeObjectURL(imgURL); imgURL = null; }
    imgName.textContent = '(sin imagen)';
    dlImgBtn.classList.add('hidden');
    updatePreview();
    F.titulo.focus();
  }
  function add() {
    const t = gather();
    if (!t.titulo) { F.titulo.focus(); return; }
    if (!t.slug) { F.slug.focus(); return; }
    nuevos.push(t);
    renderQueue();
    renderOutput();
    reset();
  }
  function renderQueue() {
    status.textContent = `${nuevos.length} en cola`;
    queue.innerHTML = !nuevos.length ? '' : `
      <p class="text-sm text-white/55">en cola:</p>
      <div class="flex flex-wrap gap-2">
        ${nuevos.map((t, i) => `
          <span class="card px-3 py-1.5 text-xs flex items-center gap-2">
            <span class="text-white/45 mono">[${t.tipo}]</span>
            <span class="text-white/80">${t.titulo}</span>
            <button class="text-white/35 hover:text-red-400" data-i="${i}">×</button>
          </span>`).join('')}
      </div>`;
    queue.querySelectorAll('[data-i]').forEach(b =>
      b.addEventListener('click', () => { nuevos.splice(+b.dataset.i, 1); renderQueue(); renderOutput(); }));
  }

  /* ----------- Output ----------- */
  function renderOutput() {
    if (!nuevos.length) { output.classList.add('hidden'); return; }
    output.classList.remove('hidden');

    const base = window.TRABAJOS || [];
    const todos = [...nuevos.slice().reverse(), ...base];
    const j = s => JSON.stringify(s);
    const fmt = t => `  {
    slug:      ${j(t.slug)},
    tipo:      ${j(t.tipo)},
    titulo:    ${j(t.titulo)},
    rol:       ${j(t.rol || '')},
    periodo:   ${j(t.periodo || '')},
    activo:    ${!!t.activo},
    img:       ${t.img ? j(t.img) : 'null'},
    web:       ${t.web ? j(t.web) : 'null'},
    tags:      ${JSON.stringify(t.tags || [])},
    contenido: ${j('\n' + (t.contenido || '').trim() + '\n')}
  }`;

    codeOut.value = `/* ============================================================
   trabajo-data.js — Trabajos y proyectos (páginas de detalle)
   ============================================================
   Generado por admin-trabajo.html el ${new Date().toLocaleString('es-MX')}.
   ============================================================ */

window.TRABAJOS = [
${todos.map(fmt).join(',\n')}
];
`;
  }

  /* ----------- Wire ----------- */
  addBtn.addEventListener('click', add);
  resetBtn.addEventListener('click', reset);
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(codeOut.value); copyBtn.textContent = '¡copiado!'; setTimeout(() => copyBtn.textContent = 'copiar', 1500); }
    catch (_) { codeOut.select(); document.execCommand('copy'); }
  });
  downloadJsBtn.addEventListener('click', () => {
    const blob = new Blob([codeOut.value], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'trabajo-data.js'; a.click();
    URL.revokeObjectURL(url);
  });

  updatePreview();
})();
