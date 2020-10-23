var SCHEMA={input:new Set(),output:new Set()};
var NN_CONFIG={};
var net;
var FF={train:true};


function trainNN(){

  document.getElementById("nn-notice-training").style.display="block";

  var inputs=[];
  var outputs=[];
  for(var key in STRUCTURE){
    STRUCTURE[key].name=key;
    if(STRUCTURE[key].usage=="input"){
      inputs.push(STRUCTURE[key]);
    }
    if(STRUCTURE[key].usage=="output"){
      outputs.push(STRUCTURE[key]);
    }
  }

  //
  // const config = {
  //   //binaryThresh: 0.5,
  //   hiddenLayers: [30,30,30,30], // array of ints for the sizes of the hidden layers in the network
  //   //activation: 'leaky-relu', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
  //   //leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
  // };

  var hiddenLayers=document.getElementById("nn-hiddenLayers").value;
  if(hiddenLayers&&hiddenLayers!=""){
    NN_CONFIG.hiddenLayers=hiddenLayers.split(",");
  }

  // create a simple feed forward neural network with backpropagation
  net = new brain.NeuralNetwork(NN_CONFIG);

  var trainingData=[];
  var testingData=[];

  //Generate testing and training dataset
  var trainingRatio=0.7;
  var nData=shuffle(DATA.slice());//copy data
  for(var i=0;i<nData.length;i++){
    if((trainingRatio*nData.length)<i){
      trainingData.push(nData[i]);
    }else{
      testingData.push(nData[i]);
    }
  }

  var trainingData=trainingData.map(x=>encodeData(x));

  console.log(trainingData.length);
  console.log(testingData.length);


  SCHEMA.input=Array.from(SCHEMA.input);
  SCHEMA.output=Array.from(SCHEMA.output);
  console.log(SCHEMA)
  net.train(trainingData);
  FF.train=false;
  testNetwork(testingData);

  document.getElementById("nn-notice-training").style.display="none";
}

function runQueryOnNetwork(input){
  return decodeData(net.run(encodeData(input).input));
}


function testNetwork(testData){
  var RESULTS={};

  //Setup testing metrics
  for(var key in STRUCTURE){
    if(STRUCTURE[key].usage=="output"){
      RESULTS[key]={
        correct:0,
        total:0,
        errors:[],
        percentErrors:[]
      }
    }
  }

  for(var i=0;i<testData.length;i++){
    var inp={};
    var out={};
    for(var key in testData[i]){
      //Input and output poirs
      if(STRUCTURE[key].usage=="input"){
        inp[key]=testData[i][key];
      }else
      if(STRUCTURE[key].usage=="output"){
        out[key]=testData[i][key];
      }

      var ans=runQueryOnNetwork(inp);
      for(var prop in out){
        var type=STRUCTURE[prop].type;
        if(type=="categorical"){
          RESULTS[prop].total++;
          if(out[prop]==ans[prop]){
            RESULTS[prop].correct++;
          }else{
            RESULTS[prop].errors.push(1);
          }
        }else{//Numeric
          RESULTS[prop].total++;
          if(out[prop]==ans[prop]){
            RESULTS[prop].correct++;
            RESULTS[prop].errors.push(0);
          }else{
            if(out[prop]!=null&&ans[prop]!=null){
              var resres=Math.abs(out[prop]-ans[prop]);
              if(!isNaN(resres)){
                RESULTS[prop].errors.push(resres);
                RESULTS[prop].percentErrors.push(Math.abs(ans[prop]-out[prop])/out[prop]);
              }
            }else{//error
            }
          }

        }
      }


    }

  }

  //Calculate Errors
  for(var key in RESULTS){
    RESULTS[key].accuracy=(RESULTS[key].correct/RESULTS[key].total);
    if(STRUCTURE[key].type!="categorical"){//Numeric
      RESULTS[key].averageError=RESULTS[key].errors.reduce((a, b) => a + b, 0)/RESULTS[key].errors.length;
      RESULTS[key].percentError=RESULTS[key].percentErrors.reduce((a, b) => a + b, 0)/RESULTS[key].percentErrors.length;

    }
  }

  //Display Results
  document.getElementById("nn-stats").innerHTML="";
  for(var key in RESULTS){
    var tData=RESULTS[key].averageError||"";
    if(tData!=""){
      tData=tData.toFixed(2);
    }
    var tData2=RESULTS[key].percentError||"";
    if(tData2!=""){
      tData2=(tData2*100).toFixed(2);
    }
    document.getElementById("nn-stats").innerHTML+=(`${key}:  ${(RESULTS[key].accuracy*100).toFixed(2)}%  Average Error: ${tData} Percent Error: ${tData2}%<br>`);
  }
  console.log(RESULTS);
  document.getElementById("nn-hiddenLayers").value=net.hiddenLayers+"";
  return RESULTS;
}

function encodeData(data){
  var input=[];
  var output=[];

  for(var key in data){
    var enc=singleEncode(data[key],STRUCTURE[key].type);
    if(STRUCTURE[key].usage=="input"){
      input=input.concat(enc);
      if(FF.train){
        SCHEMA.input.add(key);
      }
    }else{
      output=output.concat(enc);
      if(FF.train){
        SCHEMA.output.add(key);
      }
    }
  }


  return {input:input,output:output};


  function singleEncode(d,type){
    var out=[];
    switch(type){
      case "numeric":
      case "percentage":
      case "currency":
      out.push(d/STRUCTURE[key].stats.max);
      break;
      case "categorical":
      for(var i=0;i<STRUCTURE[key].categories.length;i++){//One hot encoding
        if(d==STRUCTURE[key].categories[i]){
          out.push(1);
        }else{
          out.push(0);
        }
      }
      break;
    }
    return out;
  }
}


function decodeData(data){
  var output={};

  for(var i=0;i<SCHEMA.output.length;i++){
    var current=SCHEMA.output[i];
    var type=STRUCTURE[current].type;
    if(type=="categorical"){//Reverse one hot encoding
      for(var j=0;j<STRUCTURE[current].categories.length;j++){
        var ans=Math.round(data.shift());//0 or 1
        if(ans==1){
          output[current]=STRUCTURE[current].categories[j];
        }
      }
    }else{
      var ans=data.shift();
      output[current]=ans*STRUCTURE[current].stats.max;
    }


  }
  return output;
}


function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
