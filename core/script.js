async function fetchJson(url) {
  json=await fetch(url);
  return json.json();
}
async function getAll(){
    var lang= await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/lang/"+actuallang+".json")
    var data = await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/core/data.json");
    var articles = await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/articles.json");
    return {lang,data,articles};
}
var actualschede="a0";
var actuallang=navigator.language.substring(0,2)
async function getArticle(id){
    var content= await fetchJson("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo/main/articles/"+id+"/article.json");
    return content;
}
async function bootstrap(){
  var {lang,data,articles} =await getAll();
  var a="";
  for(var i=0;i<data[data[0]+1].length;i++){
    a=a+"<option class='select' value="+data[data[0]+1][i]+">"+data[data[0]+1][i]+"</option>"
  }
  document.getElementById("language").innerHTML=a;
}