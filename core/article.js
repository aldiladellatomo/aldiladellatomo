var id = new URLSearchParams(window.location.search).get('id');
async function abootstrap() {
    var {lang, data, articles}=await getAll();
    document.getElementById("h1").innerHTML=articles[id]["name-"+actuallang];
    document.getElementById("content").innerHTML=articles[id]["content-"+actuallang];
    var a="<a href=../home.html id="+data[1].name+" >"+lang[0][data[1].name]+"</button";
    document.getElementById("buttons").innerHTML=a
    var content=await getArticle(id);
    var b="";
    for(var i=0;i<content.length;i++){
        if(content[i].type=="link"){
            if(content[i].class=="internal"){
                b=b+"<a href=article.html?id="+content[i].id+" class='internal'>"+content[i]["name-"+actuallang]+"</a>";
            }
        }
        if(content[i].type=="text"){
            b=b+"<p>"+content[i]["content-"+actuallang]+"</p>";
        }
        document.getElementById("content").innerHTML=b;
    }
}
abootstrap();