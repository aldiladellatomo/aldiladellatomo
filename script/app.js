const githubBase = 'https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/';
const navLinks = document.querySelectorAll('.nav-links a');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const sortSelect = document.querySelector('#sort-select');
const orderButton = document.querySelector('#order-button');
const carouselList = document.querySelector('#carousel-list');
const articleList = document.querySelector('#article-list');
const resultsInfo = document.querySelector('#results-info');
const heroTitle = document.querySelector('#hero-title');
const heroSubtitle = document.querySelector('#hero-subtitle');

const state = {
  articles: [],
  activeDiscipline: document.body.dataset.defaultDiscipline || 'all',
  searchTerm: '',
  sortOrder: 'asc'
};

const disciplineLabelKeys = {
  '1': 'discipline1',
  '2': 'discipline2',
  '3': 'discipline3',
  '4': 'discipline4'
};

function translate(key, params = {}) {
  return window.Common ? window.Common.translate(key, params) : key;
}

function getLocaleValue(item, field) {
  const locale = window.Common ? window.Common.locale : 'it';
  return item[`${field}-${locale}`] || item[`${field}-it`] || '';
}

function getDisciplineLabel(code) {
  return translate(disciplineLabelKeys[String(code)] || '');
}

function applyPageTheme() {
  document.body.classList.remove('discipline-1', 'discipline-2', 'discipline-3', 'discipline-4');
  if (state.activeDiscipline !== 'all') {
    document.body.classList.add(`discipline-${state.activeDiscipline}`);
  }
}

function normalize(text) {
  return String(text || '').toLowerCase();
}

function filterArticles() {
  return state.articles
    .filter(article => {
      if (state.activeDiscipline !== 'all' && String(article.discipline) !== String(state.activeDiscipline)) {
        return false;
      }
      if (!state.searchTerm) return true;
      const query = normalize(state.searchTerm);
      return [
        getLocaleValue(article, 'title'),
        getLocaleValue(article, 'description'),
        getLocaleValue(article, 'content'),
        ...(article.keywords || [])
      ].some(value => normalize(value).includes(query));
    })
    .sort((a, b) => {
      const left = getLocaleValue(a, 'title').toLowerCase();
      const right = getLocaleValue(b, 'title').toLowerCase();
      if (left === right) return 0;
      return state.sortOrder === 'asc' ? (left < right ? -1 : 1) : (left > right ? -1 : 1);
    });
}

function renderCarousel() {
  const visible = state.activeDiscipline === 'all'
    ? state.articles
    : state.articles.filter(article => String(article.discipline) === String(state.activeDiscipline));
  const latest = [...visible]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  carouselList.innerHTML = latest.map(article => `
    <article class="carousel-card">
      <span class="tag tag-${article.discipline}">${getDisciplineLabel(article.discipline)}</span>
      <h2><a href="${article.page}" class="card-link">${getLocaleValue(article, 'title')}</a></h2>
      <p>${getLocaleValue(article, 'description')}</p>
    </article>
  `).join('');
}

function renderArticles() {
  const list = filterArticles();
  const resultKey = list.length === 1 ? 'articlesFoundOne' : 'articlesFoundMany';
  resultsInfo.textContent = translate(resultKey, { count: list.length });

  if (!list.length) {
    articleList.innerHTML = `<div class="no-results">${translate('noResults')}</div>`;
    return;
  }

  articleList.innerHTML = list.map(article => `
    <article class="article-card" data-discipline="${article.discipline}">
      <div class="meta">
        <span class="discipline tag tag-${article.discipline}">${getDisciplineLabel(article.discipline)}</span>
        <span>${new Date(article.date).toLocaleDateString(window.Common.locale === 'en' ? 'en-US' : 'it-IT')}</span>
      </div>
      <h3><a href="${article.page}" class="card-link">${getLocaleValue(article, 'title')}</a></h3>
      <p>${getLocaleValue(article, 'description')}</p>
      <p>${getLocaleValue(article, 'content')}</p>
    </article>
  `).join('');
}

function updateHeroText() {
  if (!heroTitle || !heroSubtitle) return;
  if (state.activeDiscipline === 'all') {
    heroTitle.textContent = translate('heroTitleAll');
    heroSubtitle.textContent = translate('heroSubtitleAll');
  } else {
    heroTitle.textContent = translate('heroTitleDiscipline', { discipline: getDisciplineLabel(state.activeDiscipline) });
    heroSubtitle.textContent = translate('heroSubtitleDiscipline', { discipline: getDisciplineLabel(state.activeDiscipline) });
  }
}

function updateOrderControls() {
  if (sortSelect) sortSelect.value = state.sortOrder;
  if (orderButton) orderButton.textContent = translate(state.sortOrder === 'asc' ? 'orderAZ' : 'orderZA');
}

function highlightNavLink() {
  navLinks.forEach(link => {
    const discipline = link.dataset.discipline;
    link.classList.toggle('active', discipline === state.activeDiscipline);
  });
}

function updateView() {
  highlightNavLink();
  applyPageTheme();
  updateHeroText();
  updateOrderControls();
  renderCarousel();
  renderArticles();
}

function attachHandlers() {
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const discipline = link.dataset.discipline;
      if (discipline) {
        state.activeDiscipline = discipline;
        updateView();
      }
    });
  });

  searchButton.addEventListener('click', () => {
    state.searchTerm = searchInput.value.trim();
    updateView();
  });

  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      state.searchTerm = searchInput.value.trim();
      updateView();
    }
  });

  sortSelect.addEventListener('change', () => {
    state.sortOrder = sortSelect.value;
    updateOrderControls();
    updateView();
  });

  orderButton.addEventListener('click', () => {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    updateOrderControls();
    updateView();
  });

  document.addEventListener('languagechange', () => {
    updateOrderControls();
    updateHeroText();
    renderCarousel();
    renderArticles();
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

async function loadArticles() {
  try {
    const metadata = await fetchJson(`${githubBase}articles/meta.json`);
    const articleData = await Promise.all(metadata.map(async item => {
      const articleJson = await fetchJson(`${githubBase}articles/${item.id}.json`);
      return {
        ...item,
        ...articleJson
      };
    }));
    state.articles = articleData;
    updateView();
  } catch (error) {
    carouselList.innerHTML = `<div class="no-results">${translate('errorLoadingArticles', { message: error.message })}</div>`;
    articleList.innerHTML = '';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  if (window.Common && window.Common.ready) {
    await window.Common.ready;
  }
  attachHandlers();
  loadArticles();
});
