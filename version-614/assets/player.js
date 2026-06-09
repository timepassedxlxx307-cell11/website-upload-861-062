(function () {
  function initFrame(frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector(".play-overlay");
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;
    var attached = false;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = stream;
      video.load();
    }

    function start() {
      attachStream();
      frame.classList.add("is-started");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener("play", function () {
      frame.classList.add("is-started");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(initFrame);
  });
})();
