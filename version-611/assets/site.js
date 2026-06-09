(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', menu.classList.contains('is-open'));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var query = normalize(filterInput ? filterInput.value : '');
    var typeValue = normalize(typeFilter ? typeFilter.value : '');
    var yearValue = normalize(yearFilter ? yearFilter.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var typeText = normalize(card.getAttribute('data-type'));
      var yearText = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (query && searchText.indexOf(query) === -1) {
        matched = false;
      }

      if (typeValue && typeText.indexOf(typeValue) === -1) {
        matched = false;
      }

      if (yearValue && yearText.indexOf(yearValue) === -1) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput || typeFilter || yearFilter) {
    [filterInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');

    if (queryValue && filterInput) {
      filterInput.value = queryValue;
    }

    applyFilter();
  }
})();
