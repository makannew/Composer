let methodsComposite = function(){
  'use strict'
  let onLoad = undefined;
  let composit = {};
  let methods = new Map();
  let runMethods = async function(options){
    let updateStatus = {};
    let nextUpdates = {};
    Object.assign(updateStatus , options); // to keep track of the properties that need to be updated
      while(Object.keys(updateStatus).length){
      nextUpdates = {};
      for (let item in updateStatus){
        if (!(updateStatus[item])){
            for (let method of methods.entries()){
            if (method[1].includes(item)){
              if (method[1].reduce(function(previous , current){if (composit[current]===undefined){return false}else{return previous}}, true)){
                composit[method[0].name] = await(method[0](composit));
                nextUpdates[method[0].name] = false; 
              }else{
                composit[method[0].name] = undefined;
                nextUpdates[method[0].name] = false;
              }
            }
          }
        }
      }
      updateStatus = {};
      Object.assign(updateStatus , nextUpdates);
    }
    if (composit.onLoad != undefined) {
      composit.onLoad()
    };
  }
  let setProperties = function(options){
    Object.assign(composit , options)
    for (let item in options){
      options[item] = false;
    }
    runMethods(options);
    }
  let addMethod = function(method){
    composit[method.name] = undefined;
    method().forEach(item => composit[item] = undefined);
    methods.set(method , method());
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
        runMethods(options);
        return true;
      }
    }
    return nestedPropHandler;
  }
  let compositHandler = {
    set: function ( obj , prop , value , receiver ){
      if(prop =="addMethod" || prop =="set") {
        throw console.error("Cannot overwrite this property.");
      }
      Reflect.set(obj , prop , value , receiver);
      if (prop == "onLoad"){
        return true;
      }
      let options={};
      options[prop] = false;
      runMethods(options);
      return true;
    },
    get: function ( obj , prop , receiver ){
      switch (prop){
        case "set":
        return setProperties;
        case "addMethod":
        return addMethod;
      }
      if (typeof(obj[prop]) === "object"){
        return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(prop));
      }
      return Reflect.get(obj , prop , receiver );
    },
    deleteProperty: function(obj , prop){
      if (prop in obj) {
        obj[prop] = undefined;
        let options={};
        options[prop] = false;
        runMethods(options);
      }else{
        throw console.error("property not found.");
        
      }
    }

  }
  let validateComposit = new Proxy(composit , compositHandler);
  return validateComposit;
}