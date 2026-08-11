const appConfig = {};
const translations = { it: {} };
let currentTheme = localStorage.getItem('siteTheme') || 'dark';
let currentLocale = 'it';

function getLocaleFilePath() {
  const inHtmlFolder = window.location.pathname.includes('/html/');
  return inHtmlFolder ? '../lang/it.json' : './lang/it.json';
}

async function loadConfig() {
  try {
    const configPath = window.location.pathname.includes('/html/')
      ? '../configuration.json'
      : './configuration.json';

    const response = await fetch(configPath, { cache: 'no-store' });
    if (!response || !response.ok) return appConfig;

    const config = await response.json();
    Object.assign(appConfig, config || {});

    if (appConfig.defaultTheme) {
      currentTheme = localStorage.getItem('siteTheme') || appConfig.defaultTheme;
    }
  } catch {
    // silently keep the defaults in case config is unavailable
  }

  return appConfig;
}

async function loadLocale() {
  try {
    const response = await fetch(getLocaleFilePath(), { cache: 'no-store' });
    if (!response || !response.ok) {
      translations.it = {};
      return translations.it;
    }

    translations.it = await response.json();
  } catch {
    translations.it = {};
  }

  return translations.it;
}

function translate(key, params = {}) {
  const rawText = translations.it[key] || key;
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
  await loadConfig();
  await loadLocale();
  applyFooterLinks();
  applyTheme(currentTheme);
  applyLanguage();

  const langSelect = document.querySelector('#lang-select');
  if (langSelect) {
    langSelect.innerHTML = '<option value="it">IT</option>';
    langSelect.value = 'it';
    langSelect.disabled = true;
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
