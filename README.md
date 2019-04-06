Composer
==========
It is usefull for developing live composite objects in javascript. 

## Credits

This repo is compiled by [Makan Edrisi](https://github.com/makannew)

## Table of content
- [Concept](https://github.com/makannew/Composer/blob/master/README.md#concept)
- [Structure](https://github.com/makannew/Composer/blob/master/README.md#Structure)
- [How to use](https://github.com/makannew/Composer/blob/master/README.md#How-to-use)
- [Useful tips](https://github.com/makannew/Composer/blob/master/README.md#Useful-tips)

## Concept

Main aim of the composer is managing functions to collaborate with each other as a single live object. It connects functions to each other in a sequential way, then it keeps track of any changes in properties to update affected functions. These updates take place asynchronously. It means composite lively continue to updates and evolves while other parts of program running.

## Structure

There is three main method:

- [addFunction](https://github.com/makannew/Composer/blob/master/README.md#addfunction)
- [addMethod](https://github.com/makannew/Composer/blob/master/README.md#addmethod)
- [set](https://github.com/makannew/Composer/blob/master/README.md#set)

#### addFunction

We can add our live functions using addFunction(functionName) method. Each function should have an unique name to considered as a new property. So while we updating input arguments of a function the result will be stored as a property under that function's name. Other functions may use this result or results to generate new properties and so on.

Also, other composite's properties define automatically by retrieving functions arguments. So arguments should pass to function by [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) method to make arguments readable for composer.

After reading functions and their properties by composer, it recursively inject a changing interceptor to requested properties. Consequently, once a property changed all related functions will update in sequence, it happens asynchronously while program continuing. Always the last change triggers new update procedure and if old asynchronous functions still running they will be ignored. However, a simple check provided for developer to find out if a running function is outdated, then it is posible to force the function to resolve or manipulate its side effect in a managed way.

#### addMethod

We can add functions using addMethod(functionName) method. Function result could manualy assigned to a composite property and it will not part of live updating events. It only provides a method for developer under the composite namespace for further manual use.

#### set

It provides a way for setting a group of properties at once by set ( { prop1: value1 , prop2: value2 , ... } ).

## How to use

After adding ["composer.js"](composer.js) to our project we can instantiate our composite by calling CompoiteObject() function:
```
import CompositeObject from "./composer.js"
const myComp = CompositeObject();
```
Then we can write our functions with unique names and pass arguments by destructuring expression method. Naming is very important during functions development, for a rule of thumb we can ask ourselves "what is it?" then answer would be it is "functionName".
For example if we have a function to add two numbers we should write it like this:
```
const twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
```
Then we can write anothe function to get above function's result which it is now a new property called "twoNumbersSum" and log it on console:
```
const logResult = function({twoNumbersSum}){
  console.log(twoNumbersSum);
  return true;
}
```
As you can see the second function relies on result of the first one, so we can add these functions to our composite:
```
myComp.addFunction(twoNumbersSum);
myComp.addFunction(logResult);
```
After adding functions myComp will have four undefined properties { number1:undefined , number2:undefined , twoNumbersSum:undefined , logResult:undefined }.
Now we can use our composite by simply assigning input numbers and result instantly calculates and logs on console:
```
myComp.set({number1: 30 , number2: 60}) // output:90
```
It happens asynchronously so if we immidiately change one of the numbers it causes two possible result:
```
myComp.number1 = 40; // output: 90 , 100 or only 100
```
It is because composite always updates itself with the latest changes but old updates may still running asynchronously. Composer terminates running updates and ignores result of outdated functions when new update triggred, but what if a function was in the middle of its execution and it has side effects? For example our logResult function has a side effect (logging on console) so we might have two results on console. 

To control this problem composer provides a check to findout if a running function is the lastone or not. If expression `(arguments[1](arguments[2]))` was true it means this call is the latest one.  It is developer responsibility to apply this check to the functions with side effects, it gives an option to developer to decide to terminate, resolve or manipulate side effects while it is outdated run of a function. So we can rewrite logResult function and implement this check before logging on console:
```
const logResult = function({twoNumbersSum}){
  if (arguments[1](arguments[2])){
    console.log(twoNumbersSum);
  }
  return true;
 }
```
Final code should be like this:
```
const twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
  
const logResult = function({twoNumbersSum}){
  if (arguments[1](arguments[2])){
    console.log(twoNumbersSum);
  }
  return true;
 }
 
const myComp = CompositeObject();
myComp.addFunction(twoNumbersSum);
myComp.addFunction(logResult);

myComp.set({number1: 30 , number2: 60}) // log on console prevented because in next line new update triggered
myComp.number1 = 40; // output: 100
```
Composite properties could also be other composite or objects and we can make complex live objects just by adding those functions to our composite. For more complex example you can refere to ["test.js"](test.js).

## Useful tips

### Arguments[0]

In addition to function parameters all other properties of the composite are accesible through arguments[0]. For instance we can access number1 and number2 in above example through `arguments[0].number1` and `arguments[0].number2`

```
const logResult = function({twoNumbersSum}){
  if (arguments[1](arguments[2])){
    console.log(arguments[0].number1 , arguments[0].number2 , twoNumbersSum);
  }
  return true;
 }
```

### Cascaded composite

We can set a composite property to an object or array while making composite then add child composites to it. But before start let wrap our `myComp` composite inside a composite factory
```
const myCompFactory = function(){
  let myComp = CompositeObject();
  myComp.addFunction(twoNumbersSum);
  myComp.addFunction(logResult);
  return myComp;
}
```
Now consider we have a function to log myComp numbers
```
const logChildComp = function({childComps}){
  for(let item in childComps){
    if (childComps[item]["logResult"]){
      console.log(item , "values:" ,childComps[item]["number1"] , childComps[item]["number2"])
    }
  }
}

```
During making composite structure we can assign `childComps = {}` as a container for child composites
```
const parentComp = CompositeObject();
parentComp.addFunction(logChildComp);
parentComp.childComps = {};
```
Now we can add our child composites
```
parentComp.childComps.myComp1 = myCompFactory();
parentComp.childComps.myComp2 = myCompFactory();
parentComp.childComps.myComp3 = myCompFactory();
```
And if we set the child composite properties it will update parent properties as well
```
parentComp.childComps.myComp1.number1 =3;
parentComp.childComps.myComp1.number2 =7; 
// child output: 3 7 10 
// parent output: myComp1 values: 3 7
```
