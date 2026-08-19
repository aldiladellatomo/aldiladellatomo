var actuallang = new URLSearchParams(window.location.search).get('lang') || navigator.language.substring(0, 2) || "en";
var cachedLangData = null;
var cachedData = null;
var cachedArticles = null;
var cachedArticleContents = {};

async function fetchJson(url) {
    var json = await fetch(url);
    return json.json();
}

async function getAll() {
    if (!cachedLangData) {
        cachedLangData = await fetchJson("/lang/" + actuallang + ".json");
    }
    if (!cachedData) {
        cachedData = await fetchJson("/core/data.json");
    }
    if (!cachedArticles) {
        cachedArticles = await fetchJson("/articles/articles.json");
    }
    return { lang: cachedLangData, data: cachedData, articles: cachedArticles };
}

async function getArticle(id) {
    if (!cachedArticleContents[id]) {
        cachedArticleContents[id] = await fetchJson("/articles/" + id + "/article.json");
    }
    return cachedArticleContents[id];
}

function link(url) {
    window.location.href = url;
}

function renderLanguageSelector(langList) {
    var langSelect = document.getElementById("lang");
    if (!langSelect) return;
    var a = "";
    for (var i = 0; i < langList.length; i++) {
        a += "<option class='select' value=" + langList[i] + ">" + langList[i] + "</option>";
    }
    langSelect.innerHTML = a;
    langSelect.value = actuallang;
}

function renderFooterContacts(contactList) {
    var footer = document.getElementById("footer");
    if (!footer) return;
    var b = "";
    for (var i = 0; i < contactList.length / 2; i++) {
        b += "<button class='contact' onclick=link('" + contactList[i * 2 + 1] + "')>" + contactList[i * 2] + "</button>";
    }
    footer.innerHTML = b;
}

async function bootstrap() {
    var { lang, data } = await getAll();
    renderLanguageSelector(data[1]);
    renderFooterContacts(data[2]);
}

bootstrap();