define([],function(){
  var checks = {};

  function resolve(check){
    var obj = checks[check.id];
    return obj.fn(obj.services);
  }

  function register(check,service,fn){
    var id = check.id;
    if(checks[id]){
      checks[id].services.push(service);
    }else{
      checks[id] = {fn:fn,check:check,services:[service]}
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
})