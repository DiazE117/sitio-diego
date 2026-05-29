/* ============================================================
   variable-proximity.js — Port a JS plano de VariableProximity
   Original (React): reactbits.dev / motion
   ============================================================
   Interpola font-variation-settings de cada letra según la
   distancia del cursor, con un radio y curva de falloff.
   Mantiene la fuente original (ideal para texto inline).

   Uso:
   <span class="variable-proximity"
         data-label="diego"
         data-from="'wght' 400"
         data-to="'wght' 900"
         data-radius="90"
         data-falloff="gaussian"></span>

   data-from / data-to: ajustes de variación (ej. "'wght' 400, 'wdth' 100")
   data-radius:  radio de influencia en px (default 80)
   data-falloff: linear | exponential | gaussian (default linear)
   ============================================================ */

(function () {
  function parseSettings(str) {
    return str.split(',').map(s => s.trim()).filter(Boolean).map(s => {
      const parts = s.split(/\s+/);
      const name = parts[0].replace(/['"]/g, '');
      return [name, parseFloat(parts[1])];
    });
  }

  function init(el) {
    const label   = (el.dataset.label || el.textContent || '').trim();
    const from    = el.dataset.from || "'wght' 400";
    const to      = el.dataset.to   || "'wght' 900";
    const radius  = parseFloat(el.dataset.radius || '80');
    const falloff = el.dataset.falloff || 'linear';

    const fromMap = new Map(parseSettings(from));
    const toMap   = new Map(parseSettings(to));
    const axes = Array.from(fromMap.entries()).map(([axis, fromValue]) => ({
      axis, fromValue, toValue: toMap.has(axis) ? toMap.get(axis) : fromValue
    }));

    /* Construir DOM: una palabra envuelta + una letra por span */
    el.innerHTML = '';
    el.style.display = el.style.display || 'inline';

    const words = label.split(' ');
    const letters = [];
    words.forEach((word, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      word.split('').forEach(ch => {
        const s = document.createElement('span');
        s.style.display = 'inline-block';
        s.style.fontVariationSettings = from;
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        wordSpan.appendChild(s);
        letters.push(s);
      });
      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.style.display = 'inline-block';
        sp.innerHTML = '&nbsp;';
        el.appendChild(sp);
      }
    });
    /* Texto accesible para lectores de pantalla */
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.appendChild(sr);

    /* Posición del cursor (coordenadas de viewport) */
    const mouse = { x: -9999, y: -9999 };
    let last = { x: null, y: null };
    const onMove = (x, y) => { mouse.x = x; mouse.y = y; };
    window.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', e => {
      const t = e.touches[0]; onMove(t.clientX, t.clientY);
    }, { passive: true });

    function falloffValue(distance) {
      const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
      if (falloff === 'exponential') return norm * norm;
      if (falloff === 'gaussian') return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      return norm; // linear
    }

    let rafId;
    function loop() {
      if (mouse.x !== last.x || mouse.y !== last.y) {
        last = { x: mouse.x, y: mouse.y };
        letters.forEach(letter => {
          const rect = letter.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = mouse.x - cx, dy = mouse.y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= radius) {
            letter.style.fontVariationSettings = from;
            return;
          }
          const f = falloffValue(distance);
          letter.style.fontVariationSettings = axes
            .map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * f}`)
            .join(', ');
        });
      }
      rafId = requestAnimationFrame(loop);
    }
    loop();
  }

  function boot() {
    document.querySelectorAll('.variable-proximity').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
