function renderExamine(){
  document.getElementById("statsInfoTable").innerHTML=`
    <tr>
      <th>Feature</th>
      <th>Mean</th>
      <th>Median</th>
      <th>Mode</th>
      <th>Minimum</th>
      <th>Maximum</th>
    </tr>`;

    for(var key in STRUCTURE){
        if(STRUCTURE[key].usage!="delete"){
          document.getElementById("statsInfoTable").innerHTML+=`<tr><td>${key}</td><td>${formatValue((STRUCTURE[key].stats.mean||NaN),STRUCTURE[key].type)}</td><td>${formatValue((STRUCTURE[key].stats.median||NaN),STRUCTURE[key].type)}</td><td>${STRUCTURE[key].stats.mode}</td><td>${formatValue((STRUCTURE[key].stats.min||NaN),STRUCTURE[key].type)}</td><td>${formatValue((STRUCTURE[key].stats.max||NaN),STRUCTURE[key].type)}</td></tr>`;
        }
    }


  document.getElementById("dataInfoTable").innerHTML="";
  var temp="<tr><th>Index</th>";
  for(var key in STRUCTURE){
      if(STRUCTURE[key].usage!="delete"){
        temp+=`<th>${key}<br><span style="cursor:pointer;" class="material-icons" onclick="sortData('${key}')">keyboard_arrow_up</span><span class="material-icons"  style="cursor:pointer;" onclick="sortData('${key}',-1)">keyboard_arrow_down</span></th>`;
      }
  }
  temp+="</tr>";
  document.getElementById("dataInfoTable").innerHTML+=temp;
  for(var i=0;i<Math.min(DATA.length,1000);i++){
    var temp=`<tr><td>${i}</td>`;
    for(var key in STRUCTURE){
        if(STRUCTURE[key].usage!="delete"){
          temp+=`<td>${DATA[i][key]}</td>`;
        }
    }
    temp+="</tr>";
    document.getElementById("dataInfoTable").innerHTML+=temp;
  }
}


function sortData(prop,direction){
  if(direction==null){
    direction=1;
  }
  DATA.sort(function(a,b){
    var difference=a[prop]-b[prop];
    if(Number(a[prop])){
      return difference*direction;
    }else{
      return direction*(a[prop]).localeCompare(b[prop]);
    }
  })

  renderExamine();
}