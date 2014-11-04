define(["dojo/on"],function(on){
  var queued = [];


  function push(service,func){
    queued.push({service:service,func:func,evt:null});

    service.on("load", function(evt){
      var serviceObj;

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


  return {
    push:push
  }

});