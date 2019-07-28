
export function changeOtherCompositeProperties(comp2 , comp1){
  comp2.externalComp = comp1;
  comp2.addFunction(changeNumber1Property)
  comp2.addFunction(changeNumber2Property)

}

function changeNumber1Property({number1}){
  externalComp.number1 = number1;
}

function changeNumber2Property({number2}){
  externalComp.number2 = number2;
}