let maxNumber = function(para){
  // define function arguments
  if (para === undefined){
    return ["inputArray"];
  }
  let {inputArray} = para;
  // 
  return Math.max(...inputArray);
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
obj1.add(maxNumber);
obj1.add(minNumber);
obj1.add(amplitude);
obj1.set({inputArray: [0 , 5, 9 , 16]});
console.log(obj1);