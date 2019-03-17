Composer
==========
It is a function to combine other functions to make a composit object. 

## Credits

This repo is compiled by [Makan Edrisi](https://github.com/makannew)

## Table of content
-[Concept]
-[Structure]
-[How to use]

## Concept

Main aim of this composer is to manage our functions to collaborate on shared properties as a single live object.

Imagine we have a bunch of functions for processing some input properties. They are not pure functions but they follow some rules:

1. All input arguments and functions should have unique names
2. A function must have at least one input argument
3. calling function without arguments should lead to returning function arguments names
4. Asynchronous functions should be like normal functions but they will return a Promise 

Also consider that these functions can use external data source or they can have side effect.

## Structure

It has two main method
- addMethod(functionName)
- set({properies})


## How to use

