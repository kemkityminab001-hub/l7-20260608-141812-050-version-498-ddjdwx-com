(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                restart();
            });
        }

        restart();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-key]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

    function filterCards(value) {
        var keyword = (value || "").trim().toLowerCase();

        cards.forEach(function (card) {
            var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-keywords") || "")).toLowerCase();
            card.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            filterCards(searchInput.value);
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var value = button.getAttribute("data-filter-key") || "";

            filterButtons.forEach(function (item) {
                item.classList.toggle("active", item === button);
            });

            if (searchInput) {
                searchInput.value = value;
            }

            filterCards(value);
        });
    });

    var video = document.getElementById("movie-video");
    var playerButton = document.getElementById("player-trigger");
    var playerConfig = document.getElementById("player-config");
    var playerShell = document.querySelector(".player-shell");
    var hlsInstance = null;
    var attached = false;

    function attachVideo() {
        if (!video || !playerConfig || attached) {
            return;
        }

        var url = playerConfig.textContent.trim();

        if (!url) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            attached = true;
        } else {
            video.src = url;
            attached = true;
        }
    }

    function playVideo() {
        if (!video) {
            return;
        }

        attachVideo();

        if (playerShell) {
            playerShell.classList.add("playing");
        }

        video.setAttribute("controls", "controls");
        var playRequest = video.play();

        if (playRequest && playRequest.catch) {
            playRequest.catch(function () {});
        }
    }

    if (playerButton) {
        playerButton.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
