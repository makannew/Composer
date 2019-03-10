
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
    }, 5000)
  });


}

let minNumber = function(para){
  // define function arguments
  if (para === undefined){
    return ["inputArray"];
  }
  let {inputArray} = para;
  //
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
// make an object with methods composition
let obj1 = methodsComposite();
obj1.addMethod(maxNumber);
obj1.addMethod(minNumber);
obj1.addMethod(amplitude);
obj1.onLoad = function(){console.log(obj1)};
obj1.inputArray = [0 , -3, 9 , 16];
console.log("continue..");

