//Shared Functions Definitions etc
var TRAINING_DATA=[];
var TESTING_DATA=[];


function initModels(){
  //Generate testing and training dataset
  var trainingRatio=0.7;
  var nData=shuffle(DATA.slice());//copy data
  for(var i=0;i<nData.length;i++){
    if((trainingRatio*nData.length)<i){
      TRAINING_DATA.push(nData[i]);
    }else{
      TESTING_DATA.push(nData[i]);
    }
  }
}

function testModel(model,testData){
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

      var ans=model(inp);
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
    if(STRUCTURE[key].type!="categorical"){//Numeric
      RESULTS[key].averageError=RESULTS[key].errors.reduce((a, b) => a + b, 0)/RESULTS[key].errors.length;
      RESULTS[key].percentError=RESULTS[key].percentErrors.reduce((a, b) => a + b, 0)/RESULTS[key].percentErrors.length;
    }else{
      RESULTS[key].accuracy=(RESULTS[key].correct/RESULTS[key].total);
    }
  }

  return RESULTS;
}



function trainBasic(){
  trainNearestNeighbor(TRAINING_DATA);
  MODELS.error.NearestNeighbor=testModel(MODELS.query.NearestNeighbor,TESTING_DATA);
}


function trainNearestNeighbor(d1){
  var data=d1.slice();
  MODELS.query.NearestNeighbor=function(input){
    var minDistance=Infinity;
    var ptr;
    for(var i=0;i<data.length;i++){
      var e=error(data[i],input);
      if(e<minDistance){
        minDistance=e;
        ptr=data[i];
      }
    }
    var out={};
    for(var key in ptr){
      if(STRUCTURE[key].usage=="output"){
        out[key]=ptr[key];
      }
    }
    return out;

    function error(input,test){
      var total=0;
      for(var key in test){
        if(STRUCTURE[key].type!="categorical"){//Numeric Error
          total+=Math.abs(input[key]-test[key]);
        }else{

        }
      }
      return total;
    }
  }
}

function trainLinearRegression(){
  var model={};
  for(var i=0;i<DATA.length;i++){

  }
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
