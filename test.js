// defining a composit that contains an array of number as inputArray
// and determine minNumber, maxNumber and amplitude of this array
// then log the result on console
// but deliberately functions return results with delay to simulate asynchronous situation

let maxNumber = function(para){
  // define function arguments
  if (para === undefined){
    return ["inputArray"];
  }
  let {inputArray} = para;
  // 
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve( Math.max(...inputArray))
    }, Math.random() * 2000)
  });


}

let minNumber = function(para){
  // define function arguments
  if (para === undefined){
    return ["inputArray"];
  }
  let {inputArray} = para;
  //
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve( Math.min(...inputArray))
    }, Math.random() * 2000)
  });
  return Math.min(...inputArray);
}

let amplitude = function(para){
  // define function arguments
  if (para === undefined){
    return ["maxNumber" , "minNumber"];
  }
  let {maxNumber , minNumber} = para;
  return (maxNumber - minNumber)/2;
}

let logResult = function(para){
  // define function arguments
  if (para === undefined){
    return ["amplitude" , "inputArray"];
  }
  let {amplitude , inputArray} = para;
  //
  console.log("input Array: " + inputArray);
  console.log("Amplitude: " + amplitude);
  
}
let obj1Factory = function(){
  // it will return instance of this composit
  let obj = methodsComposite();
  obj.addMethod(maxNumber);
  obj.addMethod(minNumber);
  obj.addMethod(amplitude);
  obj.addMethod(logResult);
return obj;
}
let obj1 = obj1Factory();
// trying to deliberately overwrite composit properties 
// the live composit asynchronously take care of changes
// and it will be updated with the latest properties
// if methods have side effect it is developer responsibility 
// to how manipulate the composit.
obj1.inputArray = [1,  8 , 10];
obj1.inputArray[0] = 2 ;
obj1.inputArray[0] = 3 ;
obj1.inputArray[0] = 4 ;
obj1.inputArray[0] = 5 ;
obj1.inputArray[0] = 6 ;
obj1.inputArray[2] = 20;


console.log("It will continue..");

