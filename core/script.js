var theme=(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
var actuallang = new URLSearchParams(window.location.search).get('lang') || navigator.language.substring(0,2) || "en";
async function fetchJson(url) {
  var json=await fetch(url);
  return json.json();
}
async function getAll(){
    var lang= await fetchJson("https://aldiladellatomo.eu/lang/"+actuallang+".json")
    var data = await fetchJson("https://aldiladellatomo.eu/core/data.json");
    var articles = await fetchJson("https://aldiladellatomo.eu/articles/articles.json");
    return {lang,data,articles};
}
async function getArticle(id){
    var content= await fetchJson("https://aldiladellatomo.eu/articles/"+id+"/article.json");
    return content;
}
function link(link){
  window.location.href=link;
}
async function bootstrap(){
  var {lang,data,articles} =await getAll();
  var a="";
  for(var i=0;i<data[1].length;i++){
    a=a+"<option class='select' value="+data[1][i]+">"+data[1][i]+"</option>"
  }
  document.getElementById("lang").innerHTML=a;
  document.getElementById("lang").value=actuallang;
  var b="";
  for(var i=0;i<(data[2].length)/2;i++){
    b=b+"<button class='contact' onclick=link('"+data[2][i*2+1]+"')>"+data[2][i*2]+"</button>"
  }
  document.getElementById("footer").innerHTML=b;
}
bootstrap();
