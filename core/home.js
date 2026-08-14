var actualschede=new URLSearchParams(window.location.search).get('class') || "a0";
var state=false;
function show(active){
    link("home.html?lang="+actuallang+"&class="+active);
}
async function hbootstrap(){
    var {lang, data, articles}=await getAll();
    var number=articles[0];
    articles.splice(0,1);
    var sortedydate=articles.sort(function(a, b) {
        var dateA = new Date(a.date);
        var dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });
    articles.unshift(number);
    var a="";
    for(var i=0;i<=data[0];i++){
        a=a+"<button id=a"+i+" ";
        if(actualschede=="a"+i){
            a=a+"class=active "
        }
        a=a+"onclick='show(\"a"+i+"\")'>"+lang[0]["a"+i]+"</a></li>";
    }
    document.getElementById("nav").innerHTML=a;
    document.getElementById("h1").innerText=lang[0][actualschede];
    var b="";
    for(var i=1;i<articles[0]+1;i++){
        if(articles[i].class==actualschede || actualschede=="a0"){
            b=b+"<button onclick=link('core/article.html?id="+articles[i].id+"&lang="+actuallang+"') class='"+articles[i].class+"'><h1>"+articles[i]["name-"+actuallang]+"</h1><h2>"+articles[i].date+"</h2></a>";
            }
    }
    document.getElementById("div").innerHTML=b;
    document.getElementById("h2").innerText=lang[0]["b1"];
    }
hbootstrap();