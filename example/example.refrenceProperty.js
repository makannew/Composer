
export function refrenceToObject(comp1){
  comp1.newProp = comp1.object1;
  comp1.addFunction(func1);
}

function func1({newProp}){
  if(!newProp.prop1) return undefined;
  console.log("newProp refrenced object updated by addring prop1=",newProp.prop1)
}