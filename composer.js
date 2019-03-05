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
  let addProperties = function(method){
    composit[method.name] = undefined;
    methods.set(method , method());
  }
  let getProperties = function(prop){
    return composit[prop];
  }
  let handler = {
    set: function ( obj , prop , value ){
      obj[prop] = value;
      options={};
      options[prop] = false;
      runMethods(options);
    },
    get: function ( obj , prop ){
      switch (prop){
        case "set":
        return setProperties;
        case "add":
        return addProperties;
        case "get":
        return getProperties;
      }

      throw console.error("You cannot access properties this way.");
      
    }
  }
  let validateComposit = new Proxy(composit , handler);
  return validateComposit;
}