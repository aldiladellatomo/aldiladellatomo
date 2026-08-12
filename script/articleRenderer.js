function renderContent(content) {
    array=content.split('/')
    rendered=""
    for(i=0;i<array.length;i++){
        switch(array[i].charAt(0)){
            case " ":
                rendered=rendered+array[i]
            break
            case "i":
                rendered=rendered+"<img src=../images/'"+array[i].slice(1).trim()+"'/>";
            break
    }}

    return redered;
    }