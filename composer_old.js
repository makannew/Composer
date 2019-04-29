  //const globalObject = Function('return this')();
  const metaDataKey = Symbol.for("metaDataKey")
  const composite = {};
  //const _glob = typeof global !== 'undefined' ? global : self;

  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
  let affectedComposite = composite;
  let affectedProp;
  let absoluteAddress;



  //const propNames = {};
  //const liveFunctions = new Map();
  //let updateStatus = {};
  let addingFunction = false;
  let nestedPropertiesCourier = {};
  // extract function parameters which should be in form of destructor object {para1 , para2 , ...}
  // x =  function({para1 , para2 , para3}) then para1 , para2 , para3 will match by Regular Expression
  const paraRegExp = /.*?\(\{([^)]*)\}\)/; 
  // const isValidCall = function(callNumber){
  //   if (callNumber == composite[metaDataKey].validAsyncCall){
  //     return true;
  //   }else{
  //     return false;
  //   }
  // }
  const interceptor=function(composite){
    const metaDataKey = Symbol.for("metaDataKey");

    const mainComposite = composite.metaDataKey.grandParent;
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
  //  const globalProxyCreator = function (composite){
  //       const metaDataKey = Symbol.for("metaDataKey");
  //       let absoluteAddress;
  //       let nearestComposite = composite;
  //       let affectedProp;
  //       const argumentHandler = {
  //         set: function ( obj , prop , value , receiver ){
  //           if (obj[metaDataKey]){
  //             nearestComposite = obj;
  //             affectedProp = prop;
  //         }
  //           if (absoluteAddress){
  //            absoluteAddress+= "." + prop;
  //           }else{
  //            absoluteAddress = prop;
  //           }
  //           composite[metaDataKey].insideFunctionUpdates[absoluteAddress]={composite: nearestComposite , affectedProp: affectedProp };
  //           console.log("some part setting to globale" , absoluteAddress)

  //           Reflect.set(obj , prop , value , receiver);
  //         },
  //         get: function ( obj , prop , receiver ){
  //           if (obj[metaDataKey]){
  //               if (obj == composite){
  //                absoluteAddress = undefined;
  //               }
  //               nearestComposite = obj;
  //               affectedProp = prop;
  //           }
  
  //           if (absoluteAddress){
  //            absoluteAddress+= "." + prop;
  //          }else{
  //            absoluteAddress=prop;
  //          }
  
  //          if (typeof(obj[prop]) === "object" && obj[prop] != null){
  //              return new Proxy(Reflect.get(obj , prop , receiver ), argumentHandler);
  //             }
  //            return Reflect.get(obj , prop , receiver );
  //         }
  //         }
  //         return new Proxy(composite , argumentHandler);
  //         }
  //         if (compositeGlobalName){
  //           _glob[compositeGlobalName] = globalProxyCreator(composite);
  //         }
        
  const runFunctions = async function({options , liveFunctions , composite } , callNumber ){
    //console.log(Date.now())

    let updateStatus={};
    Object.assign(updateStatus , options); // to keep track of the properties that needs to be updated
    //options ={};
    //let nextUpdates = {};
   // let newAffectedProps={};
    let resolvedMethod;
    let compositeMetaData = composite[metaDataKey];
  //    while(Object.keys(updateStatus).length){
  //    nextUpdates = {};
      for (let item in updateStatus){
       // if (!(updateStatus[item])){
            for (let method of liveFunctions.entries()){
            if (method[1].includes(item)){
              if (method[1].reduce(function(previous , current){if (composite[current]===undefined){return false}else{return previous}}, true)){
                resolvedMethod = await(method[0](composite ,composite.metaDataKey.interceptor ,callNumber ));
                if (composite[method[0].name] != resolvedMethod){
                  composite[method[0].name] = resolvedMethod;
                  options[method[0].name] = false; 
                }
               // if (resolvedMethod!= undefined) {
                 // composite[method[0].name] = resolvedMethod;
               // }


              }
              // else{
              //   if (callNumber != composite[metaDataKey].validAsyncCall) return false;
              //   composite[method[0].name] = undefined;
              //   nextUpdates[method[0].name] = false;
              // }
            }
          }
          delete options[item];

          if (callNumber != compositeMetaData.validAsyncCall) return false;

       // }
      }
      // if (callNumber != composite[metaDataKey].validAsyncCall){
      //   return false;
      // }
    //else{
        //updateStatus = {};
       // Object.assign(updateStatus , nextUpdates);
       // Object.assign(newAffectedProps , nextUpdates);
   //   }
  //  }
    if (callNumber != compositeMetaData.validAsyncCall) {
      return false;
    }else{
      //compositeMetaData.validAsyncCall = undefined;
      //compositeMetaData.options = {};
      //Object.assign(compositeMetaData.options , nextUpdates);

      // here update insideFunctionUpdates
      if(Object.keys(compositeMetaData.insideFunctionUpdates).length!=0){
        let immidiateOptions = {};
        let absoluteOptions = {};
        let insideFunctionUpdates = {...compositeMetaData.insideFunctionUpdates};
        compositeMetaData.insideFunctionUpdates={};
        for (let item in insideFunctionUpdates){
          absoluteOptions[item] = false;
          immidiateOptions[insideFunctionUpdates[item].affectedProp] = false;
          callUpdates(insideFunctionUpdates[item].composite , immidiateOptions , absoluteOptions);
        }

      }
      if (Object.keys(options).length!=0){
        callUpdates(composite); 
      }
      if (compositeMetaData.parentComposite){
        let parentComposite = compositeMetaData.parentComposite.composite;
        let affectedProp = compositeMetaData.parentComposite.affectedProp;
        let immidiateOptions = {};
        let absoluteOptions = {};
        immidiateOptions[affectedProp] = false;
        if (compositeMetaData.absoluteAddress){
          absoluteOptions[compositeMetaData.absoluteAddress] = false;
        } 
        callUpdates(parentComposite , immidiateOptions , absoluteOptions);
      }

      // if (composite[metaDataKey].parentComposite){ // it needs change, call updates for all affected immidiate props for this composite + 
      //   let thisParent = composite[metaDataKey].parentComposite;// call update for immidiate address of affected prop and absolute address of this composite on parent composite
      //   let thisParentMeta = thisParent["composite"][metaDataKey];
      //   thisParentMeta.options[thisParent.affectedProp] = false;
      //   thisParentMeta.validAsyncCall = Symbol();
      //   thisParentMeta["runFunctions"](thisParentMeta , thisParentMeta.validAsyncCall);
      // }
      // if (composite[metaDataKey].parentComposite){

      //   options={};
      //   options[composite[metaDataKey].parentComposite.affectedProp] = false;
      //   composite[metaDataKey]["parentComposite"]["composite"][metaDataKey].validAsyncCall = Symbol();
      //   composite[metaDataKey]["parentComposite"]["composite"][metaDataKey]["runFunctions"]
      //   (options , composite[metaDataKey]["parentComposite"]["composite"][metaDataKey].validAsyncCall);
      // }
      return true;
    }
  }
  // composite[metaDataKey]= {parentComposite: undefined , options:{} , liveFunctions: new Map() , callNumber: undefined ,  
  //   validAsyncCall:undefined , runFunctions: runFunctions , update:(items)=>{
  //   let options={};
  //   options[items] = false;
  //   composite[metaDataKey].validAsyncCall = Symbol();
  //   composite[metaDataKey]["runFunctions"](options , composite[metaDataKey].validAsyncCall);
  // }};
  composite[metaDataKey]= {parentComposite: undefined , options:{} , liveFunctions: new Map() , composite: composite, grandParent: composite , 
  validAsyncCall:undefined , runFunctions: runFunctions , absoluteAddress: undefined , externalAddresses: {} , externalComposites: new Map() ,
  insideFunctionUpdates:{}, interceptor: interceptor,
//   , update:(items)=>{
//     composite[metaDataKey].validAsyncCall = Symbol();
//     composite[metaDataKey].options[items] = false;
//     composite[metaDataKey]["runFunctions"](composite[metaDataKey]);

//   // let options={};
//   // options[items] = false;
//   // composite[metaDataKey].validAsyncCall = Symbol();
//   //composite[metaDataKey]["runFunctions"](options , composite[metaDataKey].validAsyncCall);
// }
  };
  const setProperties = function(options){
    Object.assign(affectedComposite , options)
    for (let item in options){
      options[item] = false;
    }
    //console.log(getAbsoluteAddress(options , affectedComposite));
    callUpdates(affectedComposite , options);
    // affectedComposite[metaDataKey].validAsyncCall = Symbol();
    // affectedComposite[metaDataKey].options= options;
    // affectedComposite[metaDataKey].runFunctions(affectedComposite[metaDataKey] , affectedComposite[metaDataKey].validAsyncCall);

    // composite[metaDataKey].validAsyncCall = Symbol();
    // composite[metaDataKey]["runFunctions"](options , composite[metaDataKey].validAsyncCall);
    }
  const addFunction = function(){
    addingFunction = false;
    let method = arguments[0];
    let finalFunction;
    let functionPara =[];
    let importedFunction = splitFunction(method);

 
    let functionHeader = function(){


    }
      //const metaDataKey = Symbol.for("metaDataKey");
      //const currentComposite = arguments[0];
      // const grandParentComposite = arguments[1]
      // const thisFunctionCallNumber = arguments[2];
      // const compositeMetaData = arguments[0][metaDataKey];
      // const isValidCall = function(){
      //   if (thisFunctionCallNumber == compositeMetaData.validAsyncCall){
      //     return true
      //   }else{
      //     console.log("is valid false");
      //   return false;
      //   }
      // }
      // const globalCompositeCreator = function (composite){
      //   const metaDataKey = Symbol.for("metaDataKey");
      //   let absoluteAddress;
      //   let nearestComposite = composite;
      //   let affectedProp;
      //   const argumentHandler = {
      //     set: function ( obj , prop , value , receiver ){
      //       if (obj[metaDataKey]){
      //         nearestComposite = obj;
      //         affectedProp = prop;
      //     }
      //       if (absoluteAddress){
      //        absoluteAddress+= "." + prop;
      //       }else{
      //        absoluteAddress = prop;
      //       }
      //       composite[metaDataKey].insideFunctionUpdates[absoluteAddress]={composite: nearestComposite , affectedProp: affectedProp };
      //       Reflect.set(obj , prop , value , receiver);
      //     },
      //     get: function ( obj , prop , receiver ){
      //       if (obj[metaDataKey]){
      //           if (obj == composite){
      //            absoluteAddress = undefined;
      //           }
      //           nearestComposite = obj;
      //           affectedProp = prop;
      //       }
  
      //       if (absoluteAddress){
      //        absoluteAddress+= "." + prop;
      //      }else{
      //        absoluteAddress=prop;
      //      }
  
      //      if (typeof(obj[prop]) === "object" && obj[prop] != null){
      //          return new Proxy(Reflect.get(obj , prop , receiver ), argumentHandler);
      //         }
      //        return Reflect.get(obj , prop , receiver );
      //     }
      //     }
      //     return new Proxy(composite , argumentHandler);
      //     }
      // const globalComposite = globalCompositeCreator(grandParentComposite);

    let injectingCodes = splitFunction(functionHeader).body;
    let injectingPara = [];
    let varList ={};

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
        functionPara.push(propAddress);
        let externalAddresses = nearestComposite[metaDataKey].externalAddresses;
        let externalComposites = nearestComposite[metaDataKey].externalComposites;

        // indexed object for fast address matching
        if (propAddress in externalAddresses){
          if (!externalAddresses[propAddress].includes(affectedComposite)){
            externalAddresses[propAddress].push(affectedComposite);
          }
        }else{
          externalAddresses[propAddress] = [affectedComposite];
        }

        // indexed map for fast composite maching
        if (externalComposites.has(affectedComposite)){
          if (!externalAddresses.get(affectedComposite).includes(propAddress)){
            externalAddresses.get(affectedComposite).push(propAddress);
          }
        }else{
          externalComposites.set(affectedComposite , [propAddress]);
        }

        let varName = item[item.length - 1];
        if (varName in varList){
          varList[varName].push(" = arguments[1]." + propAddress + ";");
        }else{
          varList[varName] = [];
          varList[varName].push(" = arguments[1]." + propAddress + ";");
        }
      }


      for (let item in varList){
        if (varList[item].length > 1){
          injectingPara.push("let " + item + " = [];");
          for (let i=0;i<varList[item].length;++i){
            injectingPara.push(item + "[" + i + "]" + varList[item][i]);
          }
        }else{
          injectingPara.push("let " + item + varList[item][0]);
        }
      }
    }
    //
