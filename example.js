import CompositeObject from "./composer.js"
import { addNumbers } from "./example.addNumbers.js";
import { linkProperties } from "./example.linkProperties.js";
import { mulNumbers } from "./example.mulNumbers.js";

let comp1 = CompositeObject();
addNumbers(comp1);
comp1.number1= 10; //random number as an exampl
comp1.number2 =7; //random number as an exampl
// result: 17


// linking a new nested property to number1 in part A
linkProperties(comp1);
comp1.object1.num =13; //random number as an example
// result: 20

mulNumbers(comp1);
// result 91



