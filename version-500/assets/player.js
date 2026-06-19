function initMoviePlayer(videoId, buttonId, coverId, mediaUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var ready = false;
  var hls = null;

  if (!video || !button || !cover || !mediaUrl) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = mediaUrl;
  }

  function play() {
    attach();
    cover.classList.add('is-hidden');
    video.controls = true;

    var started = video.play();

    if (started && typeof started.catch === 'function') {
      started.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.stopPropagation();
    play();
  });

  cover.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
