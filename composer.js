
class Address{
  constructor (address){
    if (address){
      this.arr = [];
      for (let i=0 , len=address.length ; i<len ; ++i){
        this.arr.push(address[i]);
      }
    }else{
      this.arr =[];
    }

  }
  clone(address){
    this.arr = [];
    for (let i=0 , len=address.arr.length ; i<len ; ++i){
      this.arr.push(address[i]);
    }
  }
  extend(newProp){
    this.arr.push(newProp);
  }

  clear(){
    this.arr = [];
  }
  isEqual(address){
    let len = this.arr.length;
    if (len!=address.arr.length){
      return false;
    }else{
      for (let i=len-1;i>-1;--i){
        if (this.arr[i]!=address.arr[i]) return false;
      }
      return true;
    }
  }
  getRefFrom(obj){
    let result = obj;
    for (let i = 0, len = this.arr.length ; i<len ; ++i){
      if (typeof(result)=== "object" && result!=null){
        result = Reflect.get(result, this.arr[i]);
      }else{
        result = undefined;
      }
    }
    return result;
  }
  existIn(addresses){
    for(let i=0 , len=addresses.length ; i<len ; ++i){
      if (this.isEqual(addresses[i])) return true;
    }
    return false;
  }
  buildPath(obj){
    for (let i = 0, len = this.arr.length; i<len ; ++i){
      if (!obj.hasOwnProperty(this.arr[i])){
        Reflect.set(obj , this.arr[i] , {})
      }
      obj = Reflect.get(obj , this.arr[i]);
    }
  }

