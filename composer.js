
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

  const interceptor=function(composite){
    //const metaDataKey = Symbol.for("metaDataKey");

    //const mainComposite = composite.metaDataKey.grandParent;
    let absoluteAddress=[];
    let relativeAddress;
    

    const interceptorProxy= new Proxy(composite,{

      get:function(target , prop){
        // if (composite.metaDataKey.absoluteAddress){

        // }
      },

      has:function(target , key){

        if (absoluteAddress.length == 0){
          if (composite.has(key)){
            absoluteAddress.push(key);
            //add relative current composite to absolute address

          }
          if(mainComposite.has(key)){
            absoluteAddress.push(key);

          }
        }else{
          if (mainComposite[absoluteAddress].has(key)){

          }else{
            absoluteAddress=[];
          }
        }
        

      }
    })
    return interceptorProxy;
  }(composite)

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
        callUpdates(item[0] , item[1]);
      }
  }

  composite[metaDataKey]= {parentComposite: undefined , updateQueue:[], allUpdatedProps:[] , liveFunctions: new Map() , composite: composite, 
                            grandParent: composite , validAsyncCall:undefined , runFunctions: runFunctions , absoluteAddress: [] , 
                            externalAddresses: new Map() , insideFunctionUpdates:new Map(), interceptor: interceptor, affectedFunctions: []};

const setProperties = function(options){
  let needsUpdate=[...affectedComposite[metaDataKey].absoluteAddress];
  Object.assign(affectedComposite , options);
  for (let item in options){
    needsUpdate.push(item);
  }
  callUpdates(affectedComposite , needsUpdate);
  }
