/* ============================================================
   fotos.js — galería:
     1. Renderiza el grid leyendo window.FOTOS (de fotos-data.js)
     2. Tilt 3D en hover
     3. Lightbox modal con navegación
   ============================================================ */

(function () {
  const gallery = document.getElementById('gallery');
  if (!gallery || !window.FOTOS) return;

  /* ----------- 1. Render del grid ----------- */
  gallery.innerHTML = window.FOTOS.map((f, i) => `
    <figure class="photo group" style="aspect-ratio:${f.aspect};" data-idx="${i}">
      <img src="${f.src}" alt="${f.alt || ''}" loading="${i < 3 ? 'eager' : 'lazy'}" />
      <div class="photo-shade"></div>
      <div class="photo-meta">
        <span>${f.camera}</span><span>${f.focal}</span><span>${f.aperture}</span><span>${f.iso}</span><span>${f.ratio}</span>
      </div>
    </figure>
  `).join('');

  const photos = Array.from(gallery.querySelectorAll('.photo'));

  /* ----------- 2. Tilt 3D + click ----------- */
  photos.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * 8;
      const rotX = (0.5 - y) * 8;
      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.idx, 10)));
  });

  /* ----------- 3. Lightbox ----------- */
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightbox-img');
  const lbMeta   = document.getElementById('lightbox-meta');
  const lbClose  = document.getElementById('lightbox-close');
  const lbPrev   = document.getElementById('lightbox-prev');
  const lbNext   = document.getElementById('lightbox-next');
  let currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    renderLightbox();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function renderLightbox() {
    const f = window.FOTOS[currentIdx];
    lbImg.src = f.src;
    lbImg.alt = f.alt || '';
    lbMeta.innerHTML = `
      <span>${f.camera}</span><span>${f.focal}</span><span>${f.aperture}</span><span>${f.iso}</span><span>${f.ratio}</span>
    `;
  }
  function next() { currentIdx = (currentIdx + 1) % window.FOTOS.length; renderLightbox(); }
  function prev() { currentIdx = (currentIdx - 1 + window.FOTOS.length) % window.FOTOS.length; renderLightbox(); }

  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  next();
    if (e.key === 'ArrowLeft')   prev();
  });
})();
