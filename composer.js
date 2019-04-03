
export default function(){
  'use strict'

  let propNames = {};
  let liveFunctions = new Map();
  let updateStatus = {};
  // extract function parameters which should be in form of destructor object {para1 , para2 , ...}
  // x =  function({para1 , para2 , para3}) then para1 , para2 , para3 will match by Regular Expression
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

                resolvedMethod = await(method[0](composit , callNumber));
                if (callNumber != composit.validAsyncCall) return false;
                composit[method[0].name] = resolvedMethod;
                nextUpdates[method[0].name] = false; 
              }else{
                if (callNumber != composit.validAsyncCall) return false;
                composit[method[0].name] = undefined;
                nextUpdates[method[0].name] = false;
              }
            }
          }
        }
      }
      if (callNumber != composit.validAsyncCall){
        return false;
      }else{
        updateStatus = {};
        Object.assign(updateStatus , nextUpdates);
      }
    }

    if (callNumber != composit.validAsyncCall) {
      return false;
    }else{
      composit.validAsyncCall = undefined;
      if (composit.parentComposite){
        options={};
        options[composit.parentComposite.affectedProp] = false;
        composit.parentComposite.composit.validAsyncCall = Symbol();
        composit.parentComposite.callUpdate(options , composit.parentComposite.composit.validAsyncCall);
      }
      return true;
    }
  }

  let composit = {parentComposite: undefined , validAsyncCall:undefined , runFunctions: runFunctions};

  let setProperties = function(options){
    Object.assign(composit , options)
    for (let item in options){
      options[item] = false;
    }
    composit.validAsyncCall = Symbol();
    runFunctions(options , composit.validAsyncCall);
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

  let interceptor = function(affectedComposite , affectedProp){
    let nestedPropHandler = {
      get: function( obj , prop , receiver) {
        if (prop == "proxyType") return "interceptorProxy";

        if (typeof(obj[prop]) === "object" && obj[prop] != null) {
          if (obj["parentComposite"]){
            affectedComposite = obj;
            affectedProp = prop;
          }

          if (!(obj[prop]["proxyType"])){
            return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);
          }

          if (obj[prop]["proxyType"]=="compositeProxy"){
            obj[prop]["parentComposite"] = {callUpdate: runFunctions , affectedProp: affectedProp , composit: affectedComposite};
            return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);

          }
        }
        return Reflect.get(obj , prop , receiver );
        }
      ,
      set: function(obj , prop , value , receiver ){
        Reflect.set(obj , prop , value , receiver);
        let options={};
        options[affectedProp] = false;

        affectedComposite["validAsyncCall"] = Symbol();
        affectedComposite["runFunctions"](options , affectedComposite["validAsyncCall"]);
        return true;
      }
    }
    return nestedPropHandler;
  }
  let compositHandler = {
    set: function ( obj , prop , value , receiver ){
      if(prop == "addFunction" ||prop == "addMethod" || prop == "set" ) {
        throw console.error("Cannot overwrite this property.");
      }
      if (!(prop in propNames) && prop != "parentComposite"&& prop != "validAsyncCall"){
        throw console.error("Cannot create new property here");
      }
      if (typeof(value) === "object" && value != null){
        if (value["proxyType"]=="compositeProxy"){
          value["parentComposite"] = {callUpdate: runFunctions , affectedProp: prop , composit:composit};
          Reflect.set(obj , prop , value["getComposite"] , receiver);
          return true;
        }
      }

      Reflect.set(obj , prop , value , receiver);
      let options={};
      options[prop] = false;
      composit.validAsyncCall = Symbol();

      runFunctions(options , composit.validAsyncCall);
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
        case "getComposite":
        return composit;
        case "proxyType":
        return "compositeProxy"
      }
        if (typeof(obj[prop]) === "object" && obj[prop] != null){
          if (obj["parentComposite"]){
            return Reflect.get(obj , prop , receiver );
          }
          
          if (!(obj[prop]["proxyType"])){

            return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(obj , prop));
          }

        if (obj[prop]["proxyType"]=="compositeProxy"){
          obj[prop]["parentComposite"] = {callUpdate: runFunctions , affectedProp: prop , composit:composit};
          return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(obj , prop));

        }

      }
        return Reflect.get(obj , prop , receiver );
    },
    deleteProperty: function(obj , prop){
      if (prop in obj) {
        obj[prop] = undefined;
        let options={};
        options[prop] = false;
        composit.validAsyncCall = Symbol();

        runFunctions(options , composit.validAsyncCall);
      }else{
        throw console.error("property not found.");
      }
    }

  }
  let validateComposit = new Proxy(composit , compositHandler);
  return validateComposit;
}