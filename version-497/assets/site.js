(function () {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            if (value) {
                window.location.href = './search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        const params = new URLSearchParams(window.location.search);
        const input = searchPage.querySelector('input[name="q"]');
        const cards = Array.from(searchPage.querySelectorAll('[data-search-card]'));
        const query = params.get('q') || '';

        function apply(value) {
            const needle = value.trim().toLowerCase();
            cards.forEach(function (card) {
                const haystack = (card.getAttribute('data-search-card') || '').toLowerCase();
                card.style.display = !needle || haystack.includes(needle) ? '' : 'none';
            });
        }

        if (input) {
            input.value = query;
            input.addEventListener('input', function () {
                apply(input.value);
            });
        }
        apply(query);
    }
}());
