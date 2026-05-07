/* ============================================================
   post.js — Lee ?slug=... de la URL y renderiza el post
   ============================================================ */

(function () {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const posts = window.POSTS || [];
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    document.getElementById('post-404').classList.remove('hidden');
    return;
  }

  /* Header */
  const header = document.getElementById('post-header');
  header.classList.remove('hidden');
  document.getElementById('post-cat').textContent      = post.categoria || '';
  document.getElementById('post-title').textContent    = post.titulo || '';
  document.getElementById('post-subtitle').textContent = post.subtitle || '';
  document.getElementById('post-date').textContent     = post.fecha || '';
  document.title = `${post.titulo || 'post'} · diego díaz`;

  /* Banner */
  if (post.banner) {
    const wrap = document.getElementById('post-banner');
    const img  = document.getElementById('post-banner-img');
    img.src = post.banner;
    img.alt = post.titulo || '';
    wrap.classList.remove('hidden');
  }

  /* Contenido (markdown → HTML) */
  const content = document.getElementById('post-content');
  if (window.marked) {
    marked.setOptions({ breaks: true, gfm: true });
    content.innerHTML = marked.parse(post.contenido || '');
  } else {
    content.textContent = post.contenido || '';
  }
})();
