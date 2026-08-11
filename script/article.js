const githubBase = 'https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/';
const articleId = new URLSearchParams(window.location.search).get('id');
const titleEl = document.querySelector('#article-title');
const descriptionEl = document.querySelector('#article-description');
const disciplineEl = document.querySelector('#article-discipline');
const dateEl = document.querySelector('#article-date');
const keywordsEl = document.querySelector('#article-keywords-list');
const contentEl = document.querySelector('#article-content');
const backLink = document.querySelector('#back-home');
const pageTitle = document.querySelector('#page-title');

let currentArticle = null;
let currentContent = null;

function translate(key, params = {}) {
  return window.Common ? window.Common.translate(key, params) : key;
}

function getDisciplineLabel(discipline) {
  const map = {
    fisica: 'disciplineFisica',
    matematica: 'disciplineMatematica',
    chimica: 'disciplineChimica',
    biologia: 'disciplineBiologia'
  };
  return translate(map[discipline] || discipline);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

function renderArticle(article, content) {
  currentArticle = article;
  currentContent = content;
  document.title = `${article.title} - Aldilà dell'atomo`;
  if (pageTitle) pageTitle.textContent = article.title;
  titleEl.textContent = article.title;
  descriptionEl.textContent = article.description;
  disciplineEl.textContent = getDisciplineLabel(article.discipline);
  disciplineEl.className = `discipline tag ${article.discipline}`;
  dateEl.textContent = `${translate('publishedOn')}: ${new Date(article.date).toLocaleDateString(window.Common.locale === 'en' ? 'en-US' : 'it-IT')}`;
  keywordsEl.textContent = (article.keywords || []).join(', ');
  contentEl.textContent = content.content;
  backLink.textContent = translate('backHome');
}

function updateTranslations() {
  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    if (key) el.textContent = translate(key, {});
  });
  if (currentArticle && currentContent) {
    renderArticle(currentArticle, currentContent);
  }
}

async function loadArticle() {
  if (!articleId) {
    contentEl.textContent = 'Articolo non valido: ID mancante.';
    return;
  }

  try {
    const meta = await fetchJson(`${githubBase}articles/meta.json`);
    const article = meta.find(item => String(item.id) === articleId);
    if (!article) {
      throw new Error('Articolo non trovato');
    }
    const content = await fetchJson(`${githubBase}articles/${article.id}.json`);
    renderArticle(article, content);
  } catch (error) {
    contentEl.textContent = `Errore nel caricamento dell'articolo: ${error.message}`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadArticle();
  document.addEventListener('languagechange', updateTranslations);
});
