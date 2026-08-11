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

const disciplineKeys = {
  fisica: 'disciplineFisica',
  matematica: 'disciplineMatematica',
  chimica: 'disciplineChimica',
  biologia: 'disciplineBiologia'
};

function translate(key, params = {}) {
  return window.Common ? window.Common.translate(key, params) : key;
}

function getDisciplineLabel(discipline) {
  return translate(disciplineKeys[discipline] || discipline);
}

function highlightNavLink() {
  navLinks.forEach(link => {
    const discipline = link.dataset.discipline;
    link.classList.toggle('active', discipline === state.activeDiscipline);
  });
}

function normalize(text) {
  return String(text || '').toLowerCase();
}

function filterArticles() {
  return state.articles
    .filter(article => {
      if (state.activeDiscipline !== 'all' && article.discipline !== state.activeDiscipline) {
        return false;
      }
      if (!state.searchTerm) return true;
      const query = normalize(state.searchTerm);
      return [article.title, article.description, article.discipline, ...(article.keywords || [])]
        .some(value => normalize(value).includes(query));
    })
    .sort((a, b) => {
      const left = a.title.toLowerCase();
      const right = b.title.toLowerCase();
      if (left === right) return 0;
      return state.sortOrder === 'asc' ? (left < right ? -1 : 1) : (left > right ? -1 : 1);
    });
}

function renderCarousel() {
  const latest = [...state.articles]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  carouselList.innerHTML = latest.map(article => `
    <article class="carousel-card">
      <span class="tag ${article.discipline}">${getDisciplineLabel(article.discipline)}</span>
      <h2><a href="${article.page || `article.html?id=${article.id}`}" class="card-link">${article.title}</a></h2>
      <p>${article.description}</p>
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
        <span class="discipline tag ${article.discipline}">${getDisciplineLabel(article.discipline)}</span>
        <span>${new Date(article.date).toLocaleDateString(window.Common.locale === 'en' ? 'en-US' : 'it-IT')}</span>
      </div>
      <h3><a href="${article.page || `article.html?id=${article.id}`}" class="card-link">${article.title}</a></h3>
      <p>${article.description}</p>
      <p>${article.content}</p>
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

function updateView() {
  highlightNavLink();
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
        page: item.page || `article.html?id=${item.id}`,
        ...articleJson
      };
    }));
    state.articles = articleData;
    updateView();
  } catch (error) {
    carouselList.innerHTML = `<div class="no-results">Errore nel caricamento degli articoli: ${error.message}</div>`;
    articleList.innerHTML = '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  attachHandlers();
  loadArticles();
});
