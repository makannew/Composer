
export function addNumbers(passedComp){
  passedComp.addFunction(twoNumbersSum);
  passedComp.addFunction(logResult);
}

// adding two numbers whene they defined
function twoNumbersSum({number1 , number2 }){
  return number1 + number2;
  }

// logging the result
function logResult({twoNumbersSum}){
  console.log(`Adding result= ${twoNumbersSum}`);
  return true;
  }