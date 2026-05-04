/* ============================================================
   admin.js — Uploader local: lee EXIF y genera fotos-data.js
   ============================================================ */

(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const list = document.getElementById('list');
  const output = document.getElementById('output');
  const codeOut = document.getElementById('codeOut');
  const copyBtn = document.getElementById('copyBtn');
  const downloadJsBtn = document.getElementById('downloadJsBtn');

  /* Estado: lista de fotos nuevas (no las del fotos-data.js original) */
  const nuevas = [];

  /* ----------- Helpers ----------- */
  function nextNumber() {
    /* Detecta el mayor "NN" en src tipo "images/fotos/NN.jpg" del array existente + nuevas */
    const all = [...(window.FOTOS || []), ...nuevas];
    let max = 0;
    all.forEach(f => {
      const m = (f.src || '').match(/(\d+)\.[a-z]+$/i);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1 + nuevas.filter(n => !n._counted).length - nuevas.filter(n => n._counted).length;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function ratioFromDims(w, h) {
    const g = gcd(w, h);
    return `${w / g}/${h / g}`;
  }
  function ratioCommon(w, h) {
    /* Aproximamos a las proporciones más comunes */
    const r = w / h;
    const candidates = [
      ['1/1',  1],
      ['4/3',  4/3], ['3/4', 3/4],
      ['3/2',  3/2], ['2/3', 2/3],
      ['16/9', 16/9],['9/16',9/16],
      ['5/4',  5/4], ['4/5', 4/5],
      ['5/7',  5/7], ['7/5', 7/5],
    ];
    let best = candidates[0], diff = Infinity;
    candidates.forEach(([name, val]) => {
      const d = Math.abs(val - r);
      if (d < diff) { diff = d; best = [name, val]; }
    });
    return best[0];
  }

  function fmtAperture(v) {
    if (!v) return '';
    return `f/${(+v).toFixed(1).replace(/\.0$/, '')}`;
  }
  function fmtFocal(v) {
    if (!v) return '';
    return `${Math.round(+v)}mm`;
  }
  function fmtIso(v) {
    if (!v) return '';
    return `ISO ${v}`;
  }
  function camera(exif) {
    const make = (exif.Make || '').trim();
    const model = (exif.Model || '').trim();
    if (!make && !model) return '';
    if (model.toLowerCase().includes(make.toLowerCase())) return model;
    return `${make} ${model}`.trim();
  }

  /* ----------- Procesar archivos ----------- */
  async function handleFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      await processOne(file);
    }
    renderOutput();
  }

  async function processOne(file) {
    const objectURL = URL.createObjectURL(file);

    /* Cargar dimensiones reales */
    const dims = await new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = objectURL;
    });

    /* Leer EXIF */
    let exif = {};
    try { exif = await exifr.parse(file, { tiff: true, exif: true, ifd0: true }) || {}; } catch (_) {}

    /* Si EXIF tiene orientation 5/6/7/8, las dims vienen rotadas */
    const orientation = exif.Orientation || 1;
    let w = dims.w, h = dims.h;
    if ([5,6,7,8].includes(orientation)) [w, h] = [h, w];

    const idx = nuevas.length;
    const num = pad2((window.FOTOS || []).length + idx + 1);
    const filename = `${num}.jpg`;

    const data = {
      _file: file,
      _objectURL: objectURL,
      _filename: filename,
      src: `images/fotos/${filename}`,
      alt: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
      aspect: ratioFromDims(w, h),
      camera: camera(exif) || 'Cámara',
      focal: fmtFocal(exif.FocalLength) || '50mm',
      aperture: fmtAperture(exif.FNumber) || 'f/2.8',
      iso: fmtIso(exif.ISO) || 'ISO 100',
      ratio: ratioCommon(w, h)
    };

    nuevas.push(data);
    renderCard(data, idx);
  }

  /* ----------- Render de cada card ----------- */
  function renderCard(data, idx) {
    const card = document.createElement('div');
    card.className = 'card p-4 flex flex-col sm:flex-row gap-4';
    card.dataset.idx = idx;

    card.innerHTML = `
      <div class="flex-shrink-0 w-full sm:w-40 h-40 rounded-lg overflow-hidden bg-black/30">
        <img src="${data._objectURL}" alt="" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <label class="col-span-2 sm:col-span-3">
          <span class="text-white/50 mono">archivo destino</span>
          <input class="field mt-1" data-key="_filename" value="${data._filename}" />
        </label>
        <label>
          <span class="text-white/50 mono">aspect</span>
          <input class="field mt-1" data-key="aspect" value="${data.aspect}" />
        </label>
        <label>
          <span class="text-white/50 mono">ratio</span>
          <input class="field mt-1" data-key="ratio" value="${data.ratio}" />
        </label>
        <label>
          <span class="text-white/50 mono">cámara</span>
          <input class="field mt-1" data-key="camera" value="${data.camera}" />
        </label>
        <label>
          <span class="text-white/50 mono">focal</span>
          <input class="field mt-1" data-key="focal" value="${data.focal}" />
        </label>
        <label>
          <span class="text-white/50 mono">apertura</span>
          <input class="field mt-1" data-key="aperture" value="${data.aperture}" />
        </label>
        <label>
          <span class="text-white/50 mono">iso</span>
          <input class="field mt-1" data-key="iso" value="${data.iso}" />
        </label>
        <label class="col-span-2 sm:col-span-3">
          <span class="text-white/50 mono">descripción (alt)</span>
          <input class="field mt-1" data-key="alt" value="${data.alt}" />
        </label>
        <div class="col-span-2 sm:col-span-3 flex items-center gap-2 mt-2">
          <button class="btn btn-primary" data-action="download">descargar como <span data-bind="_filename">${data._filename}</span></button>
          <button class="btn" data-action="remove">quitar</button>
        </div>
      </div>
    `;

    /* Sync inputs → estado */
    card.querySelectorAll('input[data-key]').forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset.key;
        data[key] = input.value;
        if (key === '_filename') {
          data.src = `images/fotos/${input.value}`;
          card.querySelector('[data-bind="_filename"]').textContent = input.value;
        }
        renderOutput();
      });
    });

    /* Botón descargar imagen renombrada */
    card.querySelector('[data-action="download"]').addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = data._objectURL;
      a.download = data._filename;
      a.click();
    });

    /* Quitar */
    card.querySelector('[data-action="remove"]').addEventListener('click', () => {
      const i = nuevas.indexOf(data);
      if (i >= 0) nuevas.splice(i, 1);
      card.remove();
      renderOutput();
    });

    list.appendChild(card);
  }

  /* ----------- Generar el código de fotos-data.js ----------- */
  function renderOutput() {
    if (!nuevas.length) { output.classList.add('hidden'); return; }
    output.classList.remove('hidden');

    /* Las nuevas van ARRIBA (más recientes primero) */
    const todas = [
      ...nuevas.map(stripPrivate),
      ...(window.FOTOS || [])
    ];

    const body = todas.map(formatEntry).join(',\n');
    const code = `/* ============================================================
   fotos-data.js — Fuente única de verdad para fotos
   ============================================================
   ⚠️  AGREGÁ FOTOS NUEVAS ARRIBA (al inicio del array).
       Generado automáticamente por admin.html el ${new Date().toLocaleString('es-MX')}.
   ============================================================ */

window.FOTOS = [
${body}
];
`;
    codeOut.value = code;
  }

  function stripPrivate(o) {
    const { _file, _objectURL, _filename, ...rest } = o;
    return rest;
  }

  function formatEntry(f) {
    const j = (s) => JSON.stringify(s);
    return `  {
    src:      ${j(f.src)},
    alt:      ${j(f.alt || '')},
    aspect:   ${j(f.aspect)},
    camera:   ${j(f.camera)},
    focal:    ${j(f.focal)},
    aperture: ${j(f.aperture)},
    iso:      ${j(f.iso)},
    ratio:    ${j(f.ratio)}
  }`;
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
    a.download = 'fotos-data.js';
    a.click();
    URL.revokeObjectURL(url);
  });

})();
