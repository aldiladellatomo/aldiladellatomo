
async function fetchJson(url) {
  json=await fetch(url);
  return json.json();
}
var actualschede="a0";
var actuallang=navigator.language.substring(0,2)
async function bootstrap(){
    var a="";
    var lang= await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/lang/"+actuallang+".json")
    const data = await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/core/data.json");
    for(var i=0;i<data[0];i++){
        a=a+"<button id="+data[i+1].name+" ";
        if(actualschede==data[i+1].name){
            a=a+"class=active "
        }
        a=a+"onclick='show(\""+data[i+1].name+"\")'>"+lang[0][data[i+1].name]+"</a></li>";
    }
    document.getElementById("nav").innerHTML=a;
    document.getElementById("h1").innerText=lang[0][actualschede];
    var articles=await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/articles.json");
    var b="";
    for(var i=0;i<articles.length;i++){
        if(articles[i].class==actualschede){
            b=b+"<button class='"+actualschede+"'></button>";
            }
    }
    document.getElementById("div").innerHTML=b;
    }
function show(active){
    actualschede=active;
    bootstrap();
}
bootstrap();