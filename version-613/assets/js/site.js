(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function buildCard(movie) {
    var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(" · ");
    var title = escapeHtml(movie.title);
    var category = escapeHtml(movie.category);
    var oneLine = escapeHtml(movie.oneLine);
    var safeMeta = escapeHtml(meta);
    var cover = escapeHtml(movie.cover);
    var url = escapeHtml(movie.url);
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + url + '">',
      '<img loading="lazy" src="' + cover + '" alt="' + title + '">',
      '<span class="poster-badge">' + category + '</span>',
      '</a>',
      '<div class="card-body">',
      '<h2 class="card-title"><a href="' + url + '">' + title + '</a></h2>',
      '<div class="card-meta"><span>' + safeMeta + '</span></div>',
      '<p class="card-desc clamp-3">' + oneLine + '</p>',
      '</div>',
      '</article>'
    ].join("");
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-nav-links]");
    var search = document.querySelector("[data-header-search]");

    if (toggle && nav && search) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
        search.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      show(0);
      setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    var filterInput = document.querySelector("[data-card-filter]");
    if (filterInput) {
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      filterInput.addEventListener("input", function () {
        var keyword = normalize(filterInput.value);
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-meta"));
          card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
        });
      });
    }

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && window.MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var input = document.querySelector("[data-search-input]");
      var category = document.querySelector("[data-search-category]");
      var sort = document.querySelector("[data-search-sort]");
      var result = document.querySelector("[data-search-results]");
      var initial = params.get("q") || "";
      if (input) {
        input.value = initial;
      }
      var render = function () {
        var keyword = normalize(input ? input.value : "");
        var selectedCategory = category ? category.value : "";
        var order = sort ? sort.value : "default";
        var list = window.MOVIES.filter(function (movie) {
          var haystack = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(" "));
          var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
          var categoryOk = !selectedCategory || movie.category === selectedCategory;
          return keywordOk && categoryOk;
        });
        if (order === "year") {
          list.sort(function (a, b) {
            return String(b.year).localeCompare(String(a.year));
          });
        }
        if (order === "title") {
          list.sort(function (a, b) {
            return a.title.localeCompare(b.title, "zh-Hans-CN");
          });
        }
        if (!list.length) {
          result.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词再试。</div>';
          return;
        }
        result.innerHTML = list.map(buildCard).join("");
      };
      [input, category, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", render);
          control.addEventListener("change", render);
        }
      });
      render();
    }
  });
})();
