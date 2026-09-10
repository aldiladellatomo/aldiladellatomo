var actuallang = new URLSearchParams(window.location.search).get('lang');
var cachedLangData = null;
var cachedArticles = null;
var cachedArticleContents = {};


async function getAll() {
    if (!actuallang) {
        var browserLang = navigator.language.substring(0, 2);
        actuallang = ["it", "en"].includes(browserLang) ? browserLang : "en";
    }
    if (!cachedLangData) {
        cachedLangData = await fetchJson("/lang/" + actuallang + ".json");
    }
    if (!cachedArticles) {
        cachedArticles = await fetchJson("/articles/articles.json");
    }
    return { lang: cachedLangData, articles: cachedArticles };
}
function setMetaDescription(text) {
    var meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
    }
    meta.content = text;
}
async function fetchJson(url) {
    var json = await fetch(url);
    return json.json();
}

async function getArticle(id) {
    if (!cachedArticleContents[id]) {
        cachedArticleContents[id] = await fetchJson("/articles/" + id + ".json");
    }
    return cachedArticleContents[id];
}

function link(url) {
    window.location.href = url;
}

function renderLanguageSelector(langList) {
    var langSelect = document.getElementById("lang");
    if (!langSelect) return;

    var oldPicker = langSelect.closest(".language-picker");
    if (oldPicker) {
        oldPicker.parentElement.insertBefore(langSelect, oldPicker);
        oldPicker.remove();
    }

    langSelect.innerHTML = "";
    for (var i = 0; i < langList.length; i++) {
        var option = document.createElement("option");
        option.value = langList[i];
        option.textContent = langList[i];
        langSelect.appendChild(option);
    }
    langSelect.value = actuallang;

    var picker = document.createElement("div");
    picker.className = "language-picker";
    langSelect.parentElement.insertBefore(picker, langSelect);
    picker.appendChild(langSelect);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "language-picker-toggle";
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-expanded", "false");
    picker.insertBefore(toggle, langSelect);

    var menu = document.createElement("div");
    menu.className = "language-picker-menu";
    menu.setAttribute("role", "listbox");
    picker.appendChild(menu);

    for (var j = 0; j < langList.length; j++) {
        var menuOption = document.createElement("button");
        menuOption.type = "button";
        menuOption.className = "language-picker-option";
        menuOption.textContent = langList[j];
        menuOption.dataset.value = langList[j];
        menuOption.setAttribute("role", "option");
        menuOption.addEventListener("click", function(e) {
            e.stopPropagation();
            langSelect.value = this.dataset.value;
            langSelect.dispatchEvent(new Event("change", { bubbles: true }));
            picker.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        });
        menu.appendChild(menuOption);
    }

    function updatePicker() {
        toggle.textContent = langSelect.value;
        var options = menu.querySelectorAll(".language-picker-option");
        for (var k = 0; k < options.length; k++) {
            options[k].classList.toggle("is-selected", options[k].dataset.value === langSelect.value);
        }
    }

    toggle.addEventListener("click", function(e) {
        e.stopPropagation();
        var isOpen = picker.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    langSelect.addEventListener("change", updatePicker);
    updatePicker();
}

document.addEventListener("click", function(e) {
    var pickers = document.querySelectorAll(".language-picker");
    for (var i = 0; i < pickers.length; i++) {
        if (!pickers[i].contains(e.target)) {
            pickers[i].classList.remove("is-open");
            var toggle = pickers[i].querySelector(".language-picker-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
    }
});

async function bootstrap() {
    await getAll();
    renderLanguageSelector(["it", "en"]);
}
function setFavicon(subjectClass) {
    var favicon = document.getElementById("favicon");
    if (!favicon) return;

    if (subjectClass && subjectClass !== "a0") {
        favicon.href = "/images/" + subjectClass + ".svg";
    } else {
        favicon.href = "/images/a0.svg";
    }
}
bootstrap();