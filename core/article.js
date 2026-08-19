var id = new URLSearchParams(window.location.search).get('id');
var state = true;

function renderArticleNav(lang, articleClass) {
    var c = "<button onclick=link('../home.html?lang=" + actuallang + "') id=a0 >" + lang["a0"] + "</button>";
    c += "<button onclick=link('../home.html?lang=" + actuallang + "&class=" + articleClass + "') id=" + articleClass + " class='active'>" + lang[articleClass] + "</button>";
    document.getElementById("nav").innerHTML = c;
}

function renderArticleContent(content, articleId) {
    var b = "";

    for (var i = 0; i < content.length; i++) {
        var item = content[i];

        switch (item.type) {
            case "text":
                b += "<p>" + item["content-" + actuallang] + "</p>";
                break;
            
            case "bold":
                b += "<p><strong>" + item["content-" + actuallang] + "</strong></p>";
                break;

            case "link":
                if (item.class === "internal") {
                    b += "<a id='c" + item.class + "' href='article.html?id=" + item.id + "&lang=" + actuallang + "' class='internal'>" + item["name-" + actuallang] + "</a>";
                } else {
                    b += "<a href='" + item.url + "' target='_blank' rel='noopener noreferrer' class='external'>" + item["name-" + actuallang] + "</a>";
                }
                break;

            case "image":
                var caption = item["caption-" + actuallang] ? "<figcaption>" + item["caption-" + actuallang] + "</figcaption>" : "";
                b += "<figure class='article-image'>" +
                     "<img src='/images/" + articleId + "/" + item.src + "' alt='" + (item["alt-" + actuallang] || "") + "'>" +
                     caption +
                     "</figure>";
                break;

            case "latex":
                b += "<div class='math-formula'>$$" + item.formula + "$$</div>";
                break;

            case "geogebra":
                b += "<div class='geogebra-container'>" +
                     "<iframe src='https://www.geogebra.org/material/iframe/id/" + item.geogebraId + "/width/800/height/500/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/true/asb/0/sri/true/rc/false/ld/false/sdz/true/ctl/false' width='100%' height='500' style='border:0px;'></iframe>" +
                     "</div>";
                break;
        }
    }

    document.getElementById("content").innerHTML = b;

    if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise();
    }
}

async function abootstrap() {
    var { lang, articles } = await getAll();
    var currentArticle = articles[id];
    document.title = currentArticle["name-" + actuallang] + " | " + lang["a0"];
    document.body.className = "b" + currentArticle.class;
    document.getElementById("h1").innerText = currentArticle["name-" + actuallang];
    
    renderArticleNav(lang, currentArticle.class);
    
    var content = await getArticle(id);
    renderArticleContent(content, id);
}

abootstrap();