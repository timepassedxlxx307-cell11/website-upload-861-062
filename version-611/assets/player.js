import { H as Hls } from './hls.js';

export function setupMoviePlayer(sourceUrl) {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var status = document.querySelector('[data-player-status]');
  var hls = null;
  var attached = false;

  if (!shell || !video || !sourceUrl) {
    return;
  }

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(sourceUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setStatus('视频暂时无法播放');
        }
      });

      return;
    }

    video.src = sourceUrl;
  }

  function play() {
    attach();
    shell.classList.add('is-playing');
    setStatus('正在加载');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          setStatus('');
        })
        .catch(function () {
          window.setTimeout(function () {
            video.play()
              .then(function () {
                setStatus('');
              })
              .catch(function () {
                setStatus('点击视频继续播放');
              });
          }, 400);
        });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('playing', function () {
    shell.classList.add('is-playing');
    setStatus('');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0) {
      shell.classList.remove('is-playing');
    }
  });
}
