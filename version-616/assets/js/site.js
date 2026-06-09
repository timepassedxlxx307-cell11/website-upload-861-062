(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroCarousel();
    initImageFallbacks();
    initFilterPanels();
    initSearchPage();
    initPlayers();
    initBackTop();
  });

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll('img.movie-img');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.poster-frame');
        var slide = image.closest('.hero-slide');
        var detailHero = image.closest('.detail-hero');

        image.style.opacity = '0';

        if (poster) {
          poster.classList.add('is-missing');
        }

        if (slide) {
          slide.classList.add('is-missing');
        }

        if (detailHero) {
          detailHero.classList.add('is-missing');
        }
      }, { once: true });
    });
  }

  function initFilterPanels() {
    var panels = document.querySelectorAll('[data-filter-panel]');

    panels.forEach(function (panel) {
      var container = panel.parentElement;
      var results = container ? container.querySelector('[data-filter-results]') : null;
      var cards = results ? Array.prototype.slice.call(results.querySelectorAll('[data-movie-card]')) : [];
      var keyword = panel.querySelector('[data-filter-keyword]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var region = panel.querySelector('[data-filter-region]');
      var count = panel.querySelector('[data-filter-count]');

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function cardMatches(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        var keywordValue = normalize(keyword && keyword.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);

        if (keywordValue && text.indexOf(keywordValue) === -1) {
          return false;
        }

        if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
          return false;
        }

        if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
          return false;
        }

        if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
          return false;
        }

        return true;
      }

      function applyFilters() {
        var visible = 0;

        cards.forEach(function (card) {
          var matches = cardMatches(card);
          card.classList.toggle('is-hidden-by-filter', !matches);

          if (matches) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [keyword, year, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function initSearchPage() {
    var root = document.querySelector('[data-search-page]');

    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var form = root.querySelector('[data-search-form]');
    var input = root.querySelector('[data-search-input]');
    var type = root.querySelector('[data-search-type]');
    var region = root.querySelector('[data-search-region]');
    var year = root.querySelector('[data-search-year]');
    var results = root.querySelector('[data-search-results]');
    var count = root.querySelector('[data-search-count]');
    var popular = document.querySelector('[data-search-popular]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function createCard(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + escapeHtml(movie.href) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <div class="poster-frame">',
        '      <img class="movie-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="movie-type-badge">' + escapeHtml(movie.type) + '</span>',
        '      <span class="movie-year-badge">' + escapeHtml(movie.year) + '</span>',
        '      <span class="movie-play-hover">▶</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-meta-line">',
        '        <span>' + escapeHtml(movie.region) + '</span>',
        '        <span>' + escapeHtml(movie.genre) + '</span>',
        '      </div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function applySearch() {
      var queryValue = normalize(input && input.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' '));

        if (queryValue && haystack.indexOf(queryValue) === -1) {
          return false;
        }

        if (typeValue && normalize(movie.type) !== typeValue) {
          return false;
        }

        if (regionValue && normalize(movie.region) !== regionValue) {
          return false;
        }

        if (yearValue && normalize(movie.year) !== yearValue) {
          return false;
        }

        return true;
      }).slice(0, 120);

      if (results) {
        results.innerHTML = matched.map(createCard).join('');
      }

      if (count) {
        count.textContent = String(matched.length);
      }

      if (popular) {
        popular.style.display = queryValue || typeValue || regionValue || yearValue ? 'none' : '';
      }

      initImageFallbacks();
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch();
      });
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }

  function initPlayers() {
    var videos = document.querySelectorAll('video[data-hls]');

    videos.forEach(function (video) {
      var source = video.getAttribute('data-hls');
      var shell = video.closest('.player-shell');
      var playButton = shell ? shell.querySelector('.player-start-button') : null;

      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      if (playButton) {
        playButton.addEventListener('click', function () {
          video.play().catch(function () {
            video.controls = true;
          });
        });
      }

      video.addEventListener('play', function () {
        if (shell) {
          shell.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        if (shell && video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  function initBackTop() {
    var buttons = document.querySelectorAll('[data-back-top]');

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }
}());
