(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        play();
      });
    }

    play();
  }

  var filterInput = document.querySelector('[data-filter-cards]');
  var chipRow = document.querySelector('[data-chip-row]');

  function filterCards(value) {
    var keyword = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', function () {
      filterCards(filterInput.value);
    });
  }

  if (chipRow) {
    chipRow.addEventListener('click', function (event) {
      var button = event.target.closest('[data-chip]');
      if (!button) {
        return;
      }
      var value = button.getAttribute('data-chip') || '';
      Array.prototype.slice.call(chipRow.querySelectorAll('[data-chip]')).forEach(function (chip) {
        chip.classList.toggle('is-active', chip === button);
      });
      if (filterInput) {
        filterInput.value = value;
      }
      filterCards(value);
    });
  }
})();
