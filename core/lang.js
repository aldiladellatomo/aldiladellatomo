document.getElementById("lang").addEventListener("change", function() {
    actuallang = this.value;
    if (state) {
        link("article.html?id=" + id + "&lang=" + actuallang);
    } else {
        link("home.html?class=" + actualschede + "&lang=" + actuallang);
    }
});