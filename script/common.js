const Common = (function() {
  const translations = {
    it: {
      home: 'Aldilà dell'atomo',
      fisica: 'Fisica',
      matematica: 'Matematica',
      chimica: 'Chimica',
      biologia: 'Biologia',
      searchPlaceholder: 'Cerca articoli...',
      searchButton: 'Cerca',
      darkMode: 'Tema scuro',
      language: 'English',
      latest: 'Carosello con gli ultimi 3 articoli pubblicati.',
      orderAZ: 'Ordina A → Z',
      orderZA: 'Ordina Z → A',
      loading: 'Caricamento articoli...',
      articlesFoundOne: '{count} articolo trovato',
      articlesFoundMany: '{count} articoli trovati',
      noResults: 'Nessun articolo corrisponde ai criteri selezionati. Prova a cambiare la ricerca o la materia.',
      backHome: 'Torna alla home',
      keywords: 'Parole chiave',
      publishedOn: 'Pubblicato il',
      heroTitleAll: 'La scienza in primo piano',
      heroSubtitleAll: 'Esplora articoli recenti, ordina alfabeticamente e filtra per disciplina. Scopri contenuti facili da leggere su fisica, matematica, chimica e biologia.',
      heroTitleDiscipline: '{discipline} in primo piano',
      heroSubtitleDiscipline: 'Approfondimenti sulla materia, esempi e concetti chiave di {discipline}.',
      disciplineFisica: 'Fisica',
      disciplineMatematica: 'Matematica',
      disciplineChimica: 'Chimica',
      disciplineBiologia: 'Biologia'
    },
    en: {
      home: 'Atom Beyond',
      fisica: 'Physics',
      matematica: 'Mathematics',
      chimica: 'Chemistry',
      biologia: 'Biology',
      searchPlaceholder: 'Search articles...',
      searchButton: 'Search',
      darkMode: 'Dark theme',
      language: 'Italiano',
      latest: 'Carousel with the latest 3 published articles.',
      orderAZ: 'Sort A → Z',
      orderZA: 'Sort Z → A',
      loading: 'Loading articles...',
      articlesFoundOne: '{count} article found',
      articlesFoundMany: '{count} articles found',
      noResults: 'No articles match the selected filters. Try changing your search or subject.',
      backHome: 'Back to home',
      keywords: 'Keywords',
      publishedOn: 'Published on',
      heroTitleAll: 'Science in the spotlight',
      heroSubtitleAll: 'Explore recent articles, sort alphabetically and filter by subject. Find easy-to-read content on physics, mathematics, chemistry and biology.',
      heroTitleDiscipline: '{discipline} in focus',
      heroSubtitleDiscipline: 'Insights on the subject, examples and key concepts in {discipline}.',
      disciplineFisica: 'Physics',
      disciplineMatematica: 'Mathematics',
      disciplineChimica: 'Chemistry',
      disciplineBiologia: 'Biology'
    }
  };

  let currentLocale = localStorage.getItem('siteLang') || 'it';
  let currentTheme = localStorage.getItem('siteTheme') || 'light';

  function applyLanguage(locale) {
    currentLocale = locale;
    localStorage.setItem('siteLang', locale);
    document.documentElement.lang = locale;
    const elements = document.querySelectorAll('[data-i18n-key]');
    elements.forEach(el => {
      const key = el.dataset.i18nKey;
      if (!key) return;
      el.textContent = translate(key, {});
    });

    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (!key) return;
      el.placeholder = translate(key, {});
    });

    document.querySelectorAll('.nav-links [data-i18n-key]').forEach(el => {
      const key = el.dataset.i18nKey;
      if (key) el.textContent = translate(key, {});
    });

    const langToggle = document.querySelector('#lang-toggle');
    if (langToggle) langToggle.checked = locale === 'en';
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) themeToggle.checked = currentTheme === 'dark';

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { locale } }));
  }

  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('siteTheme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) themeToggle.checked = theme === 'dark';
  }

  function translate(key, params = {}) {
    const locale = currentLocale;
    const dictionary = translations[locale] || translations.it;
    let text = dictionary[key] || translations.it[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`\{${param}\}`, 'g'), params[param]);
    });
    return text;
  }

  function init() {
    if (!translations[currentLocale]) {
      currentLocale = 'it';
    }
    applyTheme(currentTheme);
    applyLanguage(currentLocale);
    const langToggle = document.querySelector('#lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('change', () => {
        applyLanguage(langToggle.checked ? 'en' : 'it');
      });
    }
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        applyTheme(themeToggle.checked ? 'dark' : 'light');
      });
    }
  }

  return {
    init,
    translate,
    get locale() {
      return currentLocale;
    }
  };
})();

document.addEventListener('DOMContentLoaded', Common.init);
