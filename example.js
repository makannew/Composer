import CompositeObject from "./composer.js"

const twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
  
const logResult = function({twoNumbersSum}){
  if (isValidCall()){
    console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
  }else{
    console.log("not valid call");
    return undefined;
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
        if (isValidCall){
          console.log(item , "values is equal to:" ,childComps[item]["number1"] , childComps[item]["number2"])
        }else{
          console.log("not valid call");
          return undefined;
        }
      }
    }
    return true;
}

const logComp2Sum = function(){
  if (isValidCall){
    console.log("this function triggred" , number1);
    globalComposite.childComps.myComp3.number1=33;
    globalComposite.childComps.myComp3.number2=66

  }else{
    console.log("not valid call");
    return undefined;
  }
  return true
}

const parentComp = CompositeObject();
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


