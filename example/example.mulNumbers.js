
export function mulNumbers(passedComp){
  passedComp.addFunction(twoNumbersMul);
  passedComp.addFunction(logMulResult);
}

function twoNumbersMul({number1 , number2}){
  return number1*number2;
}

function logMulResult({twoNumbersMul}){
  console.log(`Mul result = ${twoNumbersMul}`);
}