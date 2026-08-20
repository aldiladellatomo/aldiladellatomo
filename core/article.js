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
                var formulaText = item.formula || item["formula-" + actuallang] || item["content-" + actuallang] || "";
                
                if (item.inline) {
                    b += "<span class='latex-inline'>$" + formulaText + "$</span>";
                } else {
                    b += "<div class='latex-block'>$$" + formulaText + "$$</div>";
                }
                break;
            case "geogebra":
                b += "<div class='geogebra-container'>" +
                     "<iframe src='https://www.geogebra.org/material/iframe/id/" + item.geogebraId + "/width/800/height/500/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/true/asb/0/sri/true/rc/false/ld/false/sdz/true/ctl/false' width='100%' height='500' style='border:0px;'></iframe>" +
                     "</div>";
                break;
            
                case "quote":
                var author = item.author ? "<cite>— " + item.author + "</cite>" : "";
                b += "<blockquote class='article-quote'>" +
                "<p>«" + item["content-" + actuallang] + "»</p>" +
                author +
                "</blockquote>";
                break;

            case "table":
                var headers = item["headers-" + actuallang];
                var rows = item["rows-" + actuallang];
    
                var tableHtml = "<div class='table-container'><table class='article-table'><thead><tr>";
    

                for (var h = 0; h < headers.length; h++) {
                    tableHtml += "<th>" + headers[h] + "</th>";
                }
                tableHtml += "</tr></thead><tbody>";
    
    
                for (var r = 0; r < rows.length; r++) {
                    tableHtml += "<tr>";
                    for (var c = 0; c < rows[r].length; c++) {
                        tableHtml += "<td>" + rows[r][c] + "</td>";
                    }
                    tableHtml += "</tr>";
                }
                tableHtml += "</tbody></table></div>";
                b += tableHtml;
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
    var articleDesc = currentArticle["desc-" + actuallang] || "";
    
    document.body.className = "b" + currentArticle.class;
    
    document.getElementById("article-title").innerText = currentArticle["name-" + actuallang];
    document.title = currentArticle["name-" + actuallang] + " | " + lang["a0"];
    if (articleDesc) {
        setMetaDescription(articleDesc); 
    }
    
    document.getElementById("desc").innerText = articleDesc;
    document.getElementById("article-date").innerText = currentArticle.date;
    renderArticleNav(lang, currentArticle.class);
    
    var content = await getArticle(id);
    renderArticleContent(content, id);
}

abootstrap();