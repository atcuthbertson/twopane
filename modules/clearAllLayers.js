define(["dojo/on"],function(on){

  function init(node){
    on(node, "click", clearAll);
  }

  function clearAll(){
    console.log("clearing")
  }

  function register(layer){

  }
  return {
    init:init,
    register:register
  }
});