  name(){
    return this.arr[this.arr.length - 1];
  }
  in(obj){
    for (let i = 0, len = this.arr.length  ; i<len ; ++i){
      if (typeof(obj)==="object" && obj!=null && obj.hasOwnProperty(this.arr[i])){
        obj = Reflect.get(obj, this.arr[i]);
      }else{
        return false;
      }
    }
    return true;
  }
  getObject(obj){
    let result = obj;
    for (let i = 0, len = this.arr.length - 1 ; i<len ; ++i){
        result = Reflect.get(result, this.arr[i]);
    }
    return result;
  }


}
export default function(){
  'use strict'
  const metaDataKey = Symbol.for("metaDataKey")
  const composite = {};
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
  const paraRegExp = /.*?\(\{([^)]*)\}\)/; 
  let affectedComposite = composite;
  let affectedProp;
  let absoluteAddress=[];
  let addingFunction = false;
  let nestedPropertiesCourier = {};
  //let metaObject = {};
  //metaObject[metaDataKey] = {affectedFunctions:[] , inputProps: []};
  //
  let currentAdd = new Address();

  const interceptor=function(composite , localComposite ,funcAddress){
    //const metaDataKey = Symbol.for("metaDataKey");

    //const mainComposite = composite.metaDataKey.grandParent;
    let absoluteAddress= new Address();
    let relativeAddress= new Address(funcAddress);
    relativeAddress.arr.pop();
    

    const interceptorProxy= new Proxy(composite,{
      set:function(target , prop , value){
        console.log("it saving")

      },

      get:function(target , prop){
        if (prop == Symbol.unscopables){
          return undefined;
        }
        return Reflect.get(target , prop);
      },

      has:function(target , key){

        if (absoluteAddress.arr.length == 0){
          if (composite.hasOwnProperty(key)){
            absoluteAddress.extend(key);
            return true;
          }

        }else{
          if (target.hasOwnProperty(key)){
            absoluteAddress.extend(key);
            return true;
          }
        absoluteAddress.clear();

        }
        return false;
      }
    })
    return interceptorProxy;
  }
  
  const runFunction = async function(funcAddress){
    let needsUpdate = [];
    let localComposite = funcAddress.getObject(composite);
    localComposite[funcAddress.name()] = await(funcAddress.getRefFrom(metaTree)[metaDataKey].function(localComposite , composite , interceptor(composite , localComposite ,funcAddress)));
    needsUpdate.push(funcAddress);
    manageUpdates(needsUpdate);


  }
  const runFunctions = async function({updateQueue , liveFunctions , composite , allUpdatedProps , affectedFunctions}){
    let compositeMetaData = composite[metaDataKey];
    let resolvedMethod;
    let callNumber = Symbol();
    compositeMetaData.validAsyncCall = callNumber; // make any other calls invalid
    allUpdatedProps = [...allUpdatedProps, ...updateQueue];
    while (updateQueue.length!=0 || affectedFunctions.length!=0){
      while(updateQueue.length!=0){
        let item = updateQueue.pop();
        for (let method of liveFunctions.entries()){
          if (includesAddress(method[1] , item)){
            if (method[1].reduce(function(previous , current){if (getPropByAddress(current)===undefined){return false}else{return previous}}, true)){
              affectedFunctions.push(method[0]);
            }
          }
        }
      }
      affectedFunctions = Array.from(new Set(affectedFunctions));
      while (affectedFunctions.length!=0){
        let method = affectedFunctions.pop();
        resolvedMethod = await(method(composite  ,callNumber ));
        if (resolvedMethod!=undefined){
          composite[method.name] = resolvedMethod;
          let methodAddress = [...compositeMetaData.absoluteAddress];
          methodAddress.push(method.name);
          updateQueue.push(methodAddress); 
          allUpdatedProps.push(methodAddress);
        }
        if (callNumber != compositeMetaData.validAsyncCall) return false;
      }
    }
      removeDuplicates(allUpdatedProps);
      let insideFunctionUpdates = compositeMetaData.insideFunctionUpdates; 
      if (compositeMetaData.parentComposite){
        let parentComposite = compositeMetaData.parentComposite.composite;
        let affectedPropAddress = compositeMetaData.parentComposite.affectedProp;
        if (insideFunctionUpdates.has(parentComposite)){
          insideFunctionUpdates.set(parentComposite , insideFunctionUpdates.get(parentComposite).push(affectedPropAddress));
        }else{
          insideFunctionUpdates.set(parentComposite,[affectedPropAddress])
        }
      }
      let insideFunctionUpdatesClone = new Map(compositeMetaData.insideFunctionUpdates);
      compositeMetaData.insideFunctionUpdates.clear();
      for (let item of insideFunctionUpdatesClone.entries()){
        manageUpdates(item[0] , item[1]);
      }
  }

  composite[metaDataKey]= {parentComposite: undefined , updateQueue:[], allUpdatedProps:[] , liveFunctions: new Map() , composite: composite, 
                            grandParent: composite , validAsyncCall:undefined , runFunctions: runFunctions , absoluteAddress: [] , 
                            externalAddresses: new Map() , insideFunctionUpdates:new Map(), interceptor: interceptor, affectedFunctions: [] , metaTree: {}};
  let metaTree = composite[metaDataKey].metaTree;
  let updateQueue = composite[metaDataKey].updateQueue;


const setProperties = function(options){
  let currentComposite = currentAdd.getRefFrom(composite);
  let needsUpdate=[];
  let itemAddress;
  //let needsUpdate=[...affectedComposite[metaDataKey].absoluteAddress];
  Object.assign(currentComposite , options);
  for (let item in options){
    itemAddress = new Address(currentAdd.arr);
    itemAddress.extend(item);
    needsUpdate.push(itemAddress);
  }
  manageUpdates(needsUpdate);
  }
