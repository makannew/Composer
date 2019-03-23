
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
  if (arguments[1] == arguments[0]["totalAsyncCalls"]){
    console.log("last modifyed input Array: " + inputArray);
    console.log("last Amplitude: " + amplitude);
  }else{
    console.log("this is " +arguments[1]  + " call from total " + arguments[0]["totalAsyncCalls"] + " calls so it terminated.");
  }
  return true;
}

// making composit
let amplitudeCalculator = function(){
  let obj = CompositeObject();
  obj.addFunction(maxNumber);
  obj.addFunction(minNumber);
  obj.addFunction(amplitude);
  obj.addFunction(logResult);
  return obj;
}
let obj1 = amplitudeCalculator();
// trying to deliberately overwrite composit properties 
// the live composit asynchronously take care of changes
// and it will be updated with the latest properties
// if functions have side effect it is developer responsibility 
// to check (arguments[1] == arguments[0]["totalAsyncCalls"]) to avoid 
// or manipulate side effects.
obj1.inputArray = [1,  8 , 10];
obj1.inputArray[0] = 2 ;
obj1.inputArray[0] = 3 ;
obj1.inputArray[0] = 4 ;
obj1.inputArray[0] = 5 ;
obj1.inputArray[0] = 6 ;
obj1.inputArray[2] = 20;

console.log("It will continue..");