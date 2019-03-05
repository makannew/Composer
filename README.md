# Composer
I am trying to make a simple structure for function composition to make dynamic objects.
Imagine we have few functions that processing input values and return output values. They are not pure functions but they follow some rules:
1. All input arguments and functions have unique name and used as property names
2. A function must have at least one argument and input arguments cannot be changed by function
3. calling function without arguments should lead to returning function arguments name
function can use external data source or they can have side effect but they shuold comply these three rules.
If we want to use these functions to collaborate on shared properties to make an object we should combine them.
Here we need a composer take care of this combination and make things easy.

