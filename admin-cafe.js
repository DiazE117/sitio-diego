/* ============================================================
   admin-cafe.js — Uploader local: granos + equipo → cafe-data.js
   ============================================================ */

(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const list = document.getElementById('list');
  const output = document.getElementById('output');
  const codeOut = document.getElementById('codeOut');
  const copyBtn = document.getElementById('copyBtn');
  const downloadJsBtn = document.getElementById('downloadJsBtn');

  /* Estado: items nuevos (separados por categoría al final) */
  const nuevos = [];

  /* ----------- Helpers ----------- */
  function slugify(s) {
    return (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g,'')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function nextNum(prefix, extra = 0) {
    /* Busca el mayor "<prefix>-N" en el data actual + nuevos */
    const all = [
      ...((window.CAFE?.actual)||[]),
      ...((window.CAFE?.anteriores)||[]),
      ...((window.CAFE?.equipo)||[]),
      ...nuevos.map(n => ({ img: `images/cafe/${n.filename}` }))
    ];
    let max = 0;
    all.forEach(g => {
      const m = (g.img || '').match(new RegExp(`${prefix}-(\\d+)\\.[a-z]+$`,'i'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1 + extra;
  }

  function defaultFilename(categoria, nombre) {
    const ext = 'png';
    if (categoria === 'actual')     return `actual-${nextNum('actual')}.${ext}`;
    if (categoria === 'anteriores') return `prev-${nextNum('prev')}.${ext}`;
    if (categoria === 'equipo')     return `${slugify(nombre || 'equipo')}.${ext}`;
    return `cafe-${Date.now()}.${ext}`;
  }

  function randomRotate() {
    const opts = [-6, -5, -4, -3, 3, 4, 5, 6];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  /* ----------- Procesar archivos ----------- */
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      addItem(file);
    });
    renderOutput();
  }

  function addItem(file) {
    const objectURL = URL.createObjectURL(file);
    const data = {
      _file: file,
      _objectURL: objectURL,
      categoria: 'actual',                 // default
      filename:  defaultFilename('actual'),
      nombre:    '',
      tostador:  '',
      notas:     '',
      detalle:   '',
      desc:      '',
      rotate:    randomRotate()
    };
    nuevos.push(data);
    renderCard(data);
  }

  /* ----------- Render de cada card ----------- */
  function renderCard(data) {
    const card = document.createElement('div');
    card.className = 'card p-4 grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-4';

    card.innerHTML = `
      <div class="preview-bag rounded-lg overflow-hidden h-48 flex items-center justify-center">
        <img src="${data._objectURL}" class="max-h-full max-w-full object-contain" />
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <label>
          <span class="text-white/50 mono">categoría</span>
          <select class="field mt-1" data-key="categoria">
            <option value="actual">en taza ahora</option>
            <option value="anteriores">anteriores</option>
            <option value="equipo">equipo</option>
          </select>
        </label>
        <label>
          <span class="text-white/50 mono">archivo destino</span>
          <input class="field mt-1" data-key="filename" value="${data.filename}" />
        </label>

        <label class="col-span-2">
          <span class="text-white/50 mono">nombre</span>
          <input class="field mt-1" data-key="nombre" placeholder="ej. pluma hidalgo" />
        </label>

        <!-- Solo para "actual" -->
        <label data-show="actual">
          <span class="text-white/50 mono">tostador</span>
          <input class="field mt-1" data-key="tostador" placeholder="ej. café cielo" />
        </label>
        <label data-show="actual">
          <span class="text-white/50 mono">rotación (°)</span>
          <input class="field mt-1" data-key="rotate" type="number" value="${data.rotate}" />
        </label>
        <label data-show="actual" class="col-span-2">
          <span class="text-white/50 mono">notas de cata <span class="text-white/30">(separadas por coma)</span></span>
          <input class="field mt-1" data-key="notas" placeholder="chocolate, naranja, almendra" />
        </label>
        <label data-show="actual" class="col-span-2">
          <span class="text-white/50 mono">detalle <span class="text-white/30">(una línea por renglón)</span></span>
          <textarea class="field mt-1" data-key="detalle" placeholder="tueste medio · oaxaca · 1500 MASL&#10;16g → 240g v60"></textarea>
        </label>

        <!-- Solo para "anteriores" -->
        <label data-show="anteriores">
          <span class="text-white/50 mono">rotación (°)</span>
          <input class="field mt-1" data-key="rotate" type="number" value="${data.rotate}" />
        </label>

        <!-- Solo para "equipo" -->
        <label data-show="equipo">
          <span class="text-white/50 mono">rotación (°)</span>
          <input class="field mt-1" data-key="rotate" type="number" value="${data.rotate}" />
        </label>
        <label data-show="equipo" class="col-span-2">
          <span class="text-white/50 mono">descripción</span>
          <textarea class="field mt-1" data-key="desc" placeholder="qué es / cómo lo usás"></textarea>
        </label>

        <div class="col-span-2 flex items-center gap-2 mt-2">
          <button class="btn btn-primary" data-action="download">descargar como <span data-bind="filename">${data.filename}</span></button>
          <button class="btn" data-action="remove">quitar</button>
        </div>
      </div>
    `;

    /* Mostrar/ocultar campos según categoría */
    function applyCategoryVisibility() {
      const cat = data.categoria;
      card.querySelectorAll('[data-show]').forEach(el => {
        el.style.display = el.dataset.show === cat ? '' : 'none';
      });
    }

    /* Bind inputs → estado */
    card.querySelectorAll('[data-key]').forEach(input => {
      const key = input.dataset.key;
      if (input.value !== undefined && data[key] !== undefined && data[key] !== '') {
        input.value = data[key];
      }
      const handler = () => {
        let v = input.value;
        if (key === 'rotate') v = parseFloat(v) || 0;
        data[key] = v;
        if (key === 'categoria') {
          /* Actualizar filename sugerido al cambiar categoría */
          data.filename = defaultFilename(v, data.nombre);
          card.querySelector('[data-key="filename"]').value = data.filename;
          card.querySelector('[data-bind="filename"]').textContent = data.filename;
          applyCategoryVisibility();
        }
        if (key === 'filename') {
          card.querySelector('[data-bind="filename"]').textContent = v;
        }
        if (key === 'nombre' && data.categoria === 'equipo') {
          /* Re-sugerir filename si está en equipo */
          const newFn = defaultFilename('equipo', v);
          /* Solo actualizamos si el user no lo tocó manualmente con algo distinto */
          /* Heurística simple: si el filename actual sigue empezando con un slug de algo, lo cambiamos */
          data.filename = newFn;
          card.querySelector('[data-key="filename"]').value = newFn;
          card.querySelector('[data-bind="filename"]').textContent = newFn;
        }
        renderOutput();
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });

    /* Botón descargar imagen renombrada */
    card.querySelector('[data-action="download"]').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = data._objectURL;
      a.download = data.filename;
      a.click();
    });

    /* Quitar */
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      const i = nuevos.indexOf(data);
      if (i >= 0) nuevos.splice(i, 1);
      card.remove();
      renderOutput();
    });

    list.appendChild(card);
    applyCategoryVisibility();
  }

  /* ----------- Generar el código de cafe-data.js ----------- */
  function renderOutput() {
    if (!nuevos.length) { output.classList.add('hidden'); return; }
    output.classList.remove('hidden');

    const base = window.CAFE || { actual: [], anteriores: [], equipo: [] };

    /* Nuevos primero, separados por categoría */
    const actualNew = nuevos.filter(n => n.categoria === 'actual').map(toActual);
    const prevNew   = nuevos.filter(n => n.categoria === 'anteriores').map(toPrev);
    const equipoNew = nuevos.filter(n => n.categoria === 'equipo').map(toEquipo);

    const actual     = [...actualNew, ...(base.actual||[])];
    const anteriores = [...prevNew,   ...(base.anteriores||[])];
    const equipo     = [...equipoNew, ...(base.equipo||[])];

    const j = (s) => JSON.stringify(s);
    const formatActual = g =>
`    {
      img:      ${j(g.img)},
      nombre:   ${j(g.nombre)},
      tostador: ${j(g.tostador||'')},
      notas:    ${JSON.stringify(g.notas||[])},
      detalle:  ${JSON.stringify(g.detalle||[])},
      rotate:   ${g.rotate||0}
    }`;
    const formatPrev = g =>
`    { img: ${j(g.img)}, nombre: ${j(g.nombre)}, rotate: ${g.rotate||0} }`;
    const formatEquipo = g =>
`    {
      img:    ${j(g.img)},
      nombre: ${j(g.nombre)},
      desc:   ${j(g.desc||'')},
      rotate: ${g.rotate||0}
    }`;

    const code = `/* ============================================================
   cafe-data.js — Granos de café actuales, anteriores y equipo
   ============================================================
   Generado por admin-cafe.html el ${new Date().toLocaleString('es-MX')}.
   ============================================================ */

window.CAFE = {

  actual: [
${actual.map(formatActual).join(',\n')}
  ],

  anteriores: [
${anteriores.map(formatPrev).join(',\n')}
  ],

  equipo: [
${equipo.map(formatEquipo).join(',\n')}
  ]
};
`;
    codeOut.value = code;
  }

  function toActual(n) {
    return {
      img: `images/cafe/${n.filename}`,
      nombre: n.nombre || '',
      tostador: n.tostador || '',
      notas: (n.notas || '').split(',').map(s => s.trim()).filter(Boolean),
      detalle: (n.detalle || '').split('\n').map(s => s.trim()).filter(Boolean),
      rotate: n.rotate || 0
    };
  }
  function toPrev(n) {
    return { img: `images/cafe/${n.filename}`, nombre: n.nombre || '', rotate: n.rotate || 0 };
  }
  function toEquipo(n) {
    return { img: `images/cafe/${n.filename}`, nombre: n.nombre || '', desc: n.desc || '', rotate: n.rotate || 0 };
  }

  /* ----------- Drop zone ----------- */
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  ['dragenter', 'dragover'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.add('dragging');
    })
  );
  ['dragleave', 'drop'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropzone.classList.remove('dragging');
    })
  );
  dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));

  /* ----------- Botones de output ----------- */
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
    a.download = 'cafe-data.js';
    a.click();
    URL.revokeObjectURL(url);
  });

})();
