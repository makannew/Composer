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

Main aim of the composer is managing functions to collaborate with each other as a single live object. It connects functions to each other in a sequential way, then it keeps track of any changes in properties to update affected functions. These updates take place asynchronously. It means composite lively continue to update and evolve while other parts of program running.

## Structure

There is three main method:

- [addFunction](https://github.com/makannew/Composer/blob/master/README.md#addfunction)
- [addMethod](https://github.com/makannew/Composer/blob/master/README.md#addmethod)
- [set](https://github.com/makannew/Composer/blob/master/README.md#set)

#### addFunction

We can add our live functions using addFunction(functionName) method. Each function should have an unique name to considered as a new property. So while we updating input arguments of a function the result will be stored as a property under that function's name. Other functions may use this result or results to generate new properties and so on.

Also, other composite's properties define automatically by retrieving functions arguments. So arguments should pass to function by destructuring assignment method to make arguments readable for composite.

After reading functions and their properties by composite, it recursively inject a changing interceptor to all properties. Consequently, once a property changed all related functions will update in sequence, it happens asynchronously while program continuing. Always the last changes cause new updates and if old asynchronous functions still running they will ineffect. However, a simple check provided for developer to find out if a running function is outdated, then it is posible to force the function to resolve or manipulate its side effect in managed way.

#### addMethod

We can add functions using addMethod(functionName) method. Function result could manualy assigned to a composite property. It will not part of live updating events. It only provides a method for developer under the composite namespace for furthur manual use.

#### set

It provides a way for setting a group of properties at once by set({prop1:... , prop2:... , ...}).

## How to use

After adding ["composer.js"](composer.js) to our project we can instantiate our composer by calling CompoiteObject() function:
```
let myComp = CompositeObject();
```
