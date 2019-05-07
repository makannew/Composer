import CompositeObject from "./composer.js"

const twoNumbersSum = function({number1 , number2 }){
  return number1 + number2;
  }
  
const logResult = function({twoNumbersSum}){
  console.log(number1 , number2 , twoNumbersSum);
  return true;
  }

  const externalSumResult = function({ownProp}){
    console.log("externalLink before altering:" ,externalLink);
    externalLink =625;
    console.log("externalLink after altering:" ,externalLink);

    // console.log("External sum result is:", folder1.twoNumbersSum)
    // console.log("very external:" , e1.e2.e3.num)
    // folder2.number1= 50;
    // folder2.number2 = 60;
    // console.log("folder1.number2 = ",folder1.number2);
    // folder2.number1 = folder2.number2 +1;
    // console.log("folder2.number1 = ",folder2.number1);

  }

  const externalSumResult2 = function({f1}){
    //console.log("External sum result 2 is:", f1.twoNumbersSum ,f2)
    f2=f2+5;
    console.log("f1 is:",f1);
    console.log("f2 is ",f2);
  }

 
var myComp = CompositeObject();
console.log(myComp)
myComp.folder1={}
myComp.folder1.addFunction(twoNumbersSum);
myComp.folder1.addFunction(logResult);

myComp.f1={}
myComp.f1.addFunction(twoNumbersSum);
myComp.f1.addFunction(logResult);
myComp.addLink(myComp.f1.number1 , myComp.folder1.number1);
myComp.addLink(myComp.folder1.number2 , myComp.f1.number2);
myComp.f1.number1 =100;
myComp.folder1.number2 =200;
myComp.ex1 = {};
myComp.ex1.addFunction(externalSumResult);
myComp.ex1.externalLink = undefined;

myComp.addLink(myComp.ex1.externalLink , myComp.f1.number1)
myComp.ex1.externalLink = 225;
myComp.ex1.ownProp =true;
// myComp.e1={}
// myComp.e1.e2={};
// myComp.e1.e2.e3 ={};
// myComp.e1.e2.e3.num = 34;
// myComp.folder2 ={};
// myComp.folder2.addFunction(twoNumbersSum);
// myComp.folder2.addFunction(logResult);
// myComp.addFunction(externalSumResult);
// myComp.externalLink1 =25;
// myComp.addLink(myComp.externalLink1 , myComp.e1.e2.e3.num , myComp.folder2.logResult);

// let childComp = CompositeObject();
// childComp.f1 = {}
// childComp.f2 =2;
// childComp.f1.addFunction(twoNumbersSum);
// childComp.addFunction(externalSumResult2)
// myComp.folder3 = childComp;

// myComp.folder1.number1 =56;
// myComp.folder1.number2 =99;
// myComp.e1.e2.e3.num = 33;

//  myComp.folder3.f1.number1=1000;
//  myComp.folder3.f1.number2 =500;


//myComp.addFunction(someSumUpdate);
// myComp.mainProp = 88;
// myComp.ex1 ={};
// myComp.ex1.ex2={};
// myComp.ex1.ex2.number4 =15;
// myComp.ex1.ex2.folder={}
// myComp.ex1.ex2.folder.number7 =777;
// myComp.ex1.ex2.addFunction(checkExternals , myComp.sumSumFolder.t1.t2.number2);
// myComp.ex1.ex2.localProp =66;

// myComp.addFunction(someSumUpdate , myComp.sumSumFolder.t1.t2.twoNumbersSum );
// myComp.sumSumFolder.addFunction(twoNumbersSum);
// myComp.sumSumFolder.addFunction(logResult);
// myComp.sumSumFolder.number1 =9;
// myComp.sumSumFolder.number2 =11;
// myComp.sumSumFolder.t1={};
// myComp.sumSumFolder.t1.t2={};
// myComp.sumSumFolder.t1.t2.addFunction(twoNumbersSum)
// myComp.sumSumFolder.t1.t2.number1=79;
// myComp.sumSumFolder.t1.t2.number2=21;

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


