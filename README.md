Composer
==========
Composer is a simple javascript framework for developing live composite objects. It defines an architecture for the program which help to run dependent functions asynchronously. 

## Credits

This repo is compiled by [Makan Edrisi](https://github.com/makannew)

## Table of content
- [Concept](https://github.com/makannew/Composer/blob/master/README.md#concept)
- [Structure](https://github.com/makannew/Composer/blob/master/README.md#Structure)
- [How to use](https://github.com/makannew/Composer/blob/master/README.md#How-to-use)
- [Additional tips](https://github.com/makannew/Composer/blob/master/README.md#Additional-tips)

## Concept

Main aim of the composer is managing functions to collaborate with each other as a single live object. It connects functions to each other in a sequential way, then it keeps track of any changes in properties to update affected functions. These updates take place asynchronously. It means composite lively continue to updates and evolves while other parts of program running.

## Structure

There are three main method:

- [addFunction](https://github.com/makannew/Composer/blob/master/README.md#addfunction)
- [addLink](https://github.com/makannew/Composer/blob/master/README.md#addLink)
- [set](https://github.com/makannew/Composer/blob/master/README.md#set)

#### addFunction

We can add our live functions using ```addFunction(functionName)``` method. Each function should have an unique name to considered as a new property. So while we updating input arguments of a function the result will be stored as a property under that function's name. Other functions may use this result or results to generate new properties and so on.

Arguments should pass to function by [destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) method to make arguments readable for composer.

After reading functions and their properties by composer, it recursively inject a changing interceptor to monitor properties. Consequently, once a property changed all related functions will update in sequence, it happens asynchronously while program continuing. 

### addLink

Two or more properties or functions can link to each other by theire address. First address changes other addresses values. Then any changes to one of linked value cause updating all others value.```addLink(address1, address2)```


#### set

It provides a way for setting a group of properties in one line.```set ( { prop1: value1 , prop2: value2 , ... } )```

## How to use

After importing ["composer.js"](composer.js) to our project we can instantiate our composite:
```
import CompositeObject from "./composer.js"
const myComp = CompositeObject();
```
Then we can write our functions with unique names and pass arguments by destructuring expression method. Unique naming is very important during functions development.
For example if we need a function for adding two numbers:
```
function twoNumbersSum({number1 , number2}){
  return number1 + number2;
  }
```
Then we can write anothe function to get above function's result which it is now a new property called "twoNumbersSum" and log it on console:
```
function logResult({twoNumbersSum}){
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

Composite properties could also be other composite or objects and we can make complex live objects just by adding those functions to our composite. For more complex example you can refere to ["example.js"](test.js).

## Additional tips

### Access properties

In addition to function parameters all other properties in same level with running function are accesible. For instance we can access number1 and number2 inside logResult function. But be aware those properties may change by other part of the program while this function is running.

```
const logResult = function({twoNumbersSum}){
    console.log(number1 , number2 , twoNumbersSum);
  return true;
 }
```
The properties could be object and accessing to their keys is simply possible by theire address. But to access other branches or higher level properties we shuold link those properties or functions to a local one.

### Update properties inside functions

After any changes to the properties in same level with function parameters dependent functions will update automaticaly. However, nested properties exception and their dependent functions will not update. It is important to avoid updating any property in currrent function's inputs chain, it will leads to endless updating loop.

### Cascaded composite

We can set a composite property to another composite. 
Before start let wrap our `myComp` composite inside a composite factory
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


