(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var previous = function () {
      show(current - 1);
    };
    var restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(next, 6500);
    };
    var nextButton = document.querySelector("[data-hero-next]");
    var prevButton = document.querySelector("[data-hero-prev]");
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        next();
        restart();
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        previous();
        restart();
      });
    }
    show(0);
    timer = window.setInterval(next, 6500);
  }

  function setupCardFilters() {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var filter = function () {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matched = matchedKeyword && matchedYear;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    if (input) {
      input.addEventListener("input", filter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", filter);
    }
    filter();
  }

  function renderSearchPage() {
    var container = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    if (!container || !window.movieSearchData) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }
    var render = function (query) {
      var keyword = normalize(query);
      var source = window.movieSearchData;
      var results = keyword
        ? source.filter(function (movie) {
            return normalize([
              movie.title,
              movie.region,
              movie.type,
              movie.year,
              movie.genre,
              movie.tags,
              movie.oneLine
            ].join(" ")).indexOf(keyword) !== -1;
          })
        : source.slice(0, 80);
      container.innerHTML = results.slice(0, 120).map(function (movie) {
        return [
          "<article class="movie-card">",
          "<a href="" + escapeHtml(movie.url) + "" class="card-poster">",
          "<span class="card-badge">" + escapeHtml(movie.type) + "</span>",
          "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
          "</a>",
          "<div class="card-body">",
          "<h2 class="card-title"><a href="" + escapeHtml(movie.url) + "">" + escapeHtml(movie.title) + "</a></h2>",
          "<div class="card-meta"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
          "<p class="card-summary">" + escapeHtml(movie.oneLine) + "</p>",
          "</div>",
          "</article>"
        ].join("");
      }).join("");
      var empty = document.querySelector("[data-search-empty]");
      if (empty) {
        empty.classList.toggle("is-visible", results.length === 0);
      }
    };
    render(initialQuery);
    var form = document.querySelector("[data-search-page-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : "";
        var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
        history.replaceState(null, "", url);
        render(value);
      });
    }
  }

  window.initializeMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.querySelector("[data-play-overlay]");
      if (!video || !streamUrl) {
        return;
      }
      var hlsInstance = null;
      var started = false;
      var startPlayback = function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
        if (!started) {
          started = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = streamUrl;
          }
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      };
      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("error", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroSlider();
    setupCardFilters();
    renderSearchPage();
  });
})();
