
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

  extend(newProp){
    if (Array.isArray(newProp)){
      for (let i=0 , len=newProp.length; i<len ; ++i){
        this.arr.push(newProp[i]);
      }
    }else{
      this.arr.push(newProp);
    }
  }

  clear(){
    this.arr = [];
  }
  isEqual(address){
    let len = this.arr.length;
    if (len!=address.arr.length){
      return false;
    }else{
      for (let i=len-1; i>-1 ;--i){
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
  const metaDataKey = Symbol.for("metaDataKey");
  const composite = {};
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const paraRegExp = /.*?\(\{([^)]*)\}\)/; 
  let addingLink = false;
  let removingLink = false;
  let nestedPropertiesCourier = {};

  const interceptor=function(localComposite , funcAddress , needsUpdate){
    let absoluteAddress= new Address();
    let relativeAddress= new Address(funcAddress.arr);
    relativeAddress.arr.pop();

    const interceptorProxy= new Proxy(localComposite,{

      set(obj , prop , value , receiver){
        absoluteAddress.extend(prop);
        if (!absoluteAddress.existIn(needsUpdate)){
          needsUpdate.push(new Address(absoluteAddress.arr));
        }
        Reflect.set(obj , prop , value , receiver);
      },

      get:function(obj , prop , receiver){
        if (obj == localComposite ){
          absoluteAddress = new Address(relativeAddress.arr);
        }
        if (prop == Symbol.unscopables){
          return undefined;
        }
        absoluteAddress.extend(prop);
        return Reflect.get(obj , prop , receiver);
      },

      has(obj , key){
        if (localComposite.hasOwnProperty(key)){
          return true;
        }
        return false;
      },

    })
    return interceptorProxy;
  }
  
  const runFunction = async function(funcAddress){
    let needsUpdate = [];
    let localComposite = funcAddress.getObject(composite);
    let currentAddress = new Address(funcAddress.arr);
    currentAddress.arr.pop();
    // call function
    localComposite[funcAddress.name()] = 
    await(funcAddress.getRefFrom(metaTree)[metaDataKey].function(
      localComposite , 
      composite , 
      interceptor(localComposite ,funcAddress , needsUpdate) , 
      composite[metaDataKey].compositeProxy,
      currentAddress.arr));

    needsUpdate.push(new Address(funcAddress.arr));
    manageUpdates(needsUpdate);
  }
  //
  composite[metaDataKey]= {updateQueue:[], metaTree: {} };
  let metaTree = composite[metaDataKey].metaTree;
  let updateQueue = composite[metaDataKey].updateQueue;


  const setProperties = function(options , setCurrentAdd){
    let currentComposite = setCurrentAdd.getRefFrom(composite);
    let needsUpdate=[];
    let itemAddress;
    Object.assign(currentComposite , options);
    for (let item in options){
      itemAddress = new Address(setCurrentAdd.arr);
      itemAddress.extend(item);
      needsUpdate.push(new Address (itemAddress.arr));
      if (!itemAddress.in(metaTree)){
        buildMetaPath(itemAddress);
      }
    }
    manageUpdates(needsUpdate);
  }

  const removeLink = function(){
    removingLink = false;
    let addresses = [];
    let newExternalLinks =[];
    // validating input addresses 
    if (arguments[1]) {
      for (let item of nestedPropertiesCourier.property){
        if (!item.existIn(addresses)){
          addresses.push(new Address(item.arr));
        }
        if (!item.in(metaTree)){
          throw console.error("removeLink address not found");
        }
      }
    }else{
      throw console.error("at least two address need for linking");
    }
    // remove linked addresses by only copying other links
    for (let i=0 ; i<addresses.length ; ++i){
      let externalLinks = addresses[i].getRefFrom(metaTree)[metaDataKey].externalLinks;
        for (let j=0; j<externalLinks.length ; ++j){
          if (!externalLinks[j].existIn(addresses) && !externalLinks[j].existIn(newExternalLinks)){
            newExternalLinks.push(new Address(externalLinks[j].arr));
          }
        }
        addresses[i].getRefFrom(metaTree)[metaDataKey].externalLinks = [...newExternalLinks];
        newExternalLinks = [];
        
    }
  }

  const addLink = function(){
    addingLink = false;
    let addresses = [];
    let finalAddresses =[];
    // validating input addresses 
    if (arguments[1]) {
      for (let item of nestedPropertiesCourier.property){
        if (!item.existIn(addresses)){
          addresses.push(new Address(item.arr));
        }
        if (!item.in(metaTree)){
          item.buildPath(composite);
          buildMetaPath(item)
        }
      }
    }else{
      throw console.error("at least two address need for linking");
    }
    finalAddresses = [...addresses];
    // add all already linked addresses to current link group
    for (let i=0 ; i<addresses.length ; ++i){
      let externalLinks = addresses[i].getRefFrom(metaTree)[metaDataKey].externalLinks;
        for (let j=0; j<externalLinks.length ; ++j){
          if (!externalLinks[j].existIn(addresses)){
            finalAddresses.push(new Address(externalLinks[j].arr));
          }
        }
    }
    // write a copy of addresses to each linked prop
    for (let i=0 ; i<finalAddresses.length ; ++i){
      let exceptSelf = finalAddresses.filter(value=> !finalAddresses[i].isEqual(value));
      finalAddresses[i].getRefFrom(metaTree)[metaDataKey].externalLinks = [...exceptSelf];
    }
    manageUpdates([...syncLinkedProps(addresses[0])]);
  }
  
  const addFunction = function(method , addFunctionCurrentAdd){
    let finalFunction;
    let functionPara =[];
    let finalPara;
    let importedFunction = splitFunction(method);
    let injectingFunction = function(){
      const proxiedComposite = arguments[3];
      const currentAddress = arguments[4];
    }
    let finalBody =  splitFunction(injectingFunction).body + "with (arguments[2]) {"+ importedFunction.body + "}" ;
    if (importedFunction.paraString){
      importedFunction.paraArray.forEach(item => { 
        let paraAddress = new Address(addFunctionCurrentAdd.arr);
        paraAddress.extend(item);
        functionPara.push(new Address(paraAddress.arr));
      });
      finalPara = "{" + importedFunction.paraString + "}";
    }else{
      throw console.error("Function must have at least one input parameter");
    }
    finalFunction = new AsyncFunction(finalPara , finalBody);

    Object.defineProperty(finalFunction , 'name', {
      value: method.name,
      configurable: true,
    })

    let methodAddress = new Address(addFunctionCurrentAdd.arr);
    methodAddress.extend(method.name);

    // if address is not available in metaTree build a new branch for function metadata
    if (!methodAddress.in(metaTree)){
      buildMetaPath(methodAddress);
    }
    // otherwise keep affectedFunctions data unchanged while overwriting other metadata
    let methodMeta = methodAddress.getRefFrom(metaTree)[metaDataKey];
    methodMeta.function = finalFunction ;
    methodMeta.type = "func";

    // set a new composite prop as method name if is not exist
    if (!methodAddress.in(composite)){
      methodAddress.buildPath(composite);
      methodAddress.getObject(composite)[method.name] = undefined;
    }
    
    for (let i=0 , len=functionPara.length ; i<len ; ++i){
      // add address as a function input parameter
      methodMeta.inputProps.push(new Address(functionPara[i].arr));
      // buil address in metaTree for function input parameters if they are not exist
      if (!functionPara[i].in(metaTree)){
        buildMetaPath(functionPara[i]);
      }

      // add external link to the function input parameter
      functionPara[i].getRefFrom(metaTree)[metaDataKey].affectedFunctions.push(new Address(methodAddress.arr));
      // set a new composite prop by function input parameters
      if(!functionPara[i].in(composite)){
        functionPara[i].buildPath(composite);
        functionPara[i].getObject(composite)[functionPara[i].name()] = undefined;
      }

    }
    //update newly added function
    if (allInputParaDefined(methodAddress)){
      runFunction(methodAddress);
    }
  }

  const buildMetaPath = function(address){
  let obj = metaTree;
    for (let i = 0, len = address.arr.length; i<len ; ++i){
      if (!obj.hasOwnProperty(address.arr[i])){
        Reflect.set(obj , address.arr[i] , {})
        obj[address.arr[i]][metaDataKey] = {type: "prop" , affectedFunctions:[] , inputProps: [] , externalLinks: []};
      }
      obj = Reflect.get(obj , address.arr[i]);
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


  const syncLinkedProps = function(prop){
    let externalLinks = prop.getRefFrom(metaTree)[metaDataKey].externalLinks;
    let updatedLinks = [];
    if (externalLinks.length==0) return externalLinks;
    let propObj = prop.getObject(composite);
    for (let i=0 , len = externalLinks.length ; i<len ; ++i){
      let linkedObj = externalLinks[i].getObject(composite);
      if (!(linkedObj[externalLinks[i].name()] === propObj[prop.name()])){
        linkedObj[externalLinks[i].name()] = propObj[prop.name()];
        updatedLinks.push(new Address(externalLinks[i].arr));
      }
    }
    return updatedLinks;
  }
  const manageUpdates = function(needsUpdate){
    // find and add affected overhead properties
    let ancestors = [];
    let linkUpdates = [];
    do{
      for (let i=0 , len=needsUpdate.length; i<len ; ++i){
        let item = new Address(needsUpdate[i].arr);
        while (item.arr.length>1){
          item.arr.pop();
          if (!item.existIn(ancestors) && !item.existIn(needsUpdate)){
            ancestors.push(new Address(item.arr));
          }
        }
      }
      for (let i=0 , len =ancestors.length ; i<len ; ++i){
        needsUpdate.push(new Address(ancestors[i].arr));
      }
      linkUpdates = [];
      for (let i=0 , len=needsUpdate.length; i<len ; ++i){
        linkUpdates.push(...syncLinkedProps(needsUpdate[i]));
      }
      if (linkUpdates.length>0){
        needsUpdate.push(...linkUpdates)
      }
    }while(linkUpdates.length>0);


    // find affected functions and put in queue if it doesn't already exist
    for (let i=0 , len=needsUpdate.length; i<len ; ++i){
      let affectedFunctions = needsUpdate[i].getRefFrom(metaTree)[metaDataKey].affectedFunctions;
      for (let j=0 , lenJ=affectedFunctions.length ; j<lenJ ; ++j){
        if (!(affectedFunctions[j].existIn(updateQueue))){
          if (allInputParaDefined(affectedFunctions[j])){
            updateQueue.push(new Address(affectedFunctions[j].arr));
          }
        }
      }
    }
    // run in queue functions
    while(updateQueue.length>0){
      runFunction(updateQueue.shift());
    }
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

  const changeAddressPrefix = function(addressArray , prefix , sourcePrefix){
    let sourcePrefixLen = sourcePrefix.length;
    for (let i=0, len=addressArray.length ; i<len ; ++i){
      addressArray[i] = new Address([...prefix,...addressArray[i].arr.slice(sourcePrefixLen)]);
    }
  }

  const adoptExternalLinks = function(externalLinks , prefix , sourcePrefix , adoptedComposite , thisIterationArr){
    let exLen=externalLinks.length;
    let sourceLen=sourcePrefix.length;
    if (exLen == 0 ) return;
    // check links if there is link to outside
    let i = 0;
    let linkToOutside = false;
    while (i<exLen && linkToOutside==false){
      let thisExLen = externalLinks[i].length;
      for (let j = 0;j<sourceLen;++j){
        if (j>=thisExLen || externalLinks[i].arr[j]!=sourcePrefix[j]){
          linkToOutside = true;
          break;
        }
      }
      ++i;
    }
    if (linkToOutside){
      // write a copy of addresses to each linked prop
      for (let i=0 ; i<exLen; ++i){
        externalLinks[i].getRefFrom(metaTree)[metaDataKey].externalLinks.push(new Address([...prefix,...thisIterationArr]));
      }
      externalLinks.push(new Address([...sourcePrefix , ...thisIterationArr]));
    }else{
      // replace source prefix by local prefix
      for (let i=0 ; i<exLen; ++i){
        externalLinks[i]= new Address([...prefix, ...externalLinks[i].arr.slice(sourceLen)]);
      }
    }

  }

  const copyComposite = function(value , currentAdd){
    if (!value["isCompositeProxy"]){
      throw console.error("Copying error");
    }

    Object.assign(currentAdd.getObject(composite)[currentAdd.name()], value["getProxyLessObject"]);

    let adoptedComposite = value["getParentComposite"];
    let sourceAddress = value["getCurrentAddress"];
    let adoptedMeta = sourceAddress.getRefFrom(adoptedComposite[metaDataKey].metaTree);
    let currentMetaAdd = currentAdd.getObject(metaTree)[currentAdd.name()];

    const iterate = function(obj , objClone , iterationArr){
      Object.keys(obj).forEach(prop=>{
        let thisIterationArr = [...iterationArr];
        thisIterationArr.push(prop);

        objClone[prop] = {};
        objClone[prop][metaDataKey] ={}
        Object.assign(objClone[prop][metaDataKey] , obj[prop][metaDataKey]);
        objClone[prop][metaDataKey].affectedFunctions = [...obj[prop][metaDataKey].affectedFunctions];
        objClone[prop][metaDataKey].inputProps = [...obj[prop][metaDataKey].inputProps];


        changeAddressPrefix(objClone[prop][metaDataKey].affectedFunctions , currentAdd.arr , sourceAddress.arr);
        changeAddressPrefix(objClone[prop][metaDataKey].inputProps, currentAdd.arr , sourceAddress.arr);

        objClone[prop][metaDataKey].externalLinks = [...obj[prop][metaDataKey].externalLinks];
        
        adoptExternalLinks(objClone[prop][metaDataKey].externalLinks, currentAdd.arr , sourceAddress.arr , adoptedComposite , thisIterationArr);

        if (typeof(obj[prop]) === "object" && obj[prop] != null){
          iterate(obj[prop] , objClone[prop] , thisIterationArr);
        }
      })
    }
    iterate(adoptedMeta , currentMetaAdd , []);
  }

  const compositeHandler = function(addressRecorder  , selfAddress){
    return {
    set: function ( obj , prop , value , receiver ){
      if (obj[metaDataKey] && obj === composite){
        addressRecorder = new Address()
      }
      if(selfAddress.arr.length>0){
        addressRecorder = new Address(selfAddress.arr);
      }

      addressRecorder.extend(prop);
      if (!addressRecorder.in(metaTree)){
        buildMetaPath(addressRecorder);
      }
      if (typeof(value) === "object" && value != null){
        if (value["isCompositeProxy"]){

          // adoptComposite(value["getParentComposite"] , new Address(addressRecorder.arr) , value.getCurrentAddress);
          // value = Object.assign({}, value["getProxyLessObject"]);
          //delete value[metaDataKey];
        }
      }

      Reflect.set(obj , prop , value , receiver);
      manageUpdates([new Address(addressRecorder.arr)]);
      addressRecorder = new Address()
      return true;
    },

    get: function ( obj , prop , receiver ){
      if (addingLink || removingLink) {
        if (prop.includes(",")){
          prop = prop.split(",");
        }
        if (obj[metaDataKey] && obj[metaDataKey].name == "courier"){
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].extend(prop);
        }else{
          nestedPropertiesCourier.property.push(new Address(selfAddress.arr));
          nestedPropertiesCourier.property[nestedPropertiesCourier.property.length-1].extend(prop);
        }
        return new Proxy(nestedPropertiesCourier, compositeHandler(addressRecorder , selfAddress));
      }

      if (obj[metaDataKey] && obj === composite){
        addressRecorder = new Address()
      }
      switch (prop){
        case "set":
          return function(){
            setProperties(arguments[0] , new Address(selfAddress.arr));
          }
        case "addFunction":
          return function(){
            addFunction(arguments[0] , new Address(selfAddress.arr));
          }
        case "addLink":
          addingLink = true;
          selfAddress = new Address();          
          nestedPropertiesCourier = {property:[]};
          nestedPropertiesCourier[metaDataKey] = {name:"courier"};
          return addLink;
        case "removeLink":
            removingLink = true;
            nestedPropertiesCourier = {property:[]};
            nestedPropertiesCourier[metaDataKey] = {name:"courier"};
            return removeLink;
        case "getParentComposite":
          return composite;
        case "isCompositeProxy":
          return true;
        case "getCurrentAddress":
          return new Address(addressRecorder.arr);
        case "getProxyLessObject":
          return addressRecorder.getRefFrom(composite);
        case "copy":
          return function(){
            copyComposite(arguments[0] , new Address(addressRecorder.arr));
          }
      }
      addressRecorder.extend(prop);
      let result = Reflect.get(obj , prop , receiver );
      if (typeof result === "object" && result != null){
        return new Proxy(result, compositeHandler(addressRecorder , new Address(addressRecorder.arr)));
      }
      return result;
    }
  }
}
  const compositeProxy = new Proxy(composite , compositeHandler(new Address() , new Address()));
  composite[metaDataKey].compositeProxy = compositeProxy;
  return compositeProxy;
}