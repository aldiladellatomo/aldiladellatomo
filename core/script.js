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
  for(var i=0;i<data[1].length;i++){
    a=a+"<option class='select' value="+data[1][i]+">"+data[1][i]+"</option>"
  }
  document.getElementById("lang").innerHTML=a;
  document.getElementById("lang").value=actuallang;
  var b="";
  for(var i=0;i<data[2].length;i++){
    b=b+"<button class='contact' href="+data[2][i][1]+" value='"+data[2][i][0]"></button>"
  }
  document.getElementById("footer").innerText=b;
}
bootstrap();
document.getElementById("lang").addEventListener("change", function() {
    actuallang = this.value;
    bootstrap();
  });