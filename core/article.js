var id = new URLSearchParams(window.location.search).get('id');
var state = true;

function renderArticleNav(lang, articleClass) {
    var c = "<button onclick=link('../home.html?lang=" + actuallang + "') id=a0 >" + lang["a0"] + "</button>";
    c += "<button onclick=link('../home.html?lang=" + actuallang + "&class=" + articleClass + "') id=" + articleClass + " class='active'>" + lang[articleClass] + "</button>";
    document.getElementById("nav").innerHTML = c;
}

function renderArticleContent(content) {
    var b = "";
    for (var i = 0; i < content.length; i++) {
        if (content[i].type == "link" && content[i].class == "internal") {
            b += "<a id=c" + content[i].class + " href=article.html?id=" + content[i].id + "&lang=" + actuallang + " class='internal'>" + content[i]["name-" + actuallang] + "</a>";
        } else if (content[i].type == "text") {
            b += "<p>" + content[i]["content-" + actuallang] + "</p>";
        }
    }
    document.getElementById("content").innerHTML = b;
}

async function abootstrap() {
    var { lang, articles } = await getAll();
    var currentArticle = articles[id];
    
    document.body.className = "b" + currentArticle.class;
    document.getElementById("h1").innerText = currentArticle["name-" + actuallang];
    
    renderArticleNav(lang, currentArticle.class);
    
    var content = await getArticle(id);
    renderArticleContent(content);
}

abootstrap();