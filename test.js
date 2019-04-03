
import composer from "./composer.js"

// return Maximum number from input array but with a random delay
let maxNumber = function({inputArray}){
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve( Math.max(...inputArray))
    }, Math.random() * 2000)
  });
}

// return Minimum number from array but with a random delay
let minNumber = function({inputArray}){
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve( Math.min(...inputArray))
    }, Math.random() * 2000)
  });
}

// calculate amplitude whene maxNumber and minNumber available
let amplitude = function({maxNumber , minNumber}){
  return (maxNumber - minNumber)/2;
}

// log result whene amplitude available
let logResult = function({amplitude , inputArray }){
  // (arguments[1] == arguments[0]["totalAsyncCalls"]) will be true if this call
  // was the last async call of its kind
  // It provides control measure for developer to avoid repeating side effects.
  // Also, it can be useful to terminate outdated functions by forcing them to resolve
  if (arguments[1] == arguments[0]["validAsyncCall"]){
    console.log("last modifyed input Array: " + inputArray);
    console.log("last Amplitude: " + amplitude);
  }else{
    console.log("this calls terminated.");
  }
  return true;
}

// making composit
let amplitudeCalculator = function(){
  let result = composer();
  result.addFunction(maxNumber);
  result.addFunction(minNumber);
  result.addFunction(amplitude);
  result.addFunction(logResult);
  return result;
}

let obj1 = amplitudeCalculator();
// trying to deliberately overwrite composit properties 
// the live composit asynchronously take care of changes
// and it will be updated with the latest properties
// if functions have side effect it is developer responsibility 
// to check (arguments[1] == arguments[0]["validAsyncCall"]) to avoid 
// or manipulate side effects.
obj1.inputArray = [1,  8 , 10];
obj1.inputArray[0] = 2 ;
obj1.inputArray[0] = 3 ;
obj1.inputArray[0] = 4 ;
obj1.inputArray[0] = 5 ;
obj1.inputArray[0] = 6 ;
obj1.inputArray[2] = 20;
 
// make composit to keep other composits as a property
let meanAmplitude = function({amplitudes}){
  let result = 0;
  let total = 0;
  for (let item in amplitudes){
    if (amplitudes[item]["amplitude"]){
      result =+ amplitudes[item]["amplitude"];
      ++ total
    }
  }
  if (total>0){
    result /= total;
    console.log("mean Amp = " , result);
  } else{
    result =undefined;
  }
  return result;
}

let meanAplitudesCalculator = function(){
  let result = composer();
  result.addFunction(meanAmplitude);
  result.amplitudes = {}; // make a containder for amplitudeCalculator composits
  
  return result;
}


let parentObj = meanAplitudesCalculator();
parentObj.amplitudes.firstObj = obj1; // add a composite
parentObj.amplitudes.secondObj = amplitudeCalculator();
parentObj.amplitudes.thirdObj = amplitudeCalculator();

parentObj.amplitudes.secondObj.inputArray = [32,45,43];
parentObj.amplitudes.thirdObj.inputArray = [65,7,2]; // give to child composite some value to trigger

//
let twiceMean = function({meanComposite}){
  if (meanComposite.meanAmplitude){
    console.log("twice of mean Amp:" , meanComposite.meanAmplitude * 2);
    return meanComposite.meanAmplitude * 2;
  }else
  return undefined;

}
let ancestor = function(){
  let result = composer()
  result.addFunction(twiceMean)
  return result;
}

let ancestor1 = ancestor();

ancestor1.meanComposite = parentObj;





console.log("It will continue..");