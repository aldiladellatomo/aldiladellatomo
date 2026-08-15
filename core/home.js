var actualschede=new URLSearchParams(window.location.search).get('class') || "a0";
var state=false;
function show(active){
    link("home.html?lang="+actuallang+"&class="+active);
}
async function hbootstrap(){
    var {lang, data, articles}=await getAll();
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
    for(var i=articles[0];i>0;i--){
        if(articles[i].class==actualschede || actualschede=="a0"){
            b=b+"<button onclick=link('core/article.html?id="+articles[i].id+"&lang="+actuallang+"') class='"+articles[i].class+"'><h1>"+articles[i]["name-"+actuallang]+"</h1><h2>"+articles[i].date+"</h2></a>";
            }
    }
    document.getElementById("div").innerHTML=b;
    document.getElementById("h2").innerText=lang[0]["b1"];
    var number=articles[0];
    articles.splice(0,1);
    var sortedydate=articles.sort(function(a, b) {
        var dateA = new Date(a.date);
        var dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });
    articles.unshift(number);
    var order=0;
    var display=[];
    for(var i=articles[0];i>0 && order<data[3];i--){
        if(articles[i].class==actualschede || actualschede=="a0"){
            display.push(articles[i]);
            order++;
            }
    }
    var i=0;
    do{
        var d="<button onclick=link('core/article.html?id="+display[i].id+"&lang="+actuallang+"') class='"+display[i].class+"'><h1>"+display[i]["name-"+actuallang]+"</h1><h2>"+display[i].date+"</h2></a>";
        i++;
        for(var j=0;j<display.length;j++){
            d=d+"<button>"+j+"</button>";
        
        }
        if(i==display.length){
            i=0;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        document.getElementById("recent").innerHTML=d;
    }while(true);
    }
hbootstrap();