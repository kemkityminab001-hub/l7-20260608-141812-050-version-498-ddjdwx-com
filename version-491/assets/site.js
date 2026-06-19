(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = $('#menuButton');
        var nav = $('#mainNav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var root = $('#heroCarousel');
        if (!root) {
            return;
        }
        var slides = $all('.hero-slide', root);
        var dots = $all('[data-hero-dot]', root);
        var prev = $('[data-hero-prev]', root);
        var next = $('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        var forms = $all('[data-filter-form]');
        forms.forEach(function (form) {
            var input = $('[data-filter-input]', form);
            var list = $('[data-filter-list]');
            if (!input || !list) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');
            if (initial) {
                input.value = initial;
            }
            function filter() {
                var keyword = normalize(input.value);
                $all('.movie-card', list).forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    card.classList.toggle('is-hidden-card', keyword && haystack.indexOf(keyword) === -1);
                });
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                filter();
            });
            input.addEventListener('input', filter);
            filter();
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('videoPlayer');
        var button = document.getElementById('playButton');
        var overlay = document.getElementById('playerOverlay');
        var loaded = false;
        var hls = null;

        if (!video || !button || !overlay || !sourceUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MEDIA_ATTACHED, resolve);
                    window.setTimeout(resolve, 1200);
                });
            }
            video.src = sourceUrl;
            return Promise.resolve();
        }

        function play() {
            attach().then(function () {
                overlay.classList.add('is-hidden');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            });
        }

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });

        overlay.addEventListener('click', play);

        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
}());
