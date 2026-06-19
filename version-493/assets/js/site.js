(function () {
    var navButton = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var sortSelects = Array.prototype.slice.call(document.querySelectorAll('[data-sort-select]'));
        function applyFilter(input) {
            var root = input.closest('.container') || document;
            var keyword = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                card.setAttribute('data-hidden', keyword && haystack.indexOf(keyword) === -1 ? 'true' : 'false');
            });
        }
        function applySort(select) {
            var root = select.closest('.container') || document;
            var grid = root.querySelector('[data-card-grid]');
            if (!grid) {
                return;
            }
            var mode = select.value;
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            cards.sort(function (a, b) {
                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                }
                var av = Number(a.getAttribute('data-' + mode) || 0);
                var bv = Number(b.getAttribute('data-' + mode) || 0);
                return bv - av;
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        searchInputs.forEach(function (input) {
            input.addEventListener('input', function () {
                applyFilter(input);
            });
        });
        sortSelects.forEach(function (select) {
            select.addEventListener('change', function () {
                applySort(select);
            });
        });
    }

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__hlsLoadingPromise) {
            return window.__hlsLoadingPromise;
        }
        window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error('hls load failed'));
            };
            document.head.appendChild(script);
        });
        return window.__hlsLoadingPromise;
    }

    function setupPlayers() {
        var modules = Array.prototype.slice.call(document.querySelectorAll('.player-module'));
        modules.forEach(function (module) {
            var video = module.querySelector('video');
            var button = module.querySelector('[data-play-button]');
            var status = module.querySelector('[data-player-status]');
            var src = module.getAttribute('data-video-src');
            var hlsInstance = null;
            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }
            function attachNative() {
                video.src = src;
                video.dataset.ready = '1';
                setStatus('播放源已就绪');
                return Promise.resolve();
            }
            function attachHls(Hls) {
                if (!Hls || !Hls.isSupported()) {
                    return Promise.reject(new Error('unsupported'));
                }
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                video.dataset.ready = '1';
                setStatus('播放源已就绪');
                return Promise.resolve();
            }
            function prepare() {
                if (!video || !src) {
                    return Promise.reject(new Error('missing'));
                }
                if (video.dataset.ready === '1') {
                    return Promise.resolve();
                }
                setStatus('正在加载播放源');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    return attachNative();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    return attachHls(window.Hls);
                }
                return loadHlsLibrary().then(attachHls);
            }
            function start() {
                prepare().then(function () {
                    module.classList.add('is-playing');
                    return video.play();
                }).catch(function () {
                    setStatus('当前浏览器无法加载该播放源');
                    module.classList.remove('is-playing');
                });
            }
            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('play', function () {
                    module.classList.add('is-playing');
                });
                video.addEventListener('error', function () {
                    setStatus('播放源加载异常');
                    module.classList.remove('is-playing');
                });
            }
        });
    }

    setupHero();
    setupFilters();
    setupPlayers();
})();
