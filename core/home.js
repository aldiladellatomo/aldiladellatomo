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
        a=a+"onclick='show(\"a"+i+"\")'>"+lang["a"+i]+"</a></li>";
    }
    document.getElementById("nav").innerHTML=a;
    document.getElementById("h1").innerText=lang[actualschede];
    var z="<input id='search' type='text' placeholder='"+lang["b2"]+"' oninput=search()>";
    document.getElementById("search").innerHTML=z;
    var c="";
    var f=""
    for(var i=0;i<data[4].length;i++){
    f=f+"<option class='select' value="+data[4][i]+">"+lang[data[4][i]]+"</option>"
    }
    document.getElementById("sort").innerHTML=f;
    document.getElementById("sort").value=data[5];
    var b="";
    for(var i=articles[0];i>0;i--){
        if(articles[i].class==actualschede || actualschede=="a0"){
            b=b+"<button onclick=link('core/article.html?id="+articles[i].id+"&lang="+actuallang+"') class='"+articles[i].class+"'><h1>"+articles[i]["name-"+actuallang]+"</h1><h2>"+articles[i].date+"</h2></a>";
            }
    }
    document.getElementById("div").innerHTML=b;
    document.getElementById("h2").innerText=lang["b1"];
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
        i++;
        if(i==display.length){
            i=0;
        }
        var d="<button onclick=link('core/article.html?id="+display[i].id+"&lang="+actuallang+"') class='"+display[i].class+"'><h1>"+display[i]["name-"+actuallang]+"</h1><h2>"+display[i].date+"</h2></a>";
        
        document.getElementById("recent").innerHTML=d;
        await new Promise(resolve => setTimeout(resolve, 1000*data[6]));
    }while(true);
    }
async  function  search(){
    var {lang, data, articles}=await getAll();
    var a="";
    for(var i;i<articles.length;i++){
        if(articles[i].class==actualschede || actualschede=="a0"){
        for(var j;j<articles[i].search.length;j++){
            var string=articles[i].search[j].toLowerCase();
            if(string.includes(document.getElementById("search").value.toLowerCase())){
                a=a+"<button onclick=link('core/article.html?id="+articles[i].id+"&lang="+actuallang+"') class='"+articles[i].class+"'><h1>"+articles[i]["name-"+actuallang]+"</h1><h2>"+articles[i].date+"</h2></a>";
            }

}}}
document.getElementById("results").innerHTML=a;
}
hbootstrap();
