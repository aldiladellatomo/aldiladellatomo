const githubBase = 'https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/';
const langBase = `${githubBase}lang/`;
const translations = {};
let currentLocale = localStorage.getItem('siteLang') || 'it';
let currentTheme = localStorage.getItem('siteTheme') || 'dark';

function getLocaleUrl(locale) {
  return `${langBase}${locale}.json`;
}

async function loadLocale(locale) {
  if (translations[locale]) return translations[locale];
  try {
    const response = await fetch(getLocaleUrl(locale));
    if (!response.ok) throw new Error(`Failed to load locale ${locale}`);
    translations[locale] = await response.json();
  } catch (error) {
    console.warn(error);
    translations[locale] = translations[locale] || translations.it || {};
  }
  return translations[locale];
}

function translate(key, params = {}) {
  const dictionary = translations[currentLocale] || translations.it || {};
  let text = dictionary[key] || key;
  Object.keys(params).forEach(param => {
    text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
  });
  return text;
}

function applyLanguage(locale) {
  if (!translations[locale]) locale = 'it';
  currentLocale = locale;
  localStorage.setItem('siteLang', currentLocale);
  document.documentElement.lang = currentLocale;

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    if (!key) return;
    el.textContent = translate(key, {});
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (!key) return;
    el.placeholder = translate(key, {});
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    if (!key) return;
    el.setAttribute('aria-label', translate(key, {}));
  });

  const pageTitle = document.querySelector('title[data-i18n-key]');
  if (pageTitle) {
    const key = pageTitle.dataset.i18nKey;
    pageTitle.textContent = translate(key, {});
  }

  const langSelect = document.querySelector('#lang-select');
  if (langSelect) langSelect.value = currentLocale;

  const themeButton = document.querySelector('#theme-toggle');
  if (themeButton) {
    themeButton.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
  }

  document.dispatchEvent(new CustomEvent('languagechange', { detail: { locale: currentLocale } }));
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('siteTheme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  const themeButton = document.querySelector('#theme-toggle');
  if (themeButton) themeButton.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
}

async function init() {
  await Promise.all([loadLocale('it'), loadLocale('en')]);
  if (!translations[currentLocale]) currentLocale = 'it';
  applyTheme(currentTheme);
  applyLanguage(currentLocale);

  const langSelect = document.querySelector('#lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', async () => {
      const nextLocale = langSelect.value || 'it';
      await loadLocale(nextLocale);
      applyLanguage(nextLocale);
    });
  }

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