//     if (importedFunction.paraString){
//       for (let item of importedFunction.paraArray){
//         if (item in varList){
// console.log(item , "is duplicated")
//         }else{
//           injectingPara.push("let " + item + " = " + item + ";");

//         }
//       }
//     }
    //let finalBody =  injectingPara.join('\n') + injectingCodes + 'with(arguments[3]){' + importedFunction.body + '}';
    let finalBody =  injectingPara.join('\n') + injectingCodes + importedFunction.body ;

    let finalPara;
    if (importedFunction.paraString){

      importedFunction.paraArray.forEach(item => { functionPara.push(item)});
      finalPara = "{" + importedFunction.paraString + "}";
    }else{
      finalPara = "";
    }
    //console.log(finalBody)
    finalFunction = new AsyncFunction(finalPara , finalBody);
    Object.defineProperty(finalFunction , 'name', {
      value: method.name,
      configurable: true,
    })
    //
    // for (let item in _glob){
    //   if (!/webkitStorageInfo|webkitIndexedDB/.test(item) && _glob[item]&& _glob[item]==finalFunction){
    //     console.log("name is:", item);

    //   }
    // }
    //
    affectedComposite[method.name] = undefined;
    functionPara.forEach(item => {
      if (!(item in affectedComposite)){
        affectedComposite[item] = undefined;
      };
    });
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
  const absoluteCallUpdates = function(absoluteAddresses){

  }
  const callUpdates = function(composite , immidiateOptions , absoluteOptions ){

    let absoluteOfImmidiate;
    let allAbsoluteOptions = {};
    let compositeMetaData = composite[metaDataKey];
    if (immidiateOptions==undefined && absoluteOptions==undefined){
      compositeMetaData.validAsyncCall = Symbol();
      compositeMetaData.runFunctions(compositeMetaData , compositeMetaData.validAsyncCall)
    }
    if (immidiateOptions){
      absoluteOfImmidiate = {};
      let prefix = "";
      if (compositeMetaData.absoluteAddress){
          prefix = compositeMetaData.absoluteAddress + ".";
      }
      for (let item in immidiateOptions){
        absoluteOfImmidiate[prefix + item] = false;
      }
      compositeMetaData.validAsyncCall = Symbol();
      Object.assign(compositeMetaData.options , immidiateOptions);
      compositeMetaData.runFunctions(compositeMetaData , compositeMetaData.validAsyncCall)
    }

    Object.assign(allAbsoluteOptions , absoluteOptions , absoluteOfImmidiate);
    //Object.assign(immidiateOptions , allAbsoluteOptions);
    // if (Object.keys(immidiateOptions).length != 0){
    //   compositeMetaData.validAsyncCall = Symbol();
    //   Object.assign(compositeMetaData.options , immidiateOptions);
    //   compositeMetaData.runFunctions(compositeMetaData , compositeMetaData.validAsyncCall)
    // }

    //
    let externalAddresses = compositeMetaData.externalAddresses;
    let allAffectedComposites = [];
    for (let item in allAbsoluteOptions){
      if (item in externalAddresses){
        allAffectedComposites = [...allAffectedComposites, ...externalAddresses[item]];
      }
    }
    allAffectedComposites = Array.from(new Set(allAffectedComposites));
    if (allAffectedComposites.length){
      let externalComposites = compositeMetaData.externalComposites;
      for (let item of allAffectedComposites){
        let affectedAddresses = externalComposites.get(item).reduce(function(acc,cur){
          if (cur in allAbsoluteOptions){
            acc[cur] = false; 
          }
           return acc;
          } , {});
        Object.assign(item , affectedAddresses);
        item[metaDataKey].validAsyncCall = Symbol();
        Object.assign(item[metaDataKey].options , affectedAddresses)
        item[metaDataKey].runFunctions(item[metaDataKey] , item[metaDataKey].validAsyncCall);
      }
    }


    // if (absoluteAddress in affectedComposite[metaDataKey].externalAddresses){
    //   let externalComposites = affectedComposite[metaDataKey].externalAddresses[absoluteAddress]
    //   for (let composite of externalComposites){
    //     let compositeMetaData = composite[metaDataKey];
    //     composite[absoluteAddress] = value;
    //     compositeMetaData.validAsyncCall = Symbol();
    //     compositeMetaData.options[absoluteAddress] = false;
    //     compositeMetaData.runFunctions(compositeMetaData , compositeMetaData.validAsyncCall);
    //   }
    // }
  }
  // const interceptor = function(affectedComposite , affectedProp){
  //   let nestedPropHandler = {
  //     get: function( obj , prop , receiver) {
  //       if (prop == "proxyType") return "interceptorProxy";
  //       if (typeof(obj[prop]) === "object" && obj[prop] != null) {
  //         if (obj[metaDataKey] && obj[metaDataKey]["parentComposite"]){
  //           affectedComposite = obj["getComposite"];
  //           affectedProp = prop;
  //         }
  //         if (!(obj[prop]["proxyType"])){
  //           return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);
  //         }
  //         if (obj[prop]["proxyType"]=="compositeProxy"){
  //           obj[prop][metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
  //           obj[prop][metaDataKey]["grandParent"] = composite[metaDataKey].grandParent;

  //           return new Proxy(Reflect.get(obj , prop , receiver ), nestedPropHandler);
  //         }
  //       }
  //       return Reflect.get(obj , prop , receiver );
  //       }
  //     ,
  //     set: function(obj , prop , value , receiver ){

  //       Reflect.set(obj , prop , value , receiver);
  //       let options={};
  //       options[affectedProp] = false;
  //       affectedComposite[metaDataKey]["validAsyncCall"] = Symbol();
  //       affectedComposite[metaDataKey]["runFunctions"](options , affectedComposite[metaDataKey]["validAsyncCall"]);
  //       return true;
  //     }
  //   }
  //   return nestedPropHandler;
  // }
  // const interceptor = function(){
  //   let affectedProp = composite;
    const compositeHandler = {
      set: function ( obj , prop , value , receiver ){
        // if (!(prop in propNames)){
        //   throw console.error("Cannot create new property here");
        // }
        if (absoluteAddress){
          absoluteAddress+= "." + prop;
        }else{
          absoluteAddress = prop;

        }

        if (typeof(value) === "object" && value != null){
          if (value["isCompositeProxy"]){
            value = value["getProxylessComposite"];
            //affectedProp = prop;
            value[metaDataKey].grandParent = composite; // adopting external composite
            value[metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
            value[metaDataKey].absoluteAddress = absoluteAddress;
            // Reflect.set(obj , prop , value , receiver); // here consider for external update
            // return true;
          }
          // if (value["proxyType"]=="compositeProxy"){
          //   value[metaDataKey]["parentComposite"] = {affectedProp: prop , composite:composite};
          //   obj[prop][metaDataKey]["grandParent"] = composite[metaDataKey].grandParent;
          //   Reflect.set(obj , prop , value["getComposite"] , receiver);
          //   return true;
          // }
        }
        Reflect.set(obj , prop , value , receiver);
        // let options={};
        // options[prop] = false;
        //console.log(affectedComposite ,affectedProp)
        if (obj[metaDataKey]){
          affectedProp = prop;
        }
        //
        // if (absoluteAddress in affectedComposite[metaDataKey].externalAddresses){
        //   let externalComposites = affectedComposite[metaDataKey].externalAddresses[absoluteAddress]
        //   for (let composite of externalComposites){
        //     let compositeMetaData = composite[metaDataKey];
        //     composite[absoluteAddress] = value;
        //     compositeMetaData.validAsyncCall = Symbol();
        //     compositeMetaData.options[absoluteAddress] = false;
        //     compositeMetaData.runFunctions(compositeMetaData , compositeMetaData.validAsyncCall)
        //   }
        // }
        //
        //affectedComposite[metaDataKey].validAsyncCall = Symbol();
        //affectedComposite[metaDataKey].options[affectedProp] = false; 
        let immidiateOptions = {};
        let absoluteOptions = {};
        immidiateOptions[affectedProp] = false;
        absoluteOptions[absoluteAddress] = false;
        //affectedComposite[metaDataKey].runFunctions(affectedComposite[metaDataKey] , affectedComposite[metaDataKey].validAsyncCall );
        callUpdates(affectedComposite , immidiateOptions , absoluteOptions )
        return true;
      },
      get: function ( obj , prop , receiver ){
        //console.log("aaa var is:" , aaa);
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
            absoluteAddress = undefined;
          }
          // else{
          //   //console.log(obj)
          //   obj[metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
          //   affectedComposite = obj;
          // }
          affectedProp = prop;
        }
        if (absoluteAddress){
          absoluteAddress+= "." + prop;
        }else{
          absoluteAddress=prop;
        }

        if (typeof(obj[prop]) === "object" && obj[prop] != null){

          if (obj[prop][metaDataKey]){
            //console.log(prop)
            obj[prop][metaDataKey]["parentComposite"] = {affectedProp: affectedProp , composite: affectedComposite};
            affectedComposite = obj[prop];
            //affectedProp = prop;
          }
          //console.log(affectedProp)
          return new Proxy(Reflect.get(obj , prop , receiver ), compositeHandler);

          // if (obj[metaDataKey] && obj[metaDataKey]["parentComposite"]){
          //   return Reflect.get(obj , prop , receiver );
          // }


          // if (!(obj[prop]["proxyType"])){
          //   return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(obj , prop));
          // }

        // if (obj[prop]["proxyType"]=="compositeProxy"){
        //   obj[prop][metaDataKey]["parentComposite"] = {affectedProp: prop , composite:composite};
        //   obj[prop][metaDataKey]["grandParent"] = composite[metaDataKey].grandParent;
        //   return new Proxy(Reflect.get(obj , prop , receiver ), interceptor(obj , prop));
        // }
      }
          //console.log(affectedProp)
        
        return Reflect.get(obj , prop , receiver );
      }

    }
  //   return compositeHandler;
  // }