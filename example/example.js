import CompositeObject from "../composer.js"
import { addNumbers } from "./example.addNumbers.js";
import { linkProperties } from "./example.linkProperties.js";
import { mulNumbers } from "./example.mulNumbers.js";
import { changeOtherCompositeProperties } from "./example.callOtherComposite.js";

let comp1 = CompositeObject();
console.log(comp1);
addNumbers(comp1);
comp1.number1= 10; //random number as an example
comp1.number2 =7; //random number as an example
// adding result 10 + 7 = 17


// linking a new nested property (comp1.object1.num) to ncomp1.umber1 
linkProperties(comp1);
comp1.object1.num =13; //random number as an example
// adding result 7 + 13 = 20 changeing comp1.object1.num will change comp1.number1

mulNumbers(comp1);
// mul result  7 * 13 = 91

// cange input parameters of comp1 from comp2
let comp2 = CompositeObject();
changeOtherCompositeProperties(comp2 , comp1);
comp2.set({number1:100 , number2:200}); //set random numbers as an example
//adding result 100 + 200 = 300 calculated by comp1
//mul result 100 * 200 = 2000 calculated by comp1
