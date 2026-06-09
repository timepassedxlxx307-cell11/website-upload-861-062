(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(text) {
        return (text || "").toString().trim().toLowerCase();
    }

    function setupNav() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        hero.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        hero.addEventListener("mouseleave", play);
        play();
    }

    function itemText(item) {
        return normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-tags"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-region"),
            item.getAttribute("data-type"),
            item.getAttribute("data-year"),
            item.textContent
        ].join(" "));
    }

    function applyFilter(query, root) {
        var q = normalize(query);
        var items = Array.prototype.slice.call((root || document).querySelectorAll(".js-filter-item"));
        var visible = 0;
        items.forEach(function (item) {
            var matched = !q || itemText(item).indexOf(q) !== -1;
            item.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        var status = document.querySelector("[data-search-status]");
        if (status) {
            status.textContent = q ? "已为你筛选相关影片" : "精彩内容为你呈现";
        }
        return visible;
    }

    function setupLocalFilters() {
        Array.prototype.slice.call(document.querySelectorAll(".js-local-filter")).forEach(function (form) {
            var input = form.querySelector("input");
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                applyFilter(input ? input.value : "", document);
            });
            if (input) {
                input.addEventListener("input", function () {
                    applyFilter(input.value, document);
                });
            }
        });
    }

    function setupSearchPage() {
        var form = document.querySelector(".js-search-page");
        if (!form) {
            return;
        }
        var input = form.querySelector("input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (input) {
            input.value = q;
        }
        applyFilter(q, document);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var value = input ? input.value : "";
            var nextUrl = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
            history.replaceState(null, "", nextUrl);
            applyFilter(value, document);
        });
        if (input) {
            input.addEventListener("input", function () {
                applyFilter(input.value, document);
            });
        }
    }

    ready(function () {
        setupNav();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();

function initMoviePlayer(url) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector(".player-cover");
    if (!video || !url) {
        return;
    }
    var loaded = false;
    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(url);
            hls.attachMedia(video);
        } else {
            video.src = url;
        }
    }
    function start() {
        load();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }
    if (cover) {
        cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
}
