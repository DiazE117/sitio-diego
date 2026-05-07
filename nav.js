/* ============================================================
   nav.js — Activa el efecto glass cuando se scrollea
   ============================================================ */

(function () {
  const nav = document.querySelector('nav.fixed');
  if (!nav) return;

  let ticking = false;
  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(update);
    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
