define(["dojo/on"],function(on){

  var clearingFns = [];

  function init(node){
    on(node, "click", clearAll);
  }

  function clearAll(){
    for(var i=0; i<clearingFns.length; i++){
      clearingFns[i]();
    }
  }

  function register(func){
    clearingFns.push(func);
  }

  return {
    init:init,
    register:register
  }
});