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

- addFunction
- addMethod
- set

We can add our functions using addFunction(functionName). Each function should have an unique name that will be considered as a new property. So while we updating input arguments of a function the result will be stored as a property under that function's name. Other functions may use this result or results to generate new properties and so on.

Also,composite properties define automaticly by retrieving functions arguments. We should pass arguments by destructuring assignment to make arguments readable for composite.

After reading functions and their properties by composite, it recursively inject a changing interceptor to all properties. Consequently, once a property changed all related functions update in sequence. It happens asynchronously while program continuing. Always the last changes cause new updates and if old asynchronous functions still running they will ineffect. However, a simple check provided for developer to find out if a running function is outdated, then it is posible to force the function to resolve or manipulate its side effect in managed way.



Imagine we have a bunch of functions for processing some input properties. They are not pure functions but they follow some rules:

1. All input arguments and functions should have unique names
2. A function must have at least one input argument
3. calling function without arguments should lead to returning function arguments names
4. Asynchronous functions should be like normal functions but they will return a Promise 

Also consider that these functions can use external data source or they can have side effect.


It has two main method
- addMethod(functionName)
- set({properies})

## How to use

