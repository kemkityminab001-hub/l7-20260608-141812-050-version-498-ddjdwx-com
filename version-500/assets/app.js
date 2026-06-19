(function () {
  var menuButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(scope) {
    var root = scope || document;
    var input = root.querySelector('[data-filter-input]');
    var year = root.querySelector('[data-filter-year]');
    var genre = root.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
    var empty = root.querySelector('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    var keyword = normalize(input && input.value);
    var yearValue = year ? year.value : '';
    var genreValue = genre ? normalize(genre.value) : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-summary'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
      var matchGenre = !genreValue || normalize(card.getAttribute('data-genre')).indexOf(genreValue) !== -1;
      var ok = matchKeyword && matchYear && matchGenre;

      card.style.display = ok ? '' : 'none';

      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
    Array.prototype.slice.call(root.querySelectorAll('[data-filter-input], [data-filter-year], [data-filter-genre]')).forEach(function (field) {
      field.addEventListener('input', function () {
        applyFilters(root);
      });

      field.addEventListener('change', function () {
        applyFilters(root);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var input = root.querySelector('[data-filter-input]');

    if (q && input) {
      input.value = q;
    }

    applyFilters(root);
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.location.href = url;
    });
  });
})();