const addFunction = function(){
  addingFunction = false;
  let method = arguments[0];
  let finalFunction;
  let functionPara =[];
  let finalPara;

  let importedFunction = splitFunction(method);
  let injectingFunction = function(){
  }
  //let injectingCodes = splitFunction(injectingFunction).body;

  if (arguments[1]) {
    for (let item of nestedPropertiesCourier.property){
      functionPara.push(item);
      // let propAddress = item.join('.');
      // let nearestComposite = composite;
      // let lastObj = composite;
      // for (let i=0;i<item.length - 1 ;++i){
      //   if (typeof(lastObj[item[i]])==="object" && lastObj[item[i]] != null){
      //     lastObj = lastObj[item[i]];
      //     if (lastObj[metaDataKey]){
      //       nearestComposite = lastObj;
      //     }

      //   }else{
      //     throw console.error(propAddress + "not defined yet!");
          
      //   }
      // }

      // functionPara.push(item);
      // let externalAddresses = nearestComposite[metaDataKey].externalAddresses;
      // if (externalAddresses.has(nearestComposite)){
      //   externalAddresses.set(nearestComposite , get(nearestComposite).push(item));
      // }else{
      //   externalAddresses.set(nearestComposite , [item]);
      // }
    }
  }
  let finalBody =  splitFunction(injectingFunction).body + "with (arguments[2]) {"+ importedFunction.body + "}" ;

  //let affectedCompositeAddress = affectedComposite[metaDataKey].absoluteAddress;

  if (importedFunction.paraString){
    importedFunction.paraArray.forEach(item => { 
      let paraAddress = new Address(currentAdd.arr);
      paraAddress.extend(item);
      functionPara.push(paraAddress);
    });
    finalPara = "{" + importedFunction.paraString + "}";
  }else{
    finalPara = "";
  }
  finalFunction = new AsyncFunction(finalPara , finalBody);
  Object.defineProperty(finalFunction , 'name', {
    value: method.name,
    configurable: true,
  })
  //affectedComposite[method.name] = undefined;
  //affectedComposite[metaDataKey].liveFunctions.set(finalFunction, functionPara);

  // convert function name to correspondent address
  //let metaTree = composite[metaDataKey].metaTree;
  let methodAddress = new Address(currentAdd.arr);
  methodAddress.extend(method.name);



  // if address is not available in metaTree build a new branch for function metadata
  if (!methodAddress.in(metaTree)){
    buildMetaPath(methodAddress);
    
    //methodAddress.getRefFrom(metaTree)[metaDataKey] = {affectedFunctions:[] , inputProps: []};
  }
  // otherwise keep affectedFunctions data unchanged while overwriting other metadata
  let methodMeta = methodAddress.getRefFrom(metaTree)[metaDataKey];
  methodMeta.function = finalFunction ;

  // set a new composite prop as method name if is not exist
  if (!methodAddress.in(composite)){
    methodAddress.buildPath(composite);
    methodAddress.getObject(composite)[method.name] = undefined;
  }
  
  for (let i=0 , len=functionPara.length ; i<len ; ++i){
    // add address as a function input parameter
    methodMeta.inputProps.push(functionPara[i]);
    // buil address in metaTree for function input parameters if they are not exist
    if (!functionPara[i].in(metaTree)){
      buildMetaPath(functionPara[i]);
      functionPara[i].getRefFrom(metaTree)[metaDataKey] = {affectedFunctions:[] , inputProps: []};

    }

    // add external link to the function input parameter
    functionPara[i].getRefFrom(metaTree)[metaDataKey].affectedFunctions.push(methodAddress);
    // set a new composite prop by function input parameters
    if(!functionPara[i].in(composite)){
      functionPara[i].buildPath(composite);
      functionPara[i].getObject(composite)[functionPara[i].name()] = undefined;
    }

  }

  //let methodAddress = [...absoluteAddress , method.name];
  // for (let item of functionPara){
  //   setMetaTree(metaAddress , item , "prop")
  // }
  // setMetaTree(metaAddress , methodAddress , "func")

}

const buildMetaPath = function(address){
let obj = metaTree;
  for (let i = 0, len = address.arr.length; i<len ; ++i){
    if (!obj.hasOwnProperty(address.arr[i])){
      Reflect.set(obj , address.arr[i] , {})
      obj[address.arr[i]][metaDataKey] = {affectedFunctions:[] , inputProps: []};
    }
    obj = Reflect.get(obj , address.arr[i]);
  }
}

const setMetaTree = function(obj , absoluteAddress , propType){
  let result = obj;
  for (let i=0, len=absoluteAddress.length ; i<len ; ++i){
    if (typeof(result[absoluteAddress[i]])=== "object" && result[absoluteAddress[i]]!=null){
    }else{
      result[absoluteAddress[i]] = {}
    }
    result = result[absoluteAddress[i]];
  }

  if (result[metaDataKey]) {
    
  }else{
    result[metaDataKey] = {type:propType , dependentFunctions:[] , validAsyncCall:undefined}
  }
}

