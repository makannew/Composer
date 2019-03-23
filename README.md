Composer
==========
It is usefull for developing live composit objects in javascript. 

## Credits

This repo is compiled by [Makan Edrisi](https://github.com/makannew)

## Table of content
- [Concept](https://github.com/makannew/Composer/blob/master/README.md#concept)
- [Structure](https://github.com/makannew/Composer/blob/master/README.md#Structure)
- [How to use](https://github.com/makannew/Composer/blob/master/README.md#How-to-use)

## Concept

Main aim of the composer is managing functions to collaborate with each other as a single live object. It connects functions to each other in a sequential way, then it keeps track of any changes in properties to update affected functions. These updates take place asynchronously. It means composite lively continue to update and evolve while other parts of program running.

## Structure

Each function has a unique name that will be considered as a new property. So while we updating input arguments of a function the result will be stored as a property under function name. Other functions may use this result or results to generate new properties.


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

