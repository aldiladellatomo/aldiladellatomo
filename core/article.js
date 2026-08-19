var id = new URLSearchParams(window.location.search).get('id');
var state=true;
async function abootstrap() {
    var {lang, data, articles}=await getAll();
    document.getElementById("h1").innerText=articles[id]["name-"+actuallang];
    var c="<button onclick=link('../home.html?lang="+actuallang+"') id=a0 >"+lang["a0"]+"</button>";
    c=c+"<button onclick=link('../home.html?lang="+actuallang+"&class="+articles[id].class+"') id="+articles[id].class+" class='active'>"+lang[articles[id].class]+"</button";
    document.getElementById("nav").innerHTML=c
    var content=await getArticle(id);
    var b="";
    for(var i=0;i<content.length;i++){
        if(content[i].type=="link"){
            if(content[i].class=="internal"){
                b=b+"<a href=article.html?id="+content[i].id+"&lang="+actuallang+" class='internal'>"+content[i]["name-"+actuallang]+"</a>";
            }
        }
        if(content[i].type=="text"){
            b=b+"<p>"+content[i]["content-"+actuallang]+"</p>";
        }
        document.getElementById("content").innerHTML=b;
    }
}
abootstrap();