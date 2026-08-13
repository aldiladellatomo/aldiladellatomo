

async function hbootstrap(){
    var {lang, data, articles}=await getAll();
    var a="";
    for(var i=0;i<data[0];i++){
        a=a+"<button id="+data[i+1].name+" ";
        if(actualschede==data[i+1].name){
            a=a+"class=active "
        }
        a=a+"onclick='show(\""+data[i+1].name+"\")'>"+lang[0][data[i+1].name]+"</a></li>";
    }
    document.getElementById("nav").innerHTML=a;
    document.getElementById("h1").innerText=lang[0][actualschede];
    var b="";
    for(var i=1;i<articles[0]+1;i++){
        if(articles[i].class==actualschede || actualschede=="a0"){
            b=b+"<a href=core/article.html?id="+articles[i].id+" class='"+articles[i].class+"'><h1>"+articles[i]["name-"+actuallang]+"</h1><h2>"+articles[i].date+"</h2></a>";
            }
    }
    document.getElementById("div").innerHTML=b;
    }
function show(active){
    actualschede=active;
    hbootstrap();
}
hbootstrap();