const splitFunction = function(func){
  let result={};
  let functionString = func.toString();
  let para = functionString.match(paraRegExp);
  if (para){
    result.paraString = para[1];
    result.paraArray = result.paraString.split(',').map(item=>item.trim());
    
  }
  let functionBody = functionString.slice(functionString.indexOf(")") + 1 , functionString.lastIndexOf("}"));
  result.body = functionBody.slice(functionBody.indexOf("{") + 1 );
  return result;
}
const addMethod = function(method){
  affectedComposite[method.name] = method;
}

const manageUpdates = function(needsUpdate){
  // find and add affected overhead properties
  let ancestors = [];
  for (let i=0 , len=needsUpdate.length; i<len ; ++i){
    let item = new Address(needsUpdate[i].arr);
    while (item.arr.length>1){
      item.arr.pop();
      if (!item.existIn(ancestors) && !item.existIn(needsUpdate)){
        ancestors.push(item);
      }
    }
  }
  for (let i=0 , len =ancestors.length ; i<len ; ++i){
    needsUpdate.push(ancestors[i]);
  }

  // find affected functions and put in queue if it doesn't already exist
  for (let i=0 , len=needsUpdate.length; i<len ; ++i){
    let affectedFunctions = needsUpdate[i].getRefFrom(metaTree)[metaDataKey].affectedFunctions;
    for (let j=0 , len=affectedFunctions.length ; j<len ; ++j){
      if (!affectedFunctions[j].existIn(updateQueue)){
        if (allInputParaDefined(affectedFunctions[j])){
          updateQueue.push(affectedFunctions[j]);
        }
      }
    }
  }
  // run in queue functions
  while(updateQueue.length>0){
    runFunction(updateQueue.shift());
  }

  //console.log(needUpdate[0])
  // call current composite functions
  // let compositeMetaData = composite[metaDataKey];
  // compositeMetaData.updateQueue.push(...needsUpdate);
  // compositeMetaData.runFunctions(compositeMetaData);
  // // call external composites functions which rely on current composite properties
  // let externalAddresses = compositeMetaData.externalAddresses;
  // let allUpdatedProps = compositeMetaData.allUpdatedProps;
  // let allAffectedComposites = new Map();
  // for (let item of externalAddresses.entries()){
  //   for (let i = 0, len = allUpdatedProps.length ; i<len ; ++i){
  //     if (includesAddress(item[1] , allUpdatedProps[i])){
  //       if(allAffectedComposites.has(item[0])){
  //         allAffectedComposites.set(item[0] , allAffectedComposites.get(item[0]).push(allUpdatedProps[i]));
  //       }else{
  //         allAffectedComposites.set(item[0] , [allUpdatedProps[i]]);
  //       }
  //     }
  //   }
  // }
  // for (let item of allAffectedComposites.entries()){
  //   let externalCompositeMetaData = item[0][metaDataKey];
  //   externalCompositeMetaData.updateQueue.push(...item[1]);
  //   compositeMetaData.runFunctions(externalCompositeMetaData);
  // }
}
const allInputParaDefined = function(funcAddress){
  let props = funcAddress.getRefFrom(metaTree)[metaDataKey].inputProps;
  for (let i=0 , len=props.length ; i<len ; ++i){
    if (props[i].getRefFrom(composite)===undefined){
      return false;
    }
  }
  return true;
}

const areSameAddresses = function(firstAdd , secondAdd){
  let len = firstAdd.length;
  if (len!=secondAdd.length){
    return false;
  }else{
    for (let i=0;i<len;++i){
      if (firstAdd[i]!=secondAdd[i]) return false;
    }
    return true;
  }
}

const getPropByAddress = function(absoluteAddress){
  let result = composite;
  for (let i = 0, len = absoluteAddress.length; i<len ; ++i){
    if (typeof(result)=== "object" && result!=null){
      result = Reflect.get(result, absoluteAddress[i]);
    }
  }
  return result;
}

const includesAddress = function(addressArray , absoluteAddress){
  for(let i=0 , len=addressArray.length ; i<len ; ++i){
    if (areSameAddresses(addressArray[i] , absoluteAddress)) return true;
  }
  return false;
}

const removeDuplicates = function(addressArray){
  let result = [];
  for (let i=0 , len=addressArray.length; i<len ; ++i){
    if (!includesAddress(result , addressArray[i])){
      result.push(addressArray[i]);
    }
  }
  return result;
}

