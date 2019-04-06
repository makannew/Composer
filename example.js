import CompositeObject from "./composer.js"
const twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
  
  const logResult = function({twoNumbersSum}){
    if (arguments[1](arguments[2])){
      console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
    }
    return true;
   }
 
const myComp = CompositeObject();
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
  for(let item in childComps){
    if (childComps[item]["logResult"]){
      console.log(item , "values:" ,childComps[item]["number1"] , childComps[item]["number2"])
    }
  }
}

const parentComp = CompositeObject();
parentComp.addFunction(logChildComp);
parentComp.childComps = {};

parentComp.childComps.myComp1 = myCompFactory();
parentComp.childComps.myComp2 = myCompFactory();
parentComp.childComps.myComp3 = myCompFactory();
parentComp.childComps.myComp1.number1 =3;
parentComp.childComps.myComp1.number2 =7;

