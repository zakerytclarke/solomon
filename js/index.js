var FILENAME;
var ORIGINAL_DATA;
var DATA;
var STRUCTURE;
var META={};

var PAGE;

changePage('import');

var MODELS={
  query:{},
  model:{},
  error:{}
};

var OPTIONS={
  missingData:{
    numeric:"average"
  }
};

function uploadFile(file){
  console.log(file);
  var fr=new FileReader();
  FILENAME=file[0].name.replace(".csv","").replace(".json","").replace(".solomon","");
  if(file[0].name.indexOf(".solomon")!=-1){//SOLOMON
    fr.onload=function(){
      loadSolomon(fr.result);

      autoSanitize();
      changePage('home');

    }
  }else
  if(file[0].name.indexOf(".csv")!=-1){//CSV
    fr.onload=function(){
      DATA=CSVToArray(fr.result);
      CSVTOJSON();
      labelData();
      autoSanitize();

    }
  }else{//JSON
    fr.onload=function(){
      DATA=JSON.parse(fr.result);

      labelData();
      autoSanitize();
    }
  }
  fr.readAsText(file[0]);
}


function CSVTOJSON(){
  var headers=DATA[0];
  var obj=[];
  //Transform to JSON
  for(var i=1;i<DATA.length;i++){
    var temp={};
    for(var j=0;j<headers.length;j++){
      temp[headers[j]]=DATA[i][j]||null;
    }
    obj.push(temp);
  }
  DATA=obj;
};


function labelData(){
  STRUCTURE={};
  for(var key in DATA[0]){//For all fields
    STRUCTURE[key]={type:null,numeric:0,categorical:0,empty:0,currency:0,percentage:0,stats:{mean:0,median:[],mode:{},max:-Infinity,min:Infinity},categories:new Set()};
  }



  DATA.map(function(x){//For all Data points
    for(var key in x){//For all fields
      if(x[key]!=null){
        x[key]=x[key].trim();
      }
      var tDe=typeOfData(x[key]);
      //Count the number of each type
      STRUCTURE[key][tDe]++;

      //Count each response

      //Mode
      if(STRUCTURE[key].stats.mode[x[key]]!=null){
        STRUCTURE[key].stats.mode[x[key]]=STRUCTURE[key].stats.mode[x[key]]+1;
      }else{
        STRUCTURE[key].stats.mode[x[key]]=0;
      }
      if(tDe!="categorical"&&tDe!="empty"){
        //Mean
        var cN=convertToNumber(x[key]);
        STRUCTURE[key].stats.mean+=cN;//Increase mean count, divide at end
        //Median
        STRUCTURE[key].stats.median.push(cN);
        //Max & Min
        STRUCTURE[key].stats.max=Math.max(STRUCTURE[key].stats.max,cN);
        STRUCTURE[key].stats.min=Math.min(STRUCTURE[key].stats.min,cN);

      }else{
        STRUCTURE[key].categories.add(x[key]);
      }
    }
  })



  //Calculate Median and Mean
  for(var key in STRUCTURE){
    //Categorical
    STRUCTURE[key].categories=Array.from(STRUCTURE[key].categories);
    //Mean
    STRUCTURE[key].stats.mean=STRUCTURE[key].stats.mean/DATA.length;
    //Median
    STRUCTURE[key].stats.median=STRUCTURE[key].stats.median[Math.floor(STRUCTURE[key].stats.median.length/2)];
    //mode
    var max=0;
    var mode="";
    for(var key1 in STRUCTURE[key].stats.mode){
      var c=STRUCTURE[key].stats.mode[key1];
      if(c>max){
        max=c;
        mode=key1;
      }
    }
    STRUCTURE[key].stats.mode=mode;
    //Convert to a number if possible
    var tDe=typeOfData(mode);
    if(tDe!="categorical"&&tDe!="empty"){
      STRUCTURE[key].stats.mode=convertToNumber(mode);
    }
  }

}


