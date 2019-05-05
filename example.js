import CompositeObject from "./composer.js"

const twoNumbersSum = function({number1 , number2 }){
  return number1 + number2;
  }
  
const logResult = function({twoNumbersSum}){
  console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
  return true;
  }

const someSumUpdate = function({sumSumFolder}){
  // if (Object.keys(sumSumFolder).length>0){
  //   console.log(`someSumFolder has ${Object.keys(sumSumFolder).length} members`);
  // }

  console.log(`twoNumberSum is ${arguments[1].sumSumFolder.t1.t2.twoNumbersSum}`);
  return true;
}

const checkExternals = function({localProp , externalProp}){
  return localProp + externalProp;
}
 
var myComp = CompositeObject();
//myComp.addFunction(someSumUpdate);
myComp.ex1 ={};
myComp.ex1.ex2={};
myComp.ex1.ex2.addFunction(checkExternals);
myComp.ex1.ex2.externalProp = myComp.sumSumFolder.t1.t2.twoNumbersSum;

myComp.addFunction(someSumUpdate , myComp.sumSumFolder.t1.t2.twoNumbersSum );

myComp.sumSumFolder.addFunction(twoNumbersSum);
myComp.sumSumFolder.addFunction(logResult);
myComp.sumSumFolder.number1 =9;
myComp.sumSumFolder.number2 =11;
myComp.sumSumFolder.t1={};
myComp.sumSumFolder.t1.t2={};
myComp.sumSumFolder.t1.t2.addFunction(twoNumbersSum)
myComp.sumSumFolder.t1.t2.number1=79;
myComp.sumSumFolder.t1.t2.number2=21;

console.log(myComp)
// myComp.addFunction(twoNumbersSum);
// myComp.addFunction(logResult);


//myComp.set({number1: 30 , number2: 60}) // log on console prevented because in next line new update triggered
//myComp.number1 = 40; // output: 100

// const myCompFactory = function(){
//   let myComp = CompositeObject();
//   myComp.addFunction(twoNumbersSum);
//   myComp.addFunction(logResult);
//   return myComp;
// }

// const logChildComp = function({childComps}){
//   //console.log("logChildComp is called")
//     for(let item in childComps){
//       if (childComps[item]["logResult"]){
//         console.log(item , "values is equal to:" ,childComps[item]["number1"] , childComps[item]["number2"])
//         // if (isValidCall){
//         //   console.log(item , "values is equal to:" ,childComps[item]["number1"] , childComps[item]["number2"])
//         // }else{
//         //   console.log("not valid call");
//         //   return undefined;
//         // }
//       }
//     }
//     return true;
// }

// const logComp2Sum = function(){
//     console.log("this function triggred" , number1);
//      //childComps.myComp3.number1=33;
//     // globalComposite.childComps.myComp3.number2=66

//   return true
// }

// var parentComp = CompositeObject();
// parentComp.addFunction(logChildComp);
// parentComp.childComps = {};
// console.log(parentComp)

// parentComp.childComps.myComp1 = myCompFactory();
// parentComp.childComps.myComp2 = myCompFactory();
// parentComp.childComps.myComp3 = myCompFactory();
// parentComp.addFunction(logComp2Sum , parentComp.childComps.myComp1.number1);

// parentComp.childComps.myComp1.number1 =3;
// parentComp.childComps.myComp1.number2 =7;
// parentComp.childComps.myComp2.set({number1:20 , number2:30});

// //parentComp.childComps.myComp2.number2=30;


