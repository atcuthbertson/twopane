  function makeService(url, id){
    var service = new ArcGISDynamicMapServiceLayer(url, {"imageParameters": imageParameters});
    service.suspend();
    layers.push(service);
    identifyTasks[url] = new IdentifyTask(url);
    servicesById[id] = service;
    on(query("#"+id+" input"), "click", function(){updateLayerVisibility(service,this.parentNode.parentNode)});
    service.on("load",function(e){serviceDescriptions[id] = e.layer.description})
  }