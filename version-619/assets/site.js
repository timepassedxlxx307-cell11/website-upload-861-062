(function () {
  const q = (selector, root) => (root || document).querySelector(selector);
  const qa = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  qa('[data-menu-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const nav = q('[data-site-nav]');
      if (!nav) return;
      nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  });

  qa('[data-hero]').forEach((hero) => {
    const slides = qa('[data-hero-slide]', hero);
    const dots = qa('[data-hero-dot]', hero);
    const prev = q('[data-hero-prev]', hero);
    const next = q('[data-hero-next]', hero);
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));

    const show = (nextIndex) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    if (prev) prev.addEventListener('click', () => show(index - 1));
    if (next) next.addEventListener('click', () => show(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
    if (slides.length > 1) setInterval(() => show(index + 1), 5200);
  });

  const runFilter = () => {
    const input = q('[data-filter-input]');
    const type = q('[data-filter-type]');
    const year = q('[data-filter-year]');
    const cards = qa('[data-movie-card]');
    const empty = q('[data-empty-state]');
    if (!cards.length || !input) return;
    const query = input.value.trim().toLowerCase();
    const typeValue = type ? type.value : '';
    const yearValue = year ? year.value : '';
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
      const okQuery = !query || text.includes(query);
      const okType = !typeValue || card.getAttribute('data-type') === typeValue;
      const okYear = !yearValue || card.getAttribute('data-year') === yearValue;
      const ok = okQuery && okType && okYear;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });

    if (empty) empty.classList.toggle('is-visible', visible === 0);
  };

  const params = new URLSearchParams(window.location.search);
  const input = q('[data-filter-input]');
  if (input && params.get('q')) input.value = params.get('q');
  qa('[data-filter-input], [data-filter-type], [data-filter-year]').forEach((el) => {
    el.addEventListener('input', runFilter);
    el.addEventListener('change', runFilter);
  });
  runFilter();

  const attachPlayer = (holder) => {
    const video = q('video', holder);
    const cover = q('[data-play-cover]', holder);
    if (!video) return;
    const url = video.getAttribute('data-stream');
    let prepared = false;

    const prepare = () => {
      if (prepared || !url) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    };

    const start = () => {
      prepare();
      if (cover) cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      video.play().catch(() => {});
    };

    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (!prepared) start();
    });
  };

  qa('[data-player]').forEach(attachPlayer);
})();