const adoptComposite = function(adoptedComposite){
  // let metaData = adoptedComposite[metaDataKey];
  // metaData.grandParent = composite;
  // metaData["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
  // metaData.absoluteAddress = [...absoluteAddress];

  // for (let item of metaData.externalAddresses.entries()){
  //   let newAddresses=[];
  //   for (let i=0 , len=item[1].length ; i<len ; ++i){
  //     newAddresses.push([...absoluteAddress , ...item[1][i]])
  //   }
  //   metaData.externalAddresses.set(item[0] , newAddresses);
  // }

  // for (let item of metaData.liveFunctions.entries()){
  //   let newAddresses=[];
  //   for (let i=0 , len=item[1].length ; i<len ; ++i){
  //     newAddresses.push([...metaData.absoluteAddress , ...item[1][i]])
  //   }
  //   metaData.liveFunctions.set(item[0] , newAddresses);
  // }
  
  // const iterate = function(obj , affectedComposite , affectedProp , absoluteAddress){
  //   Object.keys(obj).forEach(key=>{
  //     let value = Reflect.get(obj , key);
  //     if (obj[metaDataKey]){
  //       affectedProp= [...absoluteAddress , key];
  //     }
  //     if (typeof(value)==="object" && value!=null){
  //       if (value["isCompositeProxy"]){
  //         value = value["getProxylessComposite"];
  //         adoptComposite(value , affectedComposite , [...affectedProp ] , [...absoluteAddress , key]);
  //         affectedComposite = value;
          
  //       }
  //       if (Object.keys(value).length!=0){
  //         iterate(value , affectedComposite , [...affectedProp] ,[...absoluteAddress , key]);
  //       }
  //     }
  //   })
  // }

  // iterate(adoptedComposite, adoptedComposite , [...absoluteAddress] , [...absoluteAddress]);
//
//let metaAddress = composite[metaDataKey].metaTree;
let adoptedMetaTree = adoptedComposite[metaDataKey].metaTree;

}

  const compositeHandler = {
    set: function ( obj , prop , value , receiver ){
      currentAdd.extend(prop);

      // if (absoluteAddress.length!=0){
      //   absoluteAddress.push(prop);
      // }else{
      //   absoluteAddress = [prop];
      // }

      if (typeof(value) === "object" && value != null){
        if (value["isCompositeProxy"]){
          value = value["getProxylessComposite"];
          adoptComposite(value);
        }
      }

      Reflect.set(obj , prop , value , receiver);
      // if (obj[metaDataKey]){
      //   affectedProp = [...absoluteAddress , prop];
      // }
      if (!currentAdd.in(metaTree)){
        buildMetaPath(currentAdd);
        //currentAdd.getRefFrom(metaTree)[metaDataKey] = {affectedFunctions:[] , inputProps: []};
      }
      manageUpdates([currentAdd])
      return true;
    },

    get: function ( obj , prop , receiver ){
      if (addingFunction) {
        if (obj[metaDataKey] && obj[metaDataKey].name == "courier"){
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].extend(prop);
        }else{
          nestedPropertiesCourier.property.push(new Address);
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].extend(prop);
        }
        return new Proxy(nestedPropertiesCourier, compositeHandler);
      }
      if (obj[metaDataKey] && obj == composite) {
          currentAdd.clear();
      }
      switch (prop){
        case "set":
        return setProperties;
        case "addFunction":
        addingFunction = true;
        nestedPropertiesCourier = {property:[]};
        nestedPropertiesCourier[metaDataKey] = {name:"courier"};
        return addFunction;
        case "addMethod":
        return addMethod;
        case "getProxylessComposite":
        return composite;
        case "isCompositeProxy":
        return true;
      }

      currentAdd.extend(prop);
      
      // if (absoluteAddress.length!=0){
      //   absoluteAddress.push(prop);
      // }else{
      //   absoluteAddress=[prop];

      // }

      if (typeof(obj[prop]) === "object" && obj[prop] != null){

        // if (obj[prop][metaDataKey]){
        //   obj[prop][metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
        //   affectedComposite = obj[prop];
        // }
        return new Proxy(Reflect.get(obj , prop , receiver ), compositeHandler);
    }
      return Reflect.get(obj , prop , receiver );
    }
  }
  return new Proxy(composite , compositeHandler);
}