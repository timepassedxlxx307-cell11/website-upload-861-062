(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        if (menuButton) {
            menuButton.addEventListener("click", function () {
                document.body.classList.toggle("is-menu-open");
            });
        }

        document.querySelectorAll(".mobile-panel a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("is-menu-open");
            });
        });

        document.querySelectorAll("[data-back-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var index = 0;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        });

        document.querySelectorAll(".js-filter-input").forEach(function (input) {
            var scope = document.querySelector("[data-filter-scope]");
            var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input.hasAttribute("data-auto-search") && query) {
                input.value = query;
            }

            function filter() {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.classList.toggle("is-hidden-by-filter", value !== "" && text.indexOf(value) === -1);
                });
            }

            input.addEventListener("input", filter);
            filter();
        });
    });
})();

function initializeVideoPlayer(options) {
    var attach = function () {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);

        if (!video) {
            return;
        }

        var source = options.source;
        var hlsInstance = null;
        var attached = false;

        function bindSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                    }
                });
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            bindSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", attach);
    } else {
        attach();
    }
}
