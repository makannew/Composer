import CompositeObject from "./composer.js"
// Part A: adding two numbers while they are defined
// then logging the result
function twoNumbersSum({number1 , number2 }){
  return number1 + number2;
  }
  
function logResult({twoNumbersSum}){
  console.log(`result ${twoNumbersSum}`);
  return true;
  }

  let myComp = CompositeObject();
  myComp.addFunction(twoNumbersSum);
  myComp.addFunction(logResult);
  myComp.number1= 10;
  myComp.number2 =7;
// result: 17

// Part B: linking a new nested property to number1 in part A
myComp.object1={};
myComp.object1.num =13;
myComp.addLink (myComp.object1.num , myComp.number1);
// result: 20

// Part C: logging twice of num on console by adding new function num was 13
// but because num linked with number1 and number1 will change to 55 in part D then num will be 55
function logTwice({num}){
  let twice = num *2;
  console.log(`twice of ${num} is ${twice}`);
}
myComp.object1.addFunction(logTwice);
// result: twice of 55 is 110

// Part D: setting new numbers at one line
myComp.set({number1:55 , number2:45});
// result: 100

// Part E: now we define new composite as parentComp and attach myComp to it
// then test it by changing num to 66
let parentComp = CompositeObject();
parentComp.childComp = myComp;
parentComp.childComp.object1.num=66;
// result: twice of 66 is 132
//         result 111

// Part F: by adding a new independent function we can test parentComp
// also inside that function we have access to all properties at the same level with the running function
// by linking these properties to external properties we can access to all composite properties
function logMessage({message}){
  console.log("message is:" , message , "ExternalLink is:" , externalLink);
  externalLink =childComp.object1.num + 4;
}
parentComp.addFunction(logMessage);
parentComp.addLink(parentComp.childComp.number2 , parentComp.externalLink);
parentComp.message ="Hello, this is parentComp!"
// result: result 111 (because addLink triggred an extera update call)
//         result 136 (because externalLink changes inside logMessage function)



