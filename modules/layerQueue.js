define(["dojo/_base/array"],function(array){
  var queued = [];
  var subscribers = [];
  var firstLoad = 1;


  function push(service,func,needsUI){
    queued.push({service:service,func:func,needsUI:needsUI,evt:null});

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
      serviceObj.func(serviceObj);
      if(queued.length) runNextIfLoaded(queued[0]);
    }
  }


  function subscribe(func){
    subscribers.push(func);
  }


  function broadcast(){
    var uiQueued = array.filter(queued,function(service){
      return service.needsUI
    });

    array.forEach(subscribers,function(subFn,i){
      subFn(uiQueued);
    });
  }


  return {
    push:push,
    subscribe:subscribe
  }

});
