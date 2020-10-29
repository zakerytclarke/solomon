var MAPPED_DATA={};
var Charts=new Graph();
function renderCharts(){
  for(var key in DATA[0]){
    MAPPED_DATA[key]=DATA.map(function(x){
      return {
        name:key,
        value:x[key]
      }
    })
  }
  console.log(MAPPED_DATA)
  Charts.clear();
  for(var key in STRUCTURE){//Inputs
    for(var key2 in STRUCTURE){//Outputs
      if(STRUCTURE[key].usage=="input"){
        if(STRUCTURE[key2].usage=="output"){
          //Plot data
          if(STRUCTURE[key].type!="categorical"&&STRUCTURE[key2].type!="categorical"){
            Charts.scatterPlot(key+" vs "+key2,MAPPED_DATA[key],MAPPED_DATA[key2]);
          }

        }
      }
    }
  }

  //Graph.barChart(,{});
  // Graph.horizontalBarChart("Conditions",renderMeds(data.statsMap,"unique_key"),"unique_key");
  //
  //
  //
  // Graph.pieChart("Gender",convertData(data.genderMap,"gender"),"gender");
  // Graph.barChart("Ages",convertData(data.ageGroupMap,"age_group"),"age_group");
}


function Graph(){
	this.clear=function(){
		document.getElementById("charts").innerHTML="";
	}
  this.scatterPlot=function(title,xData,yData,size){
    var sizeStyle="width:50vw;";
    if(size!=null){
      sizeStyle=`width:${size}vw;display:inline-block;`;
    }

    var canvas = document.createElement('canvas');
    canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;background-color:#eee;";
    var holder = document.createElement('div');
    holder.style=sizeStyle;
    holder.class="chartBox";

    holder.appendChild(canvas);
    document.getElementById("charts").appendChild(holder);

    var borderColors=['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'];
    var bgColors=['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)','rgba(75, 192, 192, 0.2)','rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'];



    var data=[];
    for(var i=0;i<xData.length;i++){
      data.push({x:xData[i].value,y:yData[i].value});
    }
    console.log(data);
    //Display Click Rates
    var ctx = canvas;
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        title:title,
        data: {
            datasets: [{
                label: 'Scatter Dataset',
                backgroundColor: bgColors[1],
                borderColor: borderColors[1],
                data: data
            }]
        },
        options: {
          responsive:true,
          title:{
            display:true,
            fontSize:40,
            text:title
          },
          legend:{
            display:false
          },
          tooltips: {
            titleFontSize: 20,
            bodyFontSize: 20
          },
          scales: {
            yAxes: [{
              ticks: {
                labelString: yData[0].name,
                fontSize:20
              },
              scaleLabel: {
                display: true,
                labelString: xData[0].name,
                fontSize:20
              }
            }],
            xAxes: [{
              ticks: {
                fontSize:25
              }
            }]
          }
        },


    });
  }

	this.barChart=function(title,data,tag,typeChart,size){
		if(typeChart==null){
			typeChart="bar";
		}

    var sizeStyle="width:50vw;";
    if(size!=null){
      sizeStyle=`width:${size}vw;display:inline-block;`;
    }

		var canvas = document.createElement('canvas');
		canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
		var holder = document.createElement('div');
		holder.style=sizeStyle;
		holder.class="chartBox";

		holder.appendChild(canvas);
		document.getElementById("charts").appendChild(holder);
		var borderColors=['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'];
		var bgColors=['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)','rgba(75, 192, 192, 0.2)','rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'];

		while(data.length>borderColors.length){
			borderColors=borderColors.concat(borderColors);
			bgColors=bgColors.concat(bgColors);
		}


		//Display Click Rates
		var ctx = canvas;
		var barChart = new Chart(ctx, {
			type: typeChart,
			data: {
				labels: data.map(x=>x.name),
				datasets: [{
					data:  data.map(x=>x.value.toFixed(2)),
					backgroundColor: bgColors,
					borderColor: borderColors,
					borderWidth: 1
				}]
			},
			options: {
				responsive:true,
				title:{
					display:true,
					fontSize:40,
					text:title
				},
				legend:{
					display:false
				},
				tooltips: {
					titleFontSize: 20,
					bodyFontSize: 20
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							fontSize:25
						},
						scaleLabel: {
							display: true,
							labelString: 'Number of People',
							fontSize:20
						}
					}],
					xAxes: [{
						ticks: {
							fontSize:25
						}
					}]
				}
			}
		});
		canvas.onclick = function(evt){
			var activePoints = barChart.getElementsAtEvent(evt);
			var label=activePoints[0]._model.label;
			updateTags(tag,label);
		};


	}

	this.horizontalBarChart=function(title,data,tag,typeChart){
		if(typeChart==null){
			typeChart="horizontalBar";
		}

		var canvas = document.createElement('canvas');
		canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
		var holder = document.createElement('div');
		holder.style="width:50vw;";
		holder.class="chartBox";

		holder.appendChild(canvas);
		document.getElementById("charts").appendChild(holder);
		var borderColors=['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'];
		var bgColors=['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)','rgba(75, 192, 192, 0.2)','rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'];

		while(data.length>borderColors.length){
			borderColors=borderColors.concat(borderColors);
			bgColors=bgColors.concat(bgColors);
		}


		//Display Click Rates
		var ctx = canvas;
		var barChart = new Chart(ctx, {
			type: typeChart,
			data: {
				labels: data.map(x=>x.name),
				datasets: [{
					data:  data.map(x=>x.value.toFixed(2)),
					backgroundColor: bgColors,
					borderColor: borderColors,
					borderWidth: 1
				}]
			},
			options: {
				responsive:true,
				title:{
					display:true,
					fontSize:40,
					text:title
				},
				legend:{
					display:false
				},
				tooltips: {
					titleFontSize: 20,
					bodyFontSize: 20
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							fontSize:25
						}
					}],
					xAxes: [{
						ticks: {
							fontSize:25
						},
						scaleLabel: {
							display: true,
							labelString: 'Number of People',
							fontSize:20
						}
					}]
				}
			}
		});
		canvas.onclick = function(evt){
			var activePoints = barChart.getElementsAtEvent(evt);
			var label=activePoints[0]._model.label;
			updateTags(tag,label);
		};


	}
	this.lineChart=function(title,data,tag,size){
		var canvas = document.createElement('canvas');
		canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
		var holder = document.createElement('div');


    var sizeStyle="width:50vw;";
    if(size!=null){
      sizeStyle=`width:${size}vw;display:inline-block;`;
    }

    var canvas = document.createElement('canvas');
    canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
    var holder = document.createElement('div');
    holder.style=sizeStyle;
    holder.class="chartBox";

		holder.appendChild(canvas);
		document.getElementById("charts").appendChild(holder);
		var borderColors=['rgba(54, 162, 235, 1)'];
		var bgColors=['rgba(54, 162, 235, 0.2)'];

		while(data.length>borderColors.length){
			borderColors=borderColors.concat(borderColors);
			bgColors=bgColors.concat(bgColors);
		}

		//Display Click Rates
		var ctx = canvas;
		var adRateChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.map(x=>x.name),
				datasets: [{
					data:  data.map(x=>x.value.toFixed(2)),
					backgroundColor: bgColors,
					borderColor: borderColors,
					borderWidth: 1
				}]
			},
			options: {
				responsive:true,
				title:{
					display:true,
					fontSize:40,
					text:title
				},
				legend:{
					display:false
				},
				tooltips: {
					titleFontSize: 20,
					bodyFontSize: 20
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							fontSize:25
						},
						scaleLabel: {
							display: true,
							labelString: 'Number of People',
							fontSize:20
						}
					}],
					xAxes: [{
						ticks: {
							fontSize:25
						}
					}]
				}
			}
		});


	}

	this.multiLineChart=function(title,data,tag){
		var canvas = document.createElement('canvas');
		canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
		var holder = document.createElement('div');
		holder.style="width:50vw;";
		holder.class="chartBox";

		holder.appendChild(canvas);
		document.getElementById("charts").appendChild(holder);
		var borderColors=['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'];
		var bgColors=['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)','rgba(75, 192, 192, 0.2)','rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'];

		while(data.length>borderColors.length){
			borderColors=borderColors.concat(borderColors);
			bgColors=bgColors.concat(bgColors);
		}

		//Add colors
		for(var i=0;i<data.length;i++){
			data[i].backgroundColor=bgColors[i];
			data[i].borderColor=borderColors[i];
		}
		//Display Click Rates
		var ctx = canvas;
		var adRateChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.shift(),
				datasets: data
			},
			options: {
				responsive:true,
				title:{
					display:true,
					fontSize:40,
					text:title
				},
				legend:{
					display:true
				},
				tooltips: {
					titleFontSize: 20,
					bodyFontSize: 20
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							fontSize:25
						},
						scaleLabel: {
							display: true,
							labelString: 'Number of People',
							fontSize:20
						}
					}],
					xAxes: [{
						ticks: {
							fontSize:25
						}
					}]
				}
			}
		});


	}
	this.pieChart=function(title,data,tag,size){
		var canvas = document.createElement('canvas');
		canvas.style = "width:40vw; display: inline-block; vertical-align: middle; height: 27vw;";
		var holder = document.createElement('div');
    var sizeStyle="width:50vw;";
    if(size!=null){
      sizeStyle=`width:${size}vw;display:inline-block;`;
    }

    holder.style=sizeStyle;
    holder.class="chartBox";

		holder.appendChild(canvas);
		document.getElementById("charts").appendChild(holder);
		var borderColors=['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)'];
		var bgColors=['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)','rgba(255, 206, 86, 0.2)','rgba(75, 192, 192, 0.2)','rgba(153, 102, 255, 0.2)','rgba(255, 159, 64, 0.2)'];

		while(data.length>borderColors.length){
			borderColors=borderColors.concat(borderColors);
			bgColors=bgColors.concat(bgColors);
		}

		var myDoughnutChart = new Chart(canvas, {
			type: 'pie',
			data: {
				labels: data.map(x=>x.name),
				datasets: [{
					data: data.map(x=>x.value.toFixed(2)),
					backgroundColor: bgColors,
					borderColor: borderColors,
					borderWidth: 1
				}]
			},
			options: {
				title:{
					display:true,
					fontSize:40,
					text:title
				},
				legend:{
					labels: {
						fontSize:25
					}
				},
				tooltips: {
					titleFontSize: 30,
					bodyFontSize: 20,
					callbacks: {
						label: function(tooltipItem, data) {
							//get the concerned dataset
							var dataset = data.datasets[tooltipItem.datasetIndex];
							//calculate the total of this data set
							var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
								return Number(previousValue) + Number(currentValue);
							});
							//get the current items value
							var currentValue = dataset.data[tooltipItem.index];
							//calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
							var percentage = Math.floor(((currentValue/total) * 100)+0.5);

							return data.labels[tooltipItem.index] + ": "+Math.round(currentValue) + " (" + percentage + "%)";
						}
					}
				}

			}
		});
		canvas.onclick = function(evt){
			var activePoints = myDoughnutChart.getElementsAtEvent(evt);
			var label=activePoints[0]._model.label;
			updateTags(tag,label);
		};

	}

	this.table=function(title,data){

	}



	function aspectRatio(x,y,scale){
		return {w:window.innerWidth*scale,h:window.innerWidth*scale*(y/x)};
	}
}
