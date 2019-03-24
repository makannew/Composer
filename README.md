Composer
==========
It is usefull for developing live composite objects in javascript. 

## Credits

This repo is compiled by [Makan Edrisi](https://github.com/makannew)

## Table of content
- [Concept](https://github.com/makannew/Composer/blob/master/README.md#concept)
- [Structure](https://github.com/makannew/Composer/blob/master/README.md#Structure)
- [How to use](https://github.com/makannew/Composer/blob/master/README.md#How-to-use)

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
let myComp = CompositeObject();
```
Then we can write our functions with unique names and pass arguments by destructuring expression method. Naming is very important during functions development, for a rule of thumb we can ask ourselves "what is it?" then answer would be it is "functionName".
For example if we have a function to add two numbers we should write it like this:
```
let twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
```
Then we can write anothe function to get above function's result which it is now a new property called "twoNumbersSum" and log it on console:
```
let logResult = function({twoNumbersSum}){
  console.log(twoNumbersSum);
  return true;
}
```
As you can see the second function relies on result of the first one, so we can add these functions to our composite:
```
myComp.addFunction(twoNumbersSum);
myComp.addFunction(logResult);
```
After adding functions myComp will have four properties { number1 , number2 , twoNumbersSum , logResult }.
Now we can use our composite by simply assigning input numbers and result instantly calculates and logs on console:
```
myComp.set({number1: 30 , number2: 60}) // output:90
```
It happens asynchronously so if we immidiately change one of the numbers it causes two possible result:
```
myComp.number1 = 40; // output: 90 , 100 or only 100
```
It is because composite always updates itself with the latest changes but old updates may still running asynchronously. Outdated running functions will be ignored by composer but what if they have side effects? For example our logResult function has a side effect (logging on console) so we might have two results on console. 
To control this problem composer provides a check to findout if the running function is the lastone or not. If expression (arguments[1] == arguments[0]["totalAsyncCalls"]) was true it means this call is the latest one. It is developer responsibility to apply this check to the functions with side effects, it gives an option to developer to decide to terminate, resolve or manipulate function side effects while it is outdated run of a function. So we can rewrite logResult function and implement this check before logging on console:
```
let logResult = function({twoNumbersSum}){
  if (arguments[1] == arguments[0]["totalAsyncCalls"]){
    console.log(twoNumbersSum);
  }
  return true;
 }
```
Final code should be like this:
```
let twoNumbersSum = function({number1 , number2}){
  return number1 + number2;
  }
  
let logResult = function({twoNumbersSum}){
  if (arguments[1] == arguments[0]["totalAsyncCalls"]){
    console.log(twoNumbersSum);
  }
  return true;
 }
 
let myComp = CompositeObject();
myComp.addFunction(twoNumbersSum);
myComp.addFunction(logResult);

myComp.set({number1: 30 , number2: 60}) // log on console prevented because in next line new update triggered
myComp.number1 = 40; // output: 100
```
Composite properties could also be other composite or objects and we can make complex live objects just by adding those functions to our composite. For more complex example you can refere to ["test.js"](test.js).
