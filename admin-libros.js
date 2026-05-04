/* ============================================================
   admin-libros.js — Uploader local con Google Books API
   ============================================================ */

(function () {
  const searchInput   = document.getElementById('searchInput');
  const searchBtn     = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  const editionsPanel = document.getElementById('editionsPanel');
  const editionsGrid  = document.getElementById('editionsGrid');
  const editionsTitle = document.getElementById('editionsTitle');
  const editionsCount = document.getElementById('editionsCount');
  const editionsBack  = document.getElementById('editionsBack');
  const editionsLangFilter = document.getElementById('editionsLangFilter');
  const useWorkBtn    = document.getElementById('useWork');
  const addManualBtn  = document.getElementById('addManualBtn');
  const list          = document.getElementById('list');
  const output        = document.getElementById('output');
  const codeOut       = document.getElementById('codeOut');
  const copyBtn       = document.getElementById('copyBtn');
  const downloadJsBtn = document.getElementById('downloadJsBtn');

  /* Estado del selector de ediciones */
  let currentWork = null;
  let allEditions = [];

  /* Estado: libros nuevos a agregar */
  const nuevos = [];

  /* ----------- Helpers ----------- */
  function slugify(s) {
    return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function gradientFromTitle(title) {
    /* Hash simple a una pareja de colores agradable */
    let h = 0;
    for (let i = 0; i < (title||'').length; i++) h = (h*31 + title.charCodeAt(i)) & 0xffff;
    const palettes = [
      ['#6b2c3e', '#a34a5e'],
      ['#1a5c4f', '#2d9f8a'],
      ['#8a6d2f', '#c4a44a'],
      ['#3d2b5a', '#6b4d8a'],
      ['#c0392b', '#e74c3c'],
      ['#1a3a5c', '#2d6a9f'],
      ['#2e2e2e', '#555555'],
      ['#4a3a6a', '#7a5aaa'],
      ['#3a5a3a', '#5a8a5a'],
    ];
    const [c1, c2] = palettes[h % palettes.length];
    return `linear-gradient(135deg, ${c1}, ${c2})`;
  }

  /* ----------- Búsqueda en Open Library ----------- */
  function coverUrl(doc, size = 'M') {
    /* size: S, M, L */
    if (doc.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`;
    if (doc.isbn?.length) return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-${size}.jpg`;
    return '';
  }

  async function search(q) {
    if (!q.trim()) return;
    searchResults.innerHTML = '<p class="text-xs text-white/40 col-span-2">buscando…</p>';
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,isbn,subject`;
      const res = await fetch(url);
      const json = await res.json();
      renderResults(json.docs || []);
    } catch (e) {
      searchResults.innerHTML = `<p class="text-xs text-red-400 col-span-2">error: ${e.message}</p>`;
    }
  }

  function renderResults(items) {
    if (!items.length) {
      searchResults.innerHTML = '<p class="text-xs text-white/40 col-span-2">sin resultados.</p>';
      return;
    }
    searchResults.innerHTML = items.map((it, idx) => {
      const cover = coverUrl(it, 'S');
      const author = (it.author_name || []).join(', ');
      return `
        <button class="search-result p-3 flex gap-3 text-left" data-idx="${idx}">
          <div class="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-white/5">
            ${cover ? `<img src="${cover}" class="w-full h-full object-cover" loading="lazy" />` : ''}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-white/85 leading-snug line-clamp-2">${it.title || ''}</p>
            <p class="text-[11px] text-white/45 mt-0.5">${author}</p>
            ${it.first_publish_year ? `<p class="text-[10px] text-white/30 mt-0.5">${it.first_publish_year}</p>` : ''}
          </div>
        </button>
      `;
    }).join('');

    searchResults.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => loadEditions(items[parseInt(btn.dataset.idx, 10)]));
    });
  }

  /* ----------- Selector de ediciones ----------- */
  async function loadEditions(work) {
    currentWork = work;
    editionsTitle.textContent = work.title || '';
    editionsCount.textContent = 'cargando…';
    editionsGrid.innerHTML = '';
    editionsPanel.classList.remove('hidden');
    searchResults.classList.add('hidden');

    /* work.key es "/works/OL...W" */
    if (!work.key) {
      console.warn('[admin-libros] el resultado no trae work.key', work);
      renderEditionsEmpty();
      return;
    }

    try {
      const url = `https://openlibrary.org${work.key}/editions.json?limit=200`;
      const res = await fetch(url);
      const json = await res.json();
      allEditions = (json.entries || []);
      console.log(`[admin-libros] ${allEditions.length} ediciones encontradas para "${work.title}"`);
      renderEditions();
    } catch (e) {
      editionsGrid.innerHTML = `<p class="text-xs text-red-400 col-span-full">error: ${e.message}</p>`;
    }
  }

  function editionCoverUrl(ed, size = 'M') {
    if (ed.covers?.length) return `https://covers.openlibrary.org/b/id/${ed.covers[0]}-${size}.jpg`;
    if (ed.isbn_13?.length) return `https://covers.openlibrary.org/b/isbn/${ed.isbn_13[0]}-${size}.jpg`;
    if (ed.isbn_10?.length) return `https://covers.openlibrary.org/b/isbn/${ed.isbn_10[0]}-${size}.jpg`;
    if (ed.olid)            return `https://covers.openlibrary.org/b/olid/${ed.olid}-${size}.jpg`;
    return '';
  }

  function renderEditionsEmpty() {
    editionsCount.textContent = '';
    editionsGrid.innerHTML = '<p class="text-xs text-white/40 col-span-full">no hay ediciones con portada para este libro.</p>';
  }

  function renderEditions() {
    let editions = allEditions.slice();
    let langNote = '';

    /* Filtro: solo español si está chequeado */
    if (editionsLangFilter.checked) {
      const isSpanish = e => (e.languages || []).some(l => /\/spa$/.test(l.key || ''));
      const spanishOnes = editions.filter(isSpanish);
      if (spanishOnes.length) {
        editions = spanishOnes;
      } else {
        langNote = `<p class="text-[11px] text-white/40 col-span-full mb-1">no hay ediciones en español — mostrando todas (${editions.length})</p>`;
      }
    }

    /* Ordenar: con portada primero, luego por año descendente */
    editions.sort((a, b) => {
      const hasA = (a.covers?.length || a.isbn_13?.length || a.isbn_10?.length) ? 1 : 0;
      const hasB = (b.covers?.length || b.isbn_13?.length || b.isbn_10?.length) ? 1 : 0;
      if (hasA !== hasB) return hasB - hasA;
      const ya = parseInt((a.publish_date || '').match(/\d{4}/)?.[0] || '0', 10);
      const yb = parseInt((b.publish_date || '').match(/\d{4}/)?.[0] || '0', 10);
      return yb - ya;
    });

    editionsCount.textContent = `${editions.length}`;

    if (!editions.length) { renderEditionsEmpty(); return; }

    editionsGrid.innerHTML = langNote + editions.map((ed, idx) => {
      const cov = editionCoverUrl(ed, 'M');
      const lang = (ed.languages || []).map(l => (l.key||'').split('/').pop()).join(', ').toUpperCase();
      const pub = ed.publishers?.[0] || (ed.publish_places?.[0] || '');
      const year = (ed.publish_date || '').match(/\d{4}/)?.[0] || '';
      const grad = gradientFromTitle((ed.title || currentWork.title) + idx);

      /* Si la imagen falla (Open Library devuelve un PNG 1x1 cuando no hay), aplicar fallback */
      return `
        <button class="search-result p-2 flex flex-col text-left" data-idx="${idx}">
          <div class="w-full aspect-[2/3] rounded overflow-hidden flex items-center justify-center text-center text-[10px] text-white/70 px-2 leading-snug" style="background:${grad}">
            ${cov
              ? `<img src="${cov}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'" />`
              : `<span>${ed.title || currentWork.title || ''}</span>`}
          </div>
          <div class="mt-2">
            <p class="text-[11px] text-white/70 line-clamp-1">${pub || '<span class="text-white/30">sin editorial</span>'}</p>
            <p class="text-[10px] text-white/40 mt-0.5">${year || '—'}${lang ? ` · ${lang}` : ''}</p>
          </div>
        </button>
      `;
    }).join('');

    editionsGrid.querySelectorAll('[data-idx]').forEach(btn => {
      btn.addEventListener('click', () => addFromEdition(currentWork, editions[parseInt(btn.dataset.idx, 10)]));
    });
  }

  function backToResults() {
    editionsPanel.classList.add('hidden');
    searchResults.classList.remove('hidden');
    currentWork = null;
    allEditions = [];
  }

  function addFromEdition(work, ed) {
    const title = ed.title || work.title || '';
    const filename = `${slugify(title)}.jpg`;
    const cover = editionCoverUrl(ed, 'L') || coverUrl(work, 'L');

    /* Autor: la edición a veces no lo trae, fallback al work */
    const authors = ed.by_statement || (work.author_name || []).join(', ');

    const tags = (work.subject || [])
      .filter(s => s && !s.includes('--') && s.length < 20)
      .map(s => s.toLowerCase())
      .slice(0, 3)
      .join(', ');

    const data = {
      _coverRemote: cover,
      filename: filename,
      categoria: 'leyendo',
      titulo: title,
      autor:  authors,
      tags:   tags,
      gradient: gradientFromTitle(title),
      cover:  `images/libros/${filename}`
    };
    nuevos.push(data);
    renderCard(data);
    renderOutput();
    backToResults();
  }

  function addFromResult(doc) {
    const title = doc.title || '';
    const filename = `${slugify(title)}.jpg`;
    const cover = coverUrl(doc, 'L');

    /* Tags: tomar los subjects más simples (1 palabra, sin "--") */
    const tags = (doc.subject || [])
      .filter(s => s && !s.includes('--') && s.length < 20)
      .map(s => s.toLowerCase())
      .slice(0, 3)
      .join(', ');

    const data = {
      _coverRemote: cover,
      filename: filename,
      categoria: 'leyendo',
      titulo: title,
      autor:  (doc.author_name || []).join(', '),
      tags:   tags,
      gradient: gradientFromTitle(title),
      cover:  `images/libros/${filename}`
    };
    nuevos.push(data);
    renderCard(data);
    renderOutput();
  }

  function addManual() {
    const data = {
      _coverRemote: '',
      filename: '',
      categoria: 'leyendo',
      titulo: '',
      autor:  '',
      tags:   '',
      gradient: gradientFromTitle(''),
      cover:  ''
    };
    nuevos.push(data);
    renderCard(data);
    renderOutput();
  }

  /* ----------- Render de cada card ----------- */
  function renderCard(data) {
    const card = document.createElement('div');
    card.className = 'card p-4 grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4';

    const previewCover = data._coverRemote
      ? `<img src="${data._coverRemote}" class="w-full h-full object-cover" />`
      : '';

    card.innerHTML = `
      <div class="rounded-md overflow-hidden aspect-[2/3] flex items-center justify-center" style="background:${data.gradient}">
        ${previewCover}
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <label>
          <span class="text-white/50 mono">categoría</span>
          <select class="field mt-1" data-key="categoria">
            <option value="leyendo">leyendo ahora</option>
            <option value="terminados">terminados</option>
          </select>
        </label>
        <label>
          <span class="text-white/50 mono">archivo de portada</span>
          <input class="field mt-1" data-key="filename" value="${data.filename}" />
        </label>
        <label class="col-span-2">
          <span class="text-white/50 mono">título</span>
          <input class="field mt-1" data-key="titulo" value="${data.titulo}" />
        </label>
        <label class="col-span-2">
          <span class="text-white/50 mono">autor</span>
          <input class="field mt-1" data-key="autor" value="${data.autor}" />
        </label>
        <label class="col-span-2">
          <span class="text-white/50 mono">tags <span class="text-white/30">(separados por coma, máx 3)</span></span>
          <input class="field mt-1" data-key="tags" value="${data.tags}" />
        </label>
        <div class="col-span-2 flex flex-wrap items-center gap-2 mt-2">
          ${data._coverRemote ? `<button class="btn" data-action="downloadCover">descargar portada</button>` : ''}
          <button class="btn" data-action="remove">quitar</button>
          <span class="text-[10px] mono text-white/40 ml-auto">→ <span data-bind="cover">${data.cover}</span></span>
        </div>
      </div>
    `;

    /* Ajustar select inicial */
    card.querySelector('[data-key="categoria"]').value = data.categoria;

    /* Bind inputs */
    card.querySelectorAll('[data-key]').forEach(input => {
      const key = input.dataset.key;
      input.addEventListener('input', () => {
        data[key] = input.value;
        if (key === 'titulo') {
          data.gradient = gradientFromTitle(input.value);
          if (!data.filename || data.filename === slugify(data.titulo) + '.jpg') {
            data.filename = `${slugify(input.value)}.jpg`;
            const fnInput = card.querySelector('[data-key="filename"]');
            if (fnInput) fnInput.value = data.filename;
          }
        }
        if (key === 'filename') {
          data.cover = input.value ? `images/libros/${input.value}` : '';
          card.querySelector('[data-bind="cover"]').textContent = data.cover;
        }
        renderOutput();
      });
      input.addEventListener('change', () => renderOutput());
    });

    /* Botón descargar portada (la baja del CDN de Google) */
    card.querySelector('[data-action="downloadCover"]')?.addEventListener('click', async () => {
      try {
        const res = await fetch(data._coverRemote);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename || 'cover.jpg';
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('No pude descargar la imagen automáticamente. Click derecho en la portada → guardar imagen como… y nombrala como ' + data.filename);
      }
    });

    /* Quitar */
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      const i = nuevos.indexOf(data);
      if (i >= 0) nuevos.splice(i, 1);
      card.remove();
      renderOutput();
    });

    list.appendChild(card);
  }

  /* ----------- Generar libros-data.js ----------- */
  function renderOutput() {
    if (!nuevos.length) { output.classList.add('hidden'); return; }
    output.classList.remove('hidden');

    const base = window.LIBROS || { leyendo: [], terminados: [] };

    const leyendoNew = nuevos.filter(n => n.categoria === 'leyendo').map(toEntry);
    const termNew    = nuevos.filter(n => n.categoria === 'terminados').map(toEntry);

    const leyendo    = [...leyendoNew, ...(base.leyendo||[])];
    const terminados = [...termNew,    ...(base.terminados||[])];

    const j = (s) => JSON.stringify(s);
    const fmt = b =>
`    {
      titulo:   ${j(b.titulo||'')},
      autor:    ${j(b.autor||'')},
      cover:    ${j(b.cover||'')},
      gradient: ${j(b.gradient||'')},
      tags:     ${JSON.stringify(b.tags||[])}
    }`;

    const code = `/* ============================================================
   libros-data.js — Libros leyendo y terminados
   ============================================================
   Generado por admin-libros.html el ${new Date().toLocaleString('es-MX')}.
   ============================================================ */

window.LIBROS = {

  leyendo: [
${leyendo.map(fmt).join(',\n')}
  ],

  terminados: [
${terminados.map(fmt).join(',\n')}
  ]
};
`;
    codeOut.value = code;
  }

  function toEntry(n) {
    return {
      titulo: n.titulo || '',
      autor:  n.autor || '',
      cover:  n.cover || '',
      gradient: n.gradient || gradientFromTitle(n.titulo),
      tags:   (n.tags || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    };
  }

  /* ----------- Wire UI ----------- */
  searchBtn.addEventListener('click', () => search(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') search(searchInput.value);
  });
  addManualBtn.addEventListener('click', addManual);
  editionsBack.addEventListener('click', backToResults);
  useWorkBtn.addEventListener('click', () => {
    if (currentWork) { addFromResult(currentWork); backToResults(); }
  });
  editionsLangFilter.addEventListener('change', renderEditions);

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeOut.value);
      copyBtn.textContent = '¡copiado!';
      setTimeout(() => copyBtn.textContent = 'copiar', 1500);
    } catch (_) {
      codeOut.select();
      document.execCommand('copy');
    }
  });

  downloadJsBtn.addEventListener('click', () => {
    const blob = new Blob([codeOut.value], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libros-data.js';
    a.click();
    URL.revokeObjectURL(url);
  });
})();
