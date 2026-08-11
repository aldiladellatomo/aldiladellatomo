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

function applyPageTheme(code) {
  document.body.classList.remove('discipline-1', 'discipline-2', 'discipline-3', 'discipline-4');
  if (code) {
    document.body.classList.add(`discipline-${code}`);
  }
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
  const locale = window.Common ? window.Common.locale : 'it';
  const title = getLocaleValue(article, 'title');
  const description = getLocaleValue(article, 'description');
  const bodyContent = content[`content-${locale}`] || content['content-it'];

  document.title = `${title} - ${translate('home')}`;
  if (pageTitle) pageTitle.textContent = title;
  titleEl.textContent = title;
  descriptionEl.textContent = description;
  disciplineEl.textContent = getDisciplineLabel(article.discipline);
  disciplineEl.className = `discipline tag tag-${article.discipline}`;
  dateEl.textContent = `${translate('publishedOn')}: ${new Date(article.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'it-IT')}`;
  keywordsEl.textContent = (article.keywords || []).join(', ');
  contentEl.textContent = bodyContent;
  backLink.textContent = translate('backHome');
  applyPageTheme(article.discipline);
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
    contentEl.textContent = translate('invalidArticleId');
    return;
  }
  try {
    const meta = await fetchJson(`${githubBase}articles/meta.json`);
    const article = meta.find(item => String(item.id) === articleId);
    if (!article) {
      contentEl.textContent = translate('articleNotFound');
      return;
    }
    const content = await fetchJson(`${githubBase}articles/${article.id}.json`);
    renderArticle(article, content);
  } catch (error) {
    contentEl.textContent = translate('articleLoadError', { message: error.message });
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  if (window.Common && window.Common.ready) {
    await window.Common.ready;
  }
  document.addEventListener('languagechange', updateTranslations);
  loadArticle();
});
