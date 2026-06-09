(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ");
  }

  var toggle = qs("[data-mobile-toggle]");
  var panel = qs("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  qsa("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = qs("input[name='q']", form);
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });

  var slides = qsa("[data-hero-slide]");
  var dots = qsa("[data-hero-dot]");
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle("active", position === heroIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle("active", position === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var pageSearch = qs("[data-page-search]");
  var filterButtons = qsa("[data-filter-button]");
  var cardList = qs("[data-card-list]");
  var emptyState = qs("[data-empty-state]");
  var activeFilter = "all";

  function fillSearchFromUrl() {
    if (!pageSearch) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      pageSearch.value = query;
    }
  }

  function matchFilter(card, filter) {
    if (!filter || filter === "all") {
      return true;
    }
    var filters = filter.split(/\s+/).filter(Boolean);
    var source = text([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.year,
      card.dataset.category
    ].join(" "));
    return filters.some(function (item) {
      return source.indexOf(text(item)) !== -1;
    });
  }

  function applyPageSearch() {
    if (!cardList) {
      return;
    }
    var query = pageSearch ? text(pageSearch.value) : "";
    var visible = 0;
    qsa(".movie-card", cardList).forEach(function (card) {
      var source = text([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.category
      ].join(" "));
      var queryMatched = !query || source.indexOf(query) !== -1;
      var filterMatched = matchFilter(card, activeFilter);
      var show = queryMatched && filterMatched;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle("active", visible === 0);
    }
  }

  fillSearchFromUrl();
  if (pageSearch) {
    pageSearch.addEventListener("input", applyPageSearch);
  }
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter-button") || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyPageSearch();
    });
  });
  applyPageSearch();

  var video = qs("#movie-player");
  var playButton = qs("[data-play-button]");
  var playerShell = qs("[data-player-shell]");
  var configNode = qs("#video-config");
  var playerReady = false;

  function readVideoUrl() {
    if (!configNode) {
      return "";
    }
    try {
      var payload = JSON.parse(configNode.textContent || "{}");
      return payload.url || "";
    } catch (error) {
      return "";
    }
  }

  function attachPlayer() {
    if (!video || playerReady) {
      return Promise.resolve();
    }
    var url = readVideoUrl();
    if (!url) {
      return Promise.resolve();
    }
    playerReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = url;
    return Promise.resolve();
  }

  function startPlayback() {
    if (!video) {
      return;
    }
    attachPlayer().then(function () {
      if (playerShell) {
        playerShell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    });
  }

  if (playButton) {
    playButton.addEventListener("click", startPlayback);
  }
  if (playerShell) {
    playerShell.addEventListener("click", function (event) {
      if (event.target === playerShell || event.target === playButton) {
        startPlayback();
      }
    });
  }
  if (video) {
    video.addEventListener("play", function () {
      if (playerShell) {
        playerShell.classList.add("is-playing");
      }
    });
  }
})();