function autoSanitize(){
  document.getElementById("page1").style.display="none";
  document.getElementById("page2").style.display="block";
  document.getElementById("fixDataTable").innerHTML=`
  <tr>
  <th>Feature</th>
  <th>Type of Data</th>
  <th>Error Handling</th>
  <th>Usage</th>
  </tr>
  `;
  for(var key in STRUCTURE){
    var td=STRUCTURE[key];
    //If majority is a category, we can assume its type
    if(td.categorical>td.empty+td.numeric+td.percentage+td.currency){
      td.type="categorical";
    }
    if(td.numeric>td.empty+td.categorical+td.percentage+td.currency){
      td.type="numeric";
    }
    if(td.percentage>td.empty+td.categorical+td.numeric+td.currency){
      td.type="percentage";
    }
    if(td.currency>td.empty+td.categorical+td.numeric+td.percentage){
      td.type="currency";
    }

    document.getElementById("fixDataTable").innerHTML+=`
    <tr id="fixDataTable-${key}">
    <td><b>${key}</b></td>
    <td id="fixDataTable-${key}-type">
    <select required>
    <option disabled selected value></option>
    <option value="categorical">Categorical</option>
    <option value="numeric">Numeric</option>
    <option value="percentage">Percentage(%)</option>
    <option value="currency">Currency($)</option>
    <option disabled value="empty">Empty</option>
    </select>
    </td>
    <td id="fixDataTable-${key}-errorHandling">
    <select required>
    <option value="remove" selected>Remove</option>
    <option value="mean">Mean</option>
    <option value="median">Median</option>
    <option value="mode">Mode</option>
    <option value="min">Minimum</option>
    <option value="max">Maximum</option>
    <option value="random">Random</option>
    <option value="0">Zero</option>
    <option value="null">Null</option>
    </select>
    </td>
    <td id="fixDataTable-${key}-usage">
    <select required>
    <option value="input">Input</option>
    <option value="output">Output</option>
    <option value="delete" selected>Delete</option>
    </select>
    </td>
    </tr>
    `;

  }
  //Fill table
  for(var key in STRUCTURE){
    var td=STRUCTURE[key];
    if(td.type){

      document.getElementById(`fixDataTable-${key}-type`).children[0].value=td.type;
      var  max=DATA.length;
      //Type %
      for(var i=0;i<document.getElementById(`fixDataTable-${key}-type`).children[0].children.length;i++){
        var v=document.getElementById(`fixDataTable-${key}-type`).children[0].children[i].value;
        if(v&&v!=""){
          document.getElementById(`fixDataTable-${key}-type`).children[0].children[i].innerHTML+=" "+(100*(td[v]||0)/max).toFixed(2)+"%";
        }
      }
      //
      for(var i=0;i<document.getElementById(`fixDataTable-${key}-errorHandling`).children[0].children.length;i++){
        var v=document.getElementById(`fixDataTable-${key}-errorHandling`).children[0].children[i].value;
        if(v&&v!=""&&td.stats[v]!=null){
          if(Number(td.stats[v])&&td.type!="categorical"&&td.type!="empty"&&Number(td.stats[v])!=-Infinity&&Number(td.stats[v])!=Infinity){
            document.getElementById(`fixDataTable-${key}-errorHandling`).children[0].children[i].innerHTML+=" ("+(td.stats[v]).toFixed(2)+")";
          }else{
            document.getElementById(`fixDataTable-${key}-errorHandling`).children[0].children[i].innerHTML+=" ("+(td.stats[v])+")";
          }
        }
      }
    }
  }


}

