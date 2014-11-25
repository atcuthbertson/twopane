define([
  "dojo/on",
  "modules/toggleLayer.js"
],

function(
  on,
  toggleLayer
){

  var resolvers = [];

  function init(node){
    on(node, "click", clearAll);
  }

  function clear(resolver){
    var layerObjects = resolver.getRegistered();
    for(var i=0; i< layerObjects.length; i++){
      var layerObj = layerObjects[i];
      if(layerObj.check.checked){
        layerObj.check.checked = false;
        toggleLayer.toggle(resolver.resolve(layerObj.check));
      }
    }
  } 
  
  function clearAll(){
    for(var i=0; i<resolvers.length; i++){
      clear(resolvers[i]);
    }
  }

  function register(func){
    resolvers.push(func);
  }

  return {
    init:init,
    register:register
  }
});
