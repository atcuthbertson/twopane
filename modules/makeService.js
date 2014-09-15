  function makeService(url, id){
    var service = new ArcGISDynamicMapServiceLayer(url, {"imageParameters": imageParameters});
    service.suspend();
    layers.push(service);
    identifyTasks[url] = new IdentifyTask(url);
    servicesById[id] = service;
    on(query("#"+id+" input"), "click", function(){updateLayerVisibility(service,this.parentNode.parentNode)});
    service.on("load",function(e){serviceDescriptions[id] = e.layer.description})
  }

    function updateLayerVisibility (service,pane) {
    var inputs = query("input[type='checkbox']",pane);
    var inputCount = inputs.length;
    var visibleLayerIds = [-1]
    //in this application no layer is always on
    for (var i = 0; i < inputCount; i++) {
      if (inputs[i].checked) {
        visibleLayerIds.push(inputs[i].value);
      }
    }
    if(visibleLayerIds.length === 1){
      service.suspend();
      removeVisibleUrl(service.url);
    }else{
      service.resume();
      addVisibleUrl(service.url,service)
    }
    service.setVisibleLayers(visibleLayerIds);
  }

    function getServiceZips(id,radio){
    if(radio){
      radio.forEach(function(v){
        if(v.checked) id = v.id;
      })
    }
    var service = servicesById[id];
    var zips = ["downloads/_readme.txt"];
    for(var i =1, len = service.visibleLayers.length;i<len;i++){
      zips.push(makeServiceZip(service.layerInfos[service.visibleLayers[i]].name))
    }
    return zips
  }

  function makeServiceZip(name){
    return "downloads/" + name.split(" ").join("_") + ".zip"
  }