define([],function(){

  return function(resolvingFn){
    var checks = {};


    function resolve(check){
      var obj = checks[check.id];
      return resolvingFn(obj.services);
    }


    function register(check,service){
      var id = check.id;
      if(checks[id]){
        checks[id].services.push(service);
      }else{
        checks[id] = {check:check,services:[service]}
      }
    }


    function getRegistered(){
      var registered = [];
      for(var id in checks){
        registered.push(checks[id]); 
      }
      return registered;
    }


    return {
      resolve:resolve,
      register:register,
      getRegistered:getRegistered
    }
  }
})