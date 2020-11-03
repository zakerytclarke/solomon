function loadFromURL(url){
  fetch(url)
  .then(response => response.json())
  .then(function(data){
    loadSolomon(data)
    autoSanitize();
    changePage('home');
  });
}

function exportModel(){
  var out={};
  out.STRUCTURE=STRUCTURE;
  out.DATA=DATA;
  out.MODELS=MODELS;
  for(var key in out.MODELS.query){
    out.MODELS.query[key]=out.MODELS.query[key].toString();
  }
  out.SCHEMA=SCHEMA;
  out.FILENAME=FILENAME;

  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out));
  var dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute("href",dataStr);
  dlAnchorElem.setAttribute("download",FILENAME+".solomon");
  dlAnchorElem.click();
}

function loadSolomon(ld){

  //Load data into program
  DATA=ld.DATA;
  STRUCTURE=ld.STRUCTURE;
  MODELS=ld.MODELS;
  SCHEMA=ld.SCHEMA;
  for(var key in MODELS.query){
    //Extract function from string
    eval("var tempFunc="+MODELS.query[key]);
    MODELS.query[key]=tempFunc;
  }
  var net = new brain.NeuralNetwork();
  MODELS.model.feedforwardnetwork=net.fromJSON(MODELS.model.feedforwardnetwork);
}
