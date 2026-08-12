const navLinks = document.querySelectorAll('.nav-links a');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const sortSelect = document.querySelector('#sort-select');
const carouselSection = document.querySelector('.carousel');
const carouselList = document.querySelector('#carousel-list');
const articleList = document.querySelector('#article-list');
const resultsInfo = document.querySelector('#results-info');
const heroTitle = document.querySelector('#hero-title');
const heroSubtitle = document.querySelector('#hero-subtitle');
const githubBase = 'https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/';

const state = {
  articles: [],
  activeDiscipline: document.body.dataset.defaultDiscipline || 'all',
  searchTerm: '',
  sortOrder: 'alpha-asc'
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

function resolveArticleHref(page) {
  if (!page) return page;
  if (page.startsWith('http') || page.startsWith('/')) return page;
  const isDisciplinePage = window.location.pathname.includes('/html/');
  return isDisciplinePage ? `../${page}` : page;
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

function sortArticles(items) {
  return [...items].sort((a, b) => {
    const leftTitle = getLocaleValue(a, 'title').toLowerCase();
    const rightTitle = getLocaleValue(b, 'title').toLowerCase();
    const leftDate = new Date(a.date).getTime();
    const rightDate = new Date(b.date).getTime();

    if (state.sortOrder === 'alpha-asc') return leftTitle.localeCompare(rightTitle);
    if (state.sortOrder === 'alpha-desc') return rightTitle.localeCompare(leftTitle);
    if (state.sortOrder === 'date-new') return rightDate - leftDate;
    if (state.sortOrder === 'date-old') return leftDate - rightDate;

    return leftTitle.localeCompare(rightTitle);
  });
}

function filterArticles() {
  const filtered = state.articles.filter(article => {
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
  });

  return sortArticles(filtered);
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
      <div class="card-row">
        <span class="tag tag-${article.discipline}">${getDisciplineLabel(article.discipline)}</span>
      </div>
      <h2><a href="${resolveArticleHref(article.page)}" class="card-link">${getLocaleValue(article, 'title')}</a></h2>
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
      <h3><a href="${resolveArticleHref(article.page)}" class="card-link">${getLocaleValue(article, 'title')}</a></h3>
      <p>${getLocaleValue(article, 'description')}</p>
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
}

function highlightNavLink() {
  navLinks.forEach(link => {
    const discipline = link.dataset.discipline;
    link.classList.toggle('active', discipline === state.activeDiscipline);
  });
}

function updateCarouselVisibility() {
  if (!carouselSection) return;
  carouselSection.style.display = state.searchTerm.trim() ? 'none' : 'grid';
}

function updateView() {
  highlightNavLink();
  applyPageTheme();
  updateHeroText();
  updateOrderControls();
  updateCarouselVisibility();
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

  searchInput.addEventListener('input', () => {
    const container = searchInput.closest('.search-box');
    if (container) {
      container.classList.toggle('has-value', searchInput.value.trim().length > 0);
    }
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

  document.addEventListener('languagechange', () => {
    updateOrderControls();
    updateHeroText();
    renderCarousel();
    renderArticles();
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

async function loadArticles() {
  const metadata = await fetchJson(`${githubBase}articles/meta.json`);
  if (!metadata) {
    carouselList.innerHTML = '';
    articleList.innerHTML = '';
    return;
  }

  const articleData = await Promise.all(metadata.map(async item => {
    const articleJson = await fetchJson(`${githubBase}articles/${item.id}.json`);
    return {
      ...item,
      ...(articleJson || {})
    };
  }));

  state.articles = articleData;
  updateView();
}

window.addEventListener('DOMContentLoaded', async () => {
  if (window.Common && window.Common.ready) {
    await window.Common.ready;
  }
  attachHandlers();
  loadArticles();
});
