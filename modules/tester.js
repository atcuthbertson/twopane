define([],function(){
  var counter = 1;
  window.testObj = {};
  return function(){
    for(var i=0; i < arguments.length; i++){
      var fn = arguments[i];
      if(fn.name) testObj[fn.name] = fn;
      else testObj[counter++] = fn;
    }
  }
});
