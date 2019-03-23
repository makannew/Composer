

let CompositeObject = function(){
  'use strict'
  let composit = {};
  let propNames = {};
  let liveFunctions = new Map();
  let totalAsyncCalls = 0;
  let updateStatus = {};
  // extract function parameters which should be in form of destructor object {para1 , para2 , ...}
  // x =  function({para1 , para2 , para3}) then para1 , para2 , para3 are match by paraRegExp
  const paraRegExp = /.*?\(\{([^)]*)\}\)/; 


  let runFunctions = async function(options , callNumber){
    Object.assign(updateStatus , options); // to keep track of the properties that needs to be updated
    let nextUpdates = {};
    let resolvedMethod;
      while(Object.keys(updateStatus).length){
      nextUpdates = {};
      for (let item in updateStatus){
        if (!(updateStatus[item])){
            for (let method of liveFunctions.entries()){
            if (method[1].includes(item)){
              if (method[1].reduce(function(previous , current){if (composit[current]===undefined){return false}else{return previous}}, true)){
                resolvedMethod = await(method[0](composit));
                if (callNumber < totalAsyncCalls) return false;
                composit[method[0].name] = resolvedMethod;
                nextUpdates[method[0].name] = false; 
              }else{
                if (callNumber < totalAsyncCalls) return false;
                composit[method[0].name] = undefined;
                nextUpdates[method[0].name] = false;
              }
            }
          }
        }
      }
      if (callNumber < totalAsyncCalls){
        return false;
      }else{
        updateStatus = {};
        Object.assign(updateStatus , nextUpdates);
      }
    }
    if (callNumber < totalAsyncCalls) {
      return false;
    }else{
      totalAsyncCalls = 0;
      return true;
    }
  }
  let setProperties = function(options){
    Object.assign(composit , options)
    for (let item in options){
      options[item] = false;
    }
    totalAsyncCalls++;
    runFunctions(options , totalAsyncCalls);
    }
  let addFunction = function(method){
    composit[method.name] = undefined;
    propNames[method.name] = true;
    let functionPara = (method.toString().match(paraRegExp)[1]).split(',').map(item=>item.trim());
    functionPara.forEach(item => {
      composit[item] = undefined;
      propNames[item] = true;
    });
    liveFunctions.set(method , functionPara);
  }
  let addMethod = function(method){
    composit[method.name] = method;
  }
  let interceptor = function(affectedProp){
    let nestedPropHandler = {
      get: function( obj , prop , receiver) {

        if (typeof(obj[prop])=== "object"){
          return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);
        }else{
          return Reflect.get(obj , prop , receiver )
        }
      },
      set: function(obj , prop , value , receiver ){
        Reflect.set(obj , prop , value , receiver);
        let options={};
        options[affectedProp] = false;
        totalAsyncCalls++;
        runFunctions(options , totalAsyncCalls);
        return true;
      }
    }
    return nestedPropHandler;
  }
  let compositHandler = {
    set: function ( obj , prop , value , receiver ){
      if(prop == "addFunction" ||prop =="addMethod" || prop =="set" ) {
        throw console.error("Cannot overwrite this property.");
      }
      if (!(prop in propNames)){
        throw console.error("Cannot create new property here");
      }
      Reflect.set(obj , prop , value , receiver);
      let options={};
      options[prop] = false;
      totalAsyncCalls++;
      runFunctions(options , totalAsyncCalls);
      return true;
    },
    get: function ( obj , prop , receiver ){
      switch (prop){
        case "set":
        return setProperties;
        case "addFunction":
        return addFunction;
        case "addMethod":
        return addMethod;
      }
      if (obj[prop] === undefined) {
        if (prop in propNames){
          obj[prop] = {};
        }else{
          throw console.error(prop + " category not defined in function pools");
        }
      } 
      if (typeof(obj[prop]) === "object" ){
        return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(prop));
      }
      return Reflect.get(obj , prop , receiver );
    },
    deleteProperty: function(obj , prop){
      if (prop in obj) {
        obj[prop] = undefined;
        let options={};
        options[prop] = false;
        totalAsyncCalls++;
        runFunctions(options , totalAsyncCalls);
      }else{
        throw console.error("property not found.");
      }
    }

  }
  let validateComposit = new Proxy(composit , compositHandler);
  return validateComposit;
}