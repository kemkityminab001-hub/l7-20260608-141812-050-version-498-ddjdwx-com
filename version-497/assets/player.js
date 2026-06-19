(function () {
    const video = document.querySelector('[data-player]');
    const layer = document.querySelector('[data-player-layer]');
    const start = document.querySelector('[data-player-start]');

    if (!video || !start) {
        return;
    }

    const source = video.getAttribute('data-src');
    let ready = false;
    let engine = null;

    function load() {
        if (ready || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            engine = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            engine.loadSource(source);
            engine.attachMedia(video);
            ready = true;
        }
    }

    async function play() {
        load();
        try {
            await video.play();
            if (layer) {
                layer.classList.add('is-hidden');
            }
        } catch (error) {
            if (layer) {
                layer.classList.remove('is-hidden');
            }
        }
    }

    start.addEventListener('click', play);
    if (layer) {
        layer.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
        if (layer) {
            layer.classList.add('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (layer) {
            layer.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (engine) {
            engine.destroy();
        }
    });
}());