const addFunction = function(){
  addingFunction = false;
  let method = arguments[0];
  let finalFunction;
  let functionPara =[];
  let importedFunction = splitFunction(method);
  let functionHeader = function(){
  }
  let injectingCodes = splitFunction(functionHeader).body;

  if (arguments[1]) {
    for (let item of nestedPropertiesCourier.property){
      let propAddress = item.join('.');
      let nearestComposite = composite;
      let lastObj = composite;
      for (let i=0;i<item.length - 1 ;++i){
        if (typeof(lastObj[item[i]])==="object" && lastObj[item[i]] != null){
          lastObj = lastObj[item[i]];
          if (lastObj[metaDataKey]){
            nearestComposite = lastObj;
          }

        }else{
          throw console.error(propAddress + "not defined yet!");
          
        }
      }

      functionPara.push(item);
      let externalAddresses = nearestComposite[metaDataKey].externalAddresses;
      if (externalAddresses.has(nearestComposite)){
        externalAddresses.set(nearestComposite , get(nearestComposite).push(item));
      }else{
        externalAddresses.set(nearestComposite , [item]);
      }
    }
  }
  let finalBody =  injectingCodes + importedFunction.body ;

  let finalPara;
  let affectedCompositeAddress = affectedComposite[metaDataKey].absoluteAddress;
  if (importedFunction.paraString){
    importedFunction.paraArray.forEach(item => { functionPara.push([...affectedCompositeAddress , item])});
    finalPara = "{" + importedFunction.paraString + "}";
  }else{
    finalPara = "";
  }
  finalFunction = new AsyncFunction(finalPara , finalBody);
  Object.defineProperty(finalFunction , 'name', {
    value: method.name,
    configurable: true,
  })
  affectedComposite[method.name] = undefined;
  affectedComposite[metaDataKey].liveFunctions.set(finalFunction, functionPara);
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

const callUpdates = function(composite , needsUpdate){

  // call current composite functions
  let compositeMetaData = composite[metaDataKey];
  compositeMetaData.updateQueue.push(...needsUpdate);
  compositeMetaData.runFunctions(compositeMetaData);
  // call external composites functions which rely on current composite properties
  let externalAddresses = compositeMetaData.externalAddresses;
  let allUpdatedProps = compositeMetaData.allUpdatedProps;
  let allAffectedComposites = new Map();
  for (let item of externalAddresses.entries()){
    for (let i = 0, len = allUpdatedProps.length ; i<len ; ++i){
      if (includesAddress(item[1] , allUpdatedProps[i])){
        if(allAffectedComposites.has(item[0])){
          allAffectedComposites.set(item[0] , allAffectedComposites.get(item[0]).push(allUpdatedProps[i]));
        }else{
          allAffectedComposites.set(item[0] , [allUpdatedProps[i]]);
        }
      }
    }
  }
  for (let item of allAffectedComposites.entries()){
    let externalCompositeMetaData = item[0][metaDataKey];
    externalCompositeMetaData.updateQueue.push(...item[1]);
    compositeMetaData.runFunctions(externalCompositeMetaData);
  }
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

const adoptComposite = function(adoptedComposite, affectedComposite , affectedProp , absoluteAddress){
  let metaData = adoptedComposite[metaDataKey];
  metaData.grandParent = composite;
  metaData["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
  metaData.absoluteAddress = [...absoluteAddress];

  for (let item of metaData.externalAddresses.entries()){
    let newAddresses=[];
    for (let i=0 , len=item[1].length ; i<len ; ++i){
      newAddresses.push([...absoluteAddress , ...item[1][i]])
    }
    metaData.externalAddresses.set(item[0] , newAddresses);
  }

  for (let item of metaData.liveFunctions.entries()){
    let newAddresses=[];
    for (let i=0 , len=item[1].length ; i<len ; ++i){
      newAddresses.push([...metaData.absoluteAddress , ...item[1][i]])
    }
    metaData.liveFunctions.set(item[0] , newAddresses);
  }
  
  const iterate = function(obj , affectedComposite , affectedProp , absoluteAddress){
    Object.keys(obj).forEach(key=>{
      let value = Reflect.get(obj , key);
      if (obj[metaDataKey]){
        affectedProp= [...absoluteAddress , key];
      }
      if (typeof(value)==="object" && value!=null){
        if (value["isCompositeProxy"]){
          value = value["getProxylessComposite"];
          adoptComposite(value , affectedComposite , [...affectedProp ] , [...absoluteAddress , key]);
          affectedComposite = value;
          
        }
        if (Object.keys(value).length!=0){
          iterate(value , affectedComposite , [...affectedProp] ,[...absoluteAddress , key]);
        }
      }
    })
  }

  iterate(adoptedComposite, adoptedComposite , [...absoluteAddress] , [...absoluteAddress]);

}

  const compositeHandler = {
    set: function ( obj , prop , value , receiver ){
      if (absoluteAddress.length!=0){
        absoluteAddress.push(prop);
      }else{
        absoluteAddress = [prop];
      }

      if (typeof(value) === "object" && value != null){
        if (value["isCompositeProxy"]){
          value = value["getProxylessComposite"];
          adoptComposite(value , affectedComposite , affectedProp , absoluteAddress);
        }
      }
      Reflect.set(obj , prop , value , receiver);
      if (obj[metaDataKey]){
        affectedProp = [...absoluteAddress , prop];
      }
      callUpdates(affectedComposite , [absoluteAddress]  )
      return true;
    },

    get: function ( obj , prop , receiver ){
      if (addingFunction) {
        if (obj[metaDataKey] && obj[metaDataKey].name == "courier"){
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].push(prop);
        }else{
          nestedPropertiesCourier.property.push([]);
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].push(prop);
        }
        return new Proxy(nestedPropertiesCourier, compositeHandler);
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
      if (obj[metaDataKey]){
        if (obj == composite){
          affectedComposite = composite;
          absoluteAddress = [];
        }
        affectedProp = [...absoluteAddress , prop];
      }
      if (absoluteAddress.length!=0){
        absoluteAddress.push(prop);
      }else{
        absoluteAddress=[prop];
      }

      if (typeof(obj[prop]) === "object" && obj[prop] != null){

        if (obj[prop][metaDataKey]){
          obj[prop][metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
          affectedComposite = obj[prop];
        }
        return new Proxy(Reflect.get(obj , prop , receiver ), compositeHandler);
    }
      return Reflect.get(obj , prop , receiver );
    }
  }
  return new Proxy(composite , compositeHandler);
}