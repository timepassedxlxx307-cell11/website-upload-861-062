(function () {
  var input = document.querySelector('[data-live-search-input]');
  var results = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var form = document.querySelector('[data-live-search-form]');
  var movies = window.SEARCH_MOVIES || [];
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-play">播放</span>' +
      '</a>' +
      '<div class="card-content">' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p class="card-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>' +
        '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function render(value) {
    var keyword = String(value || '').trim().toLowerCase();
    var list = movies.filter(function (movie) {
      if (!keyword) {
        return true;
      }

      var text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();

      return text.indexOf(keyword) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = keyword ? '搜索：' + value : '热门推荐';
    }

    if (results) {
      results.innerHTML = list.map(card).join('');
    }
  }

  if (input) {
    input.value = initial;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', url);
      render(value);
    });
  }

  render(initial);
})();
