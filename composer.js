
export default function(){
  'use strict'
  const compositeMetaData = Symbol.for("compositeMetaData")
  const composite = {};
  const propNames = {};
  const liveFunctions = new Map();
  let updateStatus = {};
  // extract function parameters which should be in form of destructor object {para1 , para2 , ...}
  // x =  function({para1 , para2 , para3}) then para1 , para2 , para3 will match by Regular Expression
  const paraRegExp = /.*?\(\{([^)]*)\}\)/; 
  const isValidCall = function(callNumber){
    if (callNumber == composite[compositeMetaData].validAsyncCall){
      return true;
    }else{
      return false;
    }
  }
  const runFunctions = async function(options , callNumber){
    Object.assign(updateStatus , options); // to keep track of the properties that needs to be updated
    let nextUpdates = {};
    let resolvedMethod;
      while(Object.keys(updateStatus).length){
      nextUpdates = {};
      for (let item in updateStatus){
        if (!(updateStatus[item])){
            for (let method of liveFunctions.entries()){
            if (method[1].includes(item)){
              if (method[1].reduce(function(previous , current){if (composite[current]===undefined){return false}else{return previous}}, true)){
                resolvedMethod = await(method[0](composite , isValidCall ,callNumber , composite[compositeMetaData]["update"]));
                if (callNumber != composite[compositeMetaData].validAsyncCall) return false;
                composite[method[0].name] = resolvedMethod;
                nextUpdates[method[0].name] = false; 
              }else{
                if (callNumber != composite[compositeMetaData].validAsyncCall) return false;
                composite[method[0].name] = undefined;
                nextUpdates[method[0].name] = false;
              }
            }
          }
        }
      }
      if (callNumber != composite[compositeMetaData].validAsyncCall){
        return false;
      }else{
        updateStatus = {};
        Object.assign(updateStatus , nextUpdates);
      }
    }
    if (callNumber != composite[compositeMetaData].validAsyncCall) {
      return false;
    }else{
      composite[compositeMetaData].validAsyncCall = undefined;
      if (composite[compositeMetaData].parentComposite){
        options={};
        options[composite[compositeMetaData].parentComposite.affectedProp] = false;
        composite[compositeMetaData]["parentComposite"]["composite"][compositeMetaData].validAsyncCall = Symbol();
        composite[compositeMetaData]["parentComposite"]["composite"][compositeMetaData]["runFunctions"]
        (options , composite[compositeMetaData]["parentComposite"]["composite"][compositeMetaData].validAsyncCall);
      }
      return true;
    }
  }
  composite[compositeMetaData]= {parentComposite: undefined , validAsyncCall:undefined , runFunctions: runFunctions , update:(items)=>{
    let options={};
    options[items] = false;
    composite[compositeMetaData].validAsyncCall = Symbol();
    composite[compositeMetaData]["runFunctions"](options , composite[compositeMetaData].validAsyncCall);
  }};
  const setProperties = function(options){
    Object.assign(composite , options)
    for (let item in options){
      options[item] = false;
    }
    composite[compositeMetaData].validAsyncCall = Symbol();
    composite[compositeMetaData]["runFunctions"](options , composite[compositeMetaData].validAsyncCall);
    }
  const addFunction = function(method){
    composite[method.name] = undefined;
    propNames[method.name] = true;
    let functionPara = (method.toString().match(paraRegExp)[1]).split(',').map(item=>item.trim());
    functionPara.forEach(item => {
      if (!(item in composite)){
        composite[item] = undefined;
        propNames[item] = true;
      };
    });
    liveFunctions.set(method , functionPara);
  }
  const addMethod = function(method){
    composite[method.name] = method;
  }
  const interceptor = function(affectedComposite , affectedProp){
    let nestedPropHandler = {
      get: function( obj , prop , receiver) {
        if (prop == "proxyType") return "interceptorProxy";

        if (typeof(obj[prop]) === "object" && obj[prop] != null) {
          if (obj[compositeMetaData] && obj[compositeMetaData]["parentComposite"]){
            affectedComposite = obj["getComposite"];
            affectedProp = prop;
          }
          if (!(obj[prop]["proxyType"])){
            return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);
          }

          if (obj[prop]["proxyType"]=="compositeProxy"){
            obj[prop][compositeMetaData]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
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

        affectedComposite[compositeMetaData]["validAsyncCall"] = Symbol();
        affectedComposite[compositeMetaData]["runFunctions"](options , affectedComposite[compositeMetaData]["validAsyncCall"]);
        return true;
      }
    }
    return nestedPropHandler;
  }
  const compositHandler = {
    set: function ( obj , prop , value , receiver ){
      if (!(prop in propNames)){
        throw console.error("Cannot create new property here");
      }
      if (typeof(value) === "object" && value != null){
        if (value["proxyType"]=="compositeProxy"){
          value[compositeMetaData]["parentComposite"] = {affectedProp: prop , composite:composite};
          Reflect.set(obj , prop , value["getComposite"] , receiver);
          return true;
        }
      }
      Reflect.set(obj , prop , value , receiver);
      let options={};
      options[prop] = false;
      composite[compositeMetaData].validAsyncCall = Symbol();
      composite[compositeMetaData]["runFunctions"](options , composite[compositeMetaData].validAsyncCall);
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
        return composite;
        case "proxyType":
        return "compositeProxy"
      }
        if (typeof(obj[prop]) === "object" && obj[prop] != null){
          if (obj[compositeMetaData] && obj[compositeMetaData]["parentComposite"]){
            return Reflect.get(obj , prop , receiver );
          }
          if (!(obj[prop]["proxyType"])){
            return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(obj , prop));
          }

        if (obj[prop]["proxyType"]=="compositeProxy"){
          obj[prop][compositeMetaData]["parentComposite"] = {affectedProp: prop , composite:composite};
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
        composite[compositeMetaData].validAsyncCall = Symbol();
        composite[compositeMetaData]["runFunctions"](options , composite[compositeMetaData].validAsyncCall);
      }else{
        throw console.error("property not found.");
      }
    }
  }
  return new Proxy(composite , compositHandler);
}