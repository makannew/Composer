import CompositeObject from "./composer.js"
const twoNumbersSum = function({number1 , number2}){
  //console.log("twoNumberSum is called")
  return number1 + number2;
  }
  
const logResult = function({twoNumbersSum}){
  console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
  //console.log("logResult is called")
  // if (isValidCall()){
  //   console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
  // }else{
  //   console.log("not valid call");
  //   return undefined;
  // }
  return true;
  }
 
var myComp = CompositeObject();
myComp.addFunction(twoNumbersSum);
myComp.addFunction(logResult);

myComp.set({number1: 30 , number2: 60}) // log on console prevented because in next line new update triggered
myComp.number1 = 40; // output: 100

const myCompFactory = function(){
  let myComp = CompositeObject();
  myComp.addFunction(twoNumbersSum);
  myComp.addFunction(logResult);
  return myComp;
}

const logChildComp = function({childComps}){
  //console.log("logChildComp is called")
    for(let item in childComps){
      if (childComps[item]["logResult"]){
        console.log(item , "values is equal to:" ,childComps[item]["number1"] , childComps[item]["number2"])
        // if (isValidCall){
        //   console.log(item , "values is equal to:" ,childComps[item]["number1"] , childComps[item]["number2"])
        // }else{
        //   console.log("not valid call");
        //   return undefined;
        // }
      }
    }
    return true;
}

const logComp2Sum = function(){
    console.log("this function triggred" , number1);
     //childComps.myComp3.number1=33;
    // globalComposite.childComps.myComp3.number2=66

  return true
}

var parentComp = CompositeObject();
parentComp.addFunction(logChildComp);
parentComp.childComps = {};
console.log(parentComp)

parentComp.childComps.myComp1 = myCompFactory();
parentComp.childComps.myComp2 = myCompFactory();
parentComp.childComps.myComp3 = myCompFactory();
parentComp.addFunction(logComp2Sum , parentComp.childComps.myComp1.number1);

parentComp.childComps.myComp1.number1 =3;
parentComp.childComps.myComp1.number2 =7;
parentComp.childComps.myComp2.set({number1:20 , number2:30});

//parentComp.childComps.myComp2.number2=30;


