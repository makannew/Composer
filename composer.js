let methodsComposite = function(){
  let composit = {};
  let methods = new Map();
  let runMethods = function(options){
    while(!(Object.keys(options).reduce(function(previous , current){return previous&&options[current]}, true ))){
      for (let item in options){
        if (!(options[item])){
          methods.forEach(function(value , key){
            if (value.includes(item)){
              if (value.reduce(function(previous , current){if (composit[current]===undefined){return false}else{return previous}}, true)){
                composit[key.name] = key(composit);
                options[key.name] = false; // Note: updating options during iteration may or may not effect but definitely will update in next cycle
              }
            }
          })
          options[item] = true;
        }
      }
    }
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
        options={};
        options[affectedProp] = false;
        runMethods(options);
        return true;
      }
    }
    return nestedPropHandler;
  }
  let compositHandler = {
    set: function ( obj , prop , value , receiver ){
      Reflect.set(obj , prop , value , receiver);
      options={};
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
    }
  }
  let validateComposit = new Proxy(composit , compositHandler);
  return validateComposit;
}