function loadFromURL(url){
  fetch(url)
  .then(response => response.json())
  .then(function(data){
    loadSolomon(data)
    autoSanitize();
    changePage('home');
  });
}

function loadSolomon(ld){

  //Load data into program
  DATA=ld.DATA;
  STRUCTURE=ld.STRUCTURE;
  MODELS=ld.MODELS;
  for(var key in MODELS.query){
    //Extract function from string
    eval("var tempFunc="+MODELS.query[key]);
    MODELS.query[key]=tempFunc;
  }
}
