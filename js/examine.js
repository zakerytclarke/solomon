function renderExamine(){
  document.getElementById("statsInfoTable").innerHTML=`
    <tr>
      <th>Feature</th>
      <th>Mean</th>
      <th>Median</th>
      <th>Mode</th>
      <th>Minimum</th>
      <th>Maximum</th>
      <th>Standard Deviation</th>
    </tr>`;

    for(var key in STRUCTURE){
        if(STRUCTURE[key].usage!="delete"){
          document.getElementById("statsInfoTable").innerHTML+=`<tr><td>${key}</td><td>${formatValue((STRUCTURE[key].stats.mean||NaN),STRUCTURE[key].type)}</td><td>${formatValue((STRUCTURE[key].stats.median||NaN),STRUCTURE[key].type)}</td><td>${STRUCTURE[key].stats.mode}</td><td>${formatValue((STRUCTURE[key].stats.min||NaN),STRUCTURE[key].type)}</td><td>${formatValue((STRUCTURE[key].stats.max||NaN),STRUCTURE[key].type)}</td><td>${formatValue((STRUCTURE[key].stats.standardDeviation||NaN),STRUCTURE[key].type)}</td></tr>`;
        }
    }

    //Correlation
    document.getElementById("correlationTable").innerHTML=``;
    var temp="<tr><th></th>";
    for(var key in STRUCTURE){
      if(STRUCTURE[key].usage=="output"){
        temp+=`<th>${key}</th>`;
      }
    }
    document.getElementById("correlationTable").innerHTML+=temp;
    for(var key in STRUCTURE){
      if(STRUCTURE[key].usage=="input"){
        temp=`<tr><th>${key}</th>`;

        for(var k2 in STRUCTURE){
          var minColor=[255,101,18];
          var maxColor=[0, 154, 237];

          var color=[0,0,0];
          color=color.map(function(x,i){
            return minColor[i]+((maxColor[i]-minColor[i])*Math.min(1,STRUCTURE[key].stats.correlation[k2]));
          })
          console.log(color,STRUCTURE[key].stats.correlation[k2]);

          if(STRUCTURE[k2].usage=="output"){
            temp+=`<td style="background-color:rgb(${color[0]},${color[1]},${color[2]})">${Math.min(100,100*STRUCTURE[key].stats.correlation[k2].toFixed(2))+"%"}</td>`;
          }
        }
        temp+="</tr>";
        document.getElementById("correlationTable").innerHTML+=temp;
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