/**
* Remove errors and prepare data for processing
*/
function cleanData(){
  //Load Schema from table
  for(var key in STRUCTURE){
    var th=STRUCTURE[key];
    //Remove Counts
    delete th.numeric;
    delete th.categorical;
    delete th.percentage;
    delete th.currency;
    delete th.empty;
    //Read settings
    th.type=document.getElementById(`fixDataTable-${key}-type`).children[0].value;
    if(th.type=="categorical"){//Categorical can't use this
      delete th.stats.mean;
      delete th.stats.median;
      delete th.stats.min;
      delete th.stats.max;
    }
    if(th.min==-Infinity){
      delete th.min;
    }
    if(th.max==Infinity){
      delete th.max;
    }
    th.error=document.getElementById(`fixDataTable-${key}-errorHandling`).children[0].value;
    th.usage=document.getElementById(`fixDataTable-${key}-usage`).children[0].value;
  }
  console.log(STRUCTURE);

  //Fix Errors
  for(var i=0;i<DATA.length;i++){
    if(DATA[i]){
      for(var key in STRUCTURE){
        if(STRUCTURE[key].usage=="delete"){
          if(!DATA[i]){
            break;
          }

          delete DATA[i][key];//Remove column

        }else{
          //Check if type is incorrect
          if(DATA[i]&&typeOfData(DATA[i][key])!=STRUCTURE[key].type){
            //Use Error Handling Strategy
            switch(STRUCTURE[key].error){
              case "remove":
              DATA[i]=null;
              break;
              case "mean":
              DATA[i][key]=STRUCTURE[key].stats.mean;
              break;
              case "median":
              DATA[i][key]=STRUCTURE[key].stats.median;
              break;
              case "mode":
              DATA[i][key]=STRUCTURE[key].stats.mode;
              break;
              case "min":
              DATA[i][key]=STRUCTURE[key].stats.min;
              break;
              case "max":
              DATA[i][key]=STRUCTURE[key].stats.max;
              break;
              case "random":
              var max=STRUCTURE[key].stats.max;
              var min=STRUCTURE[key].stats.min;
              DATA[i][key]=(Math.random()*(max-min))+min;
              break;
              case "zero":
              DATA[i][key]=0;
              break;
              case "null":
              DATA[i][key]=null;
              break;
            }

          }else if(DATA[i]){
            //Type is correct, coerce
            switch(STRUCTURE[key].type){
              case "numeric":
              DATA[i][key]=Number(DATA[i][key])
              break;
              case "currency":
              DATA[i][key]=Number(DATA[i][key].substring(1))
              break;
              case "percentage":
              DATA[i][key]=Number(DATA[i][key].replace("%",""));
              break;
            }
          }
        }


      }
    }

  }
  //Remove null
  DATA=DATA.filter(x=>x!=null);
  console.log(DATA);
  changePage("home");
}


function renderData(){

}


function typeOfData(x){
  if(Number(x)){
    return "numeric";
  }else
  if(x!=null&&x.indexOf("$")!=-1&&Number(x.substring(1))){
    return "currency";
  }else
  if(x!=null&&x.indexOf("%")!=-1&&Number(x.replace("%",""))){
    return "percentage";
  }else
  if(x==""||x==null||x==undefined){
    return "empty";
  }else{
    return "categorical";
  }
}


function convertToNumber(x){
  if(Number(x)){
    return Number(x);
  }
  if(x!=null&&x.indexOf("$")!=-1&&Number(x.substring(1))){
    return Number(x.substring(1));
  }
  if(x!=null&&x.indexOf("%")!=-1&&Number(x.replace("%",""))){
    return Number(x.replace("%",""));
  }
}



function CSVToArray( strData, strDelimiter ){
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
  );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[ 1 ];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ){

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push( [] );

    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]){

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[ 2 ].replace(
        new RegExp( "\"\"", "g" ),
        "\""
      );

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[ 3 ];

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[ arrData.length - 1 ].push( strMatchedValue );
  }

  // Return the parsed data.
  return( arrData );
}



function exportModel(){
    var out={};
    out.STRUCTURE=STRUCTURE;
    out.DATA=DATA;
    out.MODELS=MODELS;
    for(var key in out.MODELS.query){
        out.MODELS.query[key]=out.MODELS.query[key].toString();
    }

    out.FILENAME=FILENAME;

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(out));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",dataStr);
    dlAnchorElem.setAttribute("download",FILENAME+".solomon");
    dlAnchorElem.click();
}


function trainModels(){
  initModels();
  trainBasic();
  trainNN();
}




var first=true;



function changePage(page){
  var pages=document.getElementsByClassName("page");
  for(var i=0;i<pages.length;i++){
    pages[i].style.display="none";
  }
  switch(page){
    case "import":
    document.getElementById("page1").style.display="block";
    break;
    case "home":
      document.getElementById("main-page").style.display="block";
      if(first){
        trainModels();
        first=false;
      }
    break;
    case "query":
    document.getElementById("query-page").style.display="block";
    generateInputForms();
    break;
    case "models":
    document.getElementById("models-page").style.display="block";
    break;
    case "nn":
    document.getElementById("nn-page").style.display="block";
    break;
    case "charts":
    document.getElementById("charts-page").style.display="block";
    break;
  }
  PAGE=page;
}
