(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var section = input.closest("main") || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".searchable-card"));
      var empty = section.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query && input.name === "q") {
        input.value = query;
      }
      function applyFilter() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter") || card.textContent || "").toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      input.addEventListener("input", applyFilter);
      applyFilter();
    });
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-page-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("[data-filter-input]");
        if (input) {
          input.dispatchEvent(new Event("input", { bubbles: true }));
          var url = new URL(window.location.href);
          if (input.value.trim()) {
            url.searchParams.set("q", input.value.trim());
          } else {
            url.searchParams.delete("q");
          }
          window.history.replaceState({}, "", url.toString());
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchForms();
  });
})();
