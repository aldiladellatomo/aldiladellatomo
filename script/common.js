const appConfig = {
  siteName: 'Aldilà dell\'atomo',
  defaultTheme: 'dark',
  footerLinks: {
    github: 'https://github.com/aldiladellatomo',
    email: 'mailto:aldiladellatomo@gmail.com'
  }
};

const translations = {
  siteName: 'Aldilà dell\'atomo',
  home: 'Aldilà dell\'atomo',
  discipline1: 'Fisica',
  discipline2: 'Matematica',
  discipline3: 'Chimica',
  discipline4: 'Biologia',
  searchPlaceholder: 'Cerca articoli...',
  searchButton: 'Cerca',
  darkMode: 'Tema scuro',
  language: 'Italiano',
  navAria: 'Navigazione principale',
  searchLabel: 'Cerca articoli',
  carouselAria: 'Articoli recenti',
  sortAria: 'Ordina articoli',
  latest: 'I 3 articoli più freschi.',
  orderAZ: 'Ordina A → Z',
  orderZA: 'Ordina Z → A',
  orderNewest: 'Più recenti prima',
  orderOldest: 'Più vecchi prima',
  loading: 'Caricamento articoli...',
  footerGitHub: 'GitHub',
  footerEmail: 'Contattaci',
  articlesFoundOne: '{count} articolo trovato',
  articlesFoundMany: '{count} articoli trovati',
  noResults: 'Nessun articolo corrisponde ai filtri selezionati. Prova un altro termine.',
  backHome: 'Torna alla home',
  keywords: 'Parole chiave',
  publishedOn: 'Pubblicato il',
  articleTitlePlaceholder: 'Titolo articolo',
  articleDescriptionPlaceholder: 'Descrizione articolo.',
  subjectTitle1: 'Fisica - Atom Beyond',
  subjectTitle2: 'Matematica - Atom Beyond',
  subjectTitle3: 'Chimica - Atom Beyond',
  subjectTitle4: 'Biologia - Atom Beyond',
  heroTitleAll: 'Aldilà dell\'atomo',
  heroSubtitleAll: 'd1.',
  heroTitleDiscipline: '{discipline} in primo piano',
  heroSubtitleDiscipline: '{discipline}'
};

let currentTheme = localStorage.getItem('siteTheme') || appConfig.defaultTheme;
let currentLocale = 'it';

function loadConfig() {
  if (appConfig.defaultTheme) {
    currentTheme = localStorage.getItem('siteTheme') || appConfig.defaultTheme;
  }

  return appConfig;
}

function translate(key, params = {}) {
  const rawText = translations[key] || key;
  let text = String(rawText);

  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(params[param]));
  });

  return text;
}

function applyFooterLinks() {
  const footerLinks = appConfig.footerLinks || {};
  document.querySelectorAll('.footer-link').forEach(link => {
    const type = link.dataset.footerLink;
    if (!type || !footerLinks[type]) return;
    link.href = footerLinks[type];
  });
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('siteTheme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');

  const themeButton = document.querySelector('#theme-toggle');
  if (themeButton) {
    themeButton.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

function applyLanguage() {
  currentLocale = 'it';
  localStorage.setItem('siteLang', currentLocale);
  document.documentElement.lang = currentLocale;

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    if (!key) return;
    el.textContent = translate(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (!key) return;
    el.placeholder = translate(key);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (!key) return;
    el.setAttribute('aria-label', translate(key));
  });

  const pageTitle = document.querySelector('title[data-i18n-key]');
  if (pageTitle) {
    pageTitle.textContent = translate(pageTitle.dataset.i18nKey);
  }

  document.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: currentLocale } }));
}

async function init() {
  loadConfig();
  applyFooterLinks();
  applyTheme(currentTheme);
  applyLanguage();

  const themeButton = document.querySelector('#theme-toggle');
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }
}

window.Common = {
  translate,
  init,
  ready: null,
  get locale() {
    return currentLocale;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Common.ready = init();
});
