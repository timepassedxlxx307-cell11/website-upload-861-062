(function () {
  window.startMoviePlayer = function (streamUrl) {
    var video = document.querySelector('[data-video-player]');
    var layer = document.querySelector('[data-play-layer]');
    var loaded = false;
    var hls = null;

    if (!video) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function playVideo() {
      loadStream();
      video.setAttribute('controls', 'controls');

      if (layer) {
        layer.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
})();
