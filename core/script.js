const data = await fetch("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo.github.io/main/data.json").then(response => response.json());
var lang= await fetch("https://raw.githubusercontent.com/aldiladellatomo/aldiladellatomo.github.io/main/lang/"+navigator.language.substring(0,2)+".json")
var actualschede=a0;
var a;
function bootstap(){
for(var i=1;i<data[0]+1;i++){
    a=a+"<li id="+data[i+1].name+" ";
    if(actualschede==data[i+1].name){
        a=a+"class=active "
    }
    a=a+"onclick='show(\""+data[i+1].name+"\")'>"+lang[0].window[data[i+1].name]+"</a></li>";
}
document.getElementsByClassName("nav").innerHTML=a;

}
function show(active){
    actualschede=active;
    bootstrap();
}
bootstrap();