define([],function(){
  var queued = [];
  var subscribers = [];
  var firstLoad = 1;


  function push(service,func){
    queued.push({service:service,func:func,evt:null});

    service.on("load", function(evt){
      var serviceObj;

      if(firstLoad){
        firstLoad = 0;
        broadcast();
      }

      for(var i=0; i<queued.length; i++){
        serviceObj = queued[i];
        if(serviceObj.service === service){
          serviceObj.evt = evt;
          break;
        }
      }

      runNextIfLoaded(serviceObj);
    });
  }


  function runNextIfLoaded(serviceObj){
    if(serviceObj === queued[0] && serviceObj.service.loaded){
      queued.shift();
      serviceObj.func(serviceObj.evt);
      if(queued.length) runNextIfLoaded(queued[0]);
    }
  }


  function subscribe(func){
    subscribers.push(func);
  }


  function broadcast(){
    for(var i=0; i<subscribers.length; i++){
      subscribers[i](queued);
    }
  }


  return {
    push:push,
    subscribe:subscribe
  }

});