var actualschede = new URLSearchParams(window.location.search).get('class') || "a0";
document.body.className = "b" + actualschede;
var state = false;
var globalArticles = [];

function show(active) {
    link("home.html?lang=" + actuallang + "&class=" + active);
}

function sortArticles(articlesList, mode) {
    return articlesList.sort(function(a, b) {
        if (mode === "mode1") return new Date(b.date) - new Date(a.date);
        if (mode === "mode2") return new Date(a.date) - new Date(b.date);
        if (mode === "mode3") return a["name-" + actuallang].localeCompare(b["name-" + actuallang]);
        if (mode === "mode4") return b["name-" + actuallang].localeCompare(a["name-" + actuallang]);
        return 0;
    });
}

function renderArticles() {
    var sortSelect = document.getElementById("sort");
    var sortMode = sortSelect ? sortSelect.value : "mode1";
    var sortedList = sortArticles([...globalArticles], sortMode);
    var b = "";
    for (var i = 0; i < sortedList.length; i++) {
        if (sortedList[i].class == actualschede || actualschede == "a0") {
            b += "<button onclick=\"link('core/article.html?id=" + sortedList[i].id + "&lang=" + actuallang + "')\" class='" + sortedList[i].class + "'>" +
                 "<h1>" + sortedList[i]["name-" + actuallang] + "</h1>" +
                 "<h2>" + sortedList[i].date + "</h2>" +
                 "</button>";
        }
    }
    document.getElementById("div").innerHTML = b;
}

function buildNav(data, lang) {
    var a = "";
    for (var i = 0; i <= data[0]; i++) {
        a += "<button id=a" + i + " ";
        if (actualschede == "a" + i) a += "class=active ";
        a += "onclick='show(\"a" + i + "\")'>" + lang["a" + i] + "</button>";
    }
    document.getElementById("nav").innerHTML = a;
}

function buildSortMenu(data, lang) {
    var f = "";
    for (var i = 0; i < data[4].length; i++) {
        f += "<option class='select' value=" + data[4][i] + ">" + lang[data[4][i]] + "</option>";
    }
    var sortSelect = document.getElementById("sort");
    sortSelect.innerHTML = f;
    sortSelect.value = data[5];
    sortSelect.onchange = renderArticles;
}

async function startCarousel(data) {
    var recentArticles = sortArticles([...globalArticles], "mode1");
    var display = [];
    var order = 0;

    for (var i = 0; i < recentArticles.length && order < data[3]; i++) {
        if (recentArticles[i].class == actualschede || actualschede == "a0") {
            display.push(recentArticles[i]);
            order++;
        }
    }

    if (display.length > 0) {
        var idx = 0;
        do {
            var d = "<button onclick=\"link('core/article.html?id=" + display[idx].id + "&lang=" + actuallang + "')\" class='" + display[idx].class + "'>" +
                    "<h1>" + display[idx]["name-" + actuallang] + "</h1>" +
                    "<h2>" + display[idx].date + "</h2>" +
                    "</button>";
            document.getElementById("recent").innerHTML = d;
            idx = (idx + 1) % display.length;
            await new Promise(resolve => setTimeout(resolve, 1000 * data[6]));
        } while (true);
    }
}

async function hbootstrap() {
    
    var { lang, data, articles } = await getAll();
    globalArticles = articles.slice(1);
    document.title = lang[actualschede] + " | " + lang["a0"];
    buildNav(data, lang);
    document.getElementById("h1").innerText = lang[actualschede];
    document.getElementById("searchbar").innerHTML = "<input id='searchdiv' type='text' placeholder='" + lang["b2"] + "' onkeyup=search()>";
    
    buildSortMenu(data, lang);
    document.getElementById("h2").innerText = lang["d2"];

    renderArticles();
    startCarousel(data);
}

async function search() {
    var { lang, articles } = await getAll();
    var queryInput = document.getElementById("searchdiv");
    var query = queryInput.value.trim().toLowerCase();
    
    var searchTitle = document.getElementById("search");
    var resultsDiv = document.getElementById("results");

    if (query.length > 0) {
        searchTitle.style.display = "block";
        resultsDiv.style.display = "flex";
        searchTitle.innerText = lang["c1"] + " «" + queryInput.value + "»";
    } else {
        searchTitle.style.display = "none";
        resultsDiv.style.display = "none";
        resultsDiv.innerHTML = "";
        return;
    }

    var a = "";
    var searchList = articles.slice(1);
    for (var i = 0; i < searchList.length; i++) {
        if (searchList[i].class == actualschede || actualschede == "a0") {
            if (searchList[i].search) {
                for (var j = 0; j < searchList[i].search.length; j++) {
                    if (searchList[i].search[j].toLowerCase().includes(query)) {
                        a += "<button onclick=\"link('core/article.html?id=" + searchList[i].id + "&lang=" + actuallang + "')\" class='" + searchList[i].class + "'>" +
                             "<h1>" + searchList[i]["name-" + actuallang] + "</h1>" +
                             "<h2>" + searchList[i].date + "</h2>" +
                             "</button>";
                        break;
                    }
                }
            }
        }
    }

    if (a === "") {
        resultsDiv.innerHTML = "<p>" + lang["c2"] + " «" + queryInput.value + "»</p>";
    } else {
        resultsDiv.innerHTML = a;
    }
}

hbootstrap();