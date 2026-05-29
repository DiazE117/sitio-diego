/* ============================================================
   text-pressure.js — Port a JS plano del componente TextPressure
   Original (React): https://codepen.io/JuanFuentes/full/rgXKGQ
   ============================================================
   Uso:
   <div class="text-pressure" data-text="Diego Díaz"
        data-color="#d6cdb4" data-min-font-size="48"></div>

   Atributos opcionales (data-*):
     data-text          texto a mostrar (default: contenido del div)
     data-color         color (default #d6cdb4)
     data-min-font-size px mínimo (default 24)
     data-width         "false" para desactivar variación de ancho
     data-weight        "false" para desactivar variación de peso
     data-italic        "false" para desactivar itálica
     data-flex          "false" para no justificar (default justifica)
   ============================================================ */

(function () {
  const FONT_FAMILY = 'Compressa VF';
  const FONT_URL = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2';

  /* Inyectar @font-face una sola vez */
  function ensureFont() {
    if (document.getElementById('tp-font-face')) return;
    const style = document.createElement('style');
    style.id = 'tp-font-face';
    style.textContent = `
      @font-face {
        font-family: '${FONT_FAMILY}';
        src: url('${FONT_URL}');
        font-style: normal;
        font-display: swap;
      }
      .text-pressure { position: relative; width: 100%; }
      .text-pressure .tp-title {
        font-family: '${FONT_FAMILY}', 'Lexend Deca', sans-serif;
        text-transform: uppercase;
        margin: 0;
        text-align: center;
        user-select: none;
        white-space: nowrap;
        font-weight: 100;
        width: 100%;
        line-height: 1;
        transform-origin: center top;
      }
      .text-pressure .tp-title.tp-flex { display: flex; justify-content: space-between; }
      .text-pressure .tp-title span { display: inline-block; }

      /* Modo inline: para usar dentro de un párrafo */
      .text-pressure.tp-inline { display: inline; width: auto; }
      .text-pressure.tp-inline .tp-title {
        display: inline; width: auto; white-space: nowrap;
        font-size: inherit; line-height: inherit; text-align: inherit;
        vertical-align: baseline;
      }
      .text-pressure.tp-inline .tp-title span { vertical-align: baseline; }
    `;
    document.head.appendChild(style);
  }

  const dist = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const getAttr = (d, maxD, minV, maxV) => {
    const v = maxV - Math.abs((maxV * d) / maxD);
    return Math.max(minV, v + minV);
  };

  function init(container) {
    ensureFont();

    const text = (container.dataset.text || container.textContent || 'Compressa').trim();
    const color = container.dataset.color || '#d6cdb4';
    const minFontSize = parseInt(container.dataset.minFontSize || '24', 10);
    const useWidth  = container.dataset.width  !== 'false';
    const useWeight = container.dataset.weight !== 'false';
    const useItalic = container.dataset.italic !== 'false';
    const inline    = container.dataset.inline === 'true' || container.classList.contains('tp-inline');
    const useFlex   = container.dataset.flex   !== 'false' && !inline;

    const chars = text.split('');

    /* Construir DOM — h1 para títulos en bloque, span para inline */
    container.innerHTML = '';
    const title = document.createElement(inline ? 'span' : 'h1');
    title.className = 'tp-title' + (useFlex ? ' tp-flex' : '');
    title.style.color = color;
    if (!inline) title.style.fontSize = minFontSize + 'px';

    const spans = chars.map((ch, i) => {
      const s = document.createElement('span');
      s.setAttribute('data-char', ch);
      s.textContent = ch === ' ' ? ' ' : ch;
      title.appendChild(s);
      return s;
    });
    container.appendChild(title);

    /* Estado del mouse */
    const mouse  = { x: 0, y: 0 };
    const cursor = { x: 0, y: 0 };

    const onMouseMove = e => { cursor.x = e.clientX; cursor.y = e.clientY; };
    const onTouchMove = e => { const t = e.touches[0]; cursor.x = t.clientX; cursor.y = t.clientY; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const r = container.getBoundingClientRect();
    mouse.x = cursor.x = r.left + r.width / 2;
    mouse.y = cursor.y = r.top + r.height / 2;

    /* Tamaño responsivo (solo en modo bloque; inline hereda del texto) */
    if (!inline) {
      const setSize = () => {
        const cw = container.getBoundingClientRect().width;
        let fs = cw / (chars.length / 2);
        fs = Math.max(fs, minFontSize);
        title.style.fontSize = fs + 'px';
      };
      let resizeTimer;
      const debouncedSetSize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setSize, 100);
      };
      setSize();
      window.addEventListener('resize', debouncedSetSize);
    }

    /* Loop de animación */
    let rafId;
    function animate() {
      mouse.x += (cursor.x - mouse.x) / 15;
      mouse.y += (cursor.y - mouse.y) / 15;

      const titleRect = title.getBoundingClientRect();
      const maxDist = titleRect.width / 2;

      spans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        const d = dist(mouse, center);

        const wdth = useWidth  ? Math.floor(getAttr(d, maxDist, 5, 200))   : 100;
        const wght = useWeight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
        const ital = useItalic ? getAttr(d, maxDist, 0, 1).toFixed(2)      : 0;

        span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${ital}`;
      });

      rafId = requestAnimationFrame(animate);
    }
    animate();
  }

  function boot() {
    document.querySelectorAll('.text-pressure').forEach(init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
