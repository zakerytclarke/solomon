function generateInputForms(){
    document.getElementById("query-inputs").innerHTML="";
  for(var key in STRUCTURE){
    if(STRUCTURE[key].usage=="input"){
      if(STRUCTURE[key].type=="categorical"){
        var optionData=`<label>${key}:<select id="query-${key}" class="query-input">`;
        for(var i=0;i<STRUCTURE[key].categories.length;i++){
          if(STRUCTURE[key].categories[i]!=null){
            optionData+=`<option value=${STRUCTURE[key].categories[i]}>${STRUCTURE[key].categories[i]}</option>`;
          }
        }
        optionData+="</select></label><br>";

        document.getElementById("query-inputs").innerHTML+=optionData;
      }else{
        document.getElementById("query-inputs").innerHTML+=`
        <label>${key}:
        <input id="query-${key}-value" type="range" min="${STRUCTURE[key].stats.min}" max="${STRUCTURE[key].stats.max}" step="0.01" value="${(STRUCTURE[key].stats.max-STRUCTURE[key].stats.min)/2+STRUCTURE[key].stats.min}" onchange="document.getElementById('query-${key}').value=this.value;">
        <input type="number" id="query-${key}" class="query-input" value="${(STRUCTURE[key].stats.max-STRUCTURE[key].stats.min)/2+STRUCTURE[key].stats.min}" onchange="document.getElementById('query-${key}-value').value=this.value;">
        </label><br>
        `;

      }
    }
  }
}

/**
* Query all models
*/
function queryModels(){
  var inputs=document.getElementsByClassName("query-input");
  var inp={};
  for(var i=0;i<inputs.length;i++){
    console.log(inputs[i]);
    var k=inputs[i].id.replace("query-","");
    inp[k]=inputs[i].value;
    if(inputs[i].type=="number"){
      inp[k]=Number(inputs[i].value);
    }
  }
  var predictions={};
  for(var key in MODELS.query){
    predictions[key]=MODELS.query[key](inp);
  }
  console.log(predictions);

  var html="<tr><th>Model</th>";
  //Generate Table
  for(var key in SCHEMA.output){
    if(STRUCTURE[SCHEMA.output[key]].type=="categorical"){
      html+=`<th>${SCHEMA.output[key]} (% Correct)</th>`;
    }else{
      html+=`<th>${SCHEMA.output[key]} (Tolerance | % Error)</th>`;
    }
  }
  html+="</tr>";

  document.getElementById("queryResults").innerHTML=html;

  //Render Model Values
  for(var key in predictions){
    var html=`<tr><td>${key}</td>`;//Model Name
    for(var k2 in predictions[key]){
      var error;
      console.log(key,k2);
      if(STRUCTURE[k2].type=="categorical"){
        error=`${(100*MODELS.error[key][k2].accuracy).toFixed(2)}%`
      }else{
        error=`+/- ${MODELS.error[key][k2].averageError.toFixed(2)} | ${(100*MODELS.error[key][k2].percentError).toFixed(2)}%`;
      }

      html+=`<td><b>${formatValue(predictions[key][k2],STRUCTURE[k2].type)}</b> (${error})</td>`;
    }
    html+="</tr>";
    document.getElementById("queryResults").innerHTML+=html;
  }


}

function formatValue(value,type){
  var accuracy=4;
  switch(type){
    case "categorical":
    return value;
    break;
    case "numeric":
    return addZeroes(value);
    break;
    case "percentage":
    return addZeroes(value)+"%";
    break;
    case "currency":
    return "$"+addZeroes(value,2);
    break;
  }

  function addZeroes(num,acc) {
    if(acc==null){
      acc=accuracy;
    }
    // Convert input string to a number and store as a variable.
    var value = Number(num);
    var txt=(num+"").split(".")
    if(txt[1]&&txt[1].length>acc){
      return value.toFixed(acc);
    }else{
      return value;
    }
  }
}
