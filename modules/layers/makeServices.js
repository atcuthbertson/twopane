define([
  "dojo/on",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/layerQueue.js",
  "modules/info.js",
  "modules/utils.js"
],

function(
  on,

  ArcGISDynamicMapServiceLayer,

  layerQueue,
  info,
  utils
){

  //Make a dynamic map service and suspend it. This will be done once for each layer in the service so they can have independent transparencies
  function makeService(url){
    var service = new ArcGISDynamicMapServiceLayer(url);
    service.suspend();
    return service;
  }

   
  return function(url, map, attachUI, needsUI, options){


    var excludeLayers = options.excludeLayers || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];
	var startEnabled = options.startEnabled || [];  // by default, layers are off; pass list of layers to turn on initially
    
    //Implement a queue so UI is attached in the right order if we have more than one tab
    layerQueue.push(makeService(url), processService, needsUI);

    //Once a service loads, get all its layerInfos and create more Dynamic Map Services for each of them.
    //Register this loaded layer with the info function
    //And if necessary block downloads
    //Also, add some useful names to each dynamic map service for layer use
    function processService(serviceObj){
      var firstService = serviceObj.service;
      var layer = serviceObj.evt.layer;
      var services = [];

      var url = layer.url
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;

      var serviceName = utils.space(utils.getServiceName(url));
      var serviceUnderscored = utils.underscore(serviceName);

	  
	  //console.log("makeServices -- info.register " + url);
      info.register(url); // 
      excludeDownloads(serviceUnderscored, layerInfos);
     
      /*One map layer for each service layer, for independent transparencies*/
      
      for(var i=0; i<layerCount; i++){ // for each sublayer in service
        var service;
		var enabled = false;
        var underscoredName = utils.underscore(layerInfos[i].name);
        var excluded=0;
        for(j=0; j<excludeLayers.length; j++){
          if(excludeLayers[j]===underscoredName){
            excluded = 1;
            break;
          }
        }
        if(excluded) continue;
        if(i>0) service = makeService(url);
        else service = firstService;
		
		//determine if service should be enabled
		for(j=0; j<startEnabled.length; j++){
          if(startEnabled[j]===underscoredName){
            enabled = true;
            break; // no need to finish looping though layers, we found the layer
          }
        }
		
  
        service.setVisibleLayers([i]);
        service.fullName =  serviceUnderscored + "/" + underscoredName;
        service.serviceName = serviceUnderscored;
        service.layerName = underscoredName;
		service.startEnabled = enabled;
        
		if (service.startEnabled) service.resume();
		
		
        map.addLayer(service, 1);
        services.push(service);
      }
      attachUI(services,serviceObj);


    }

    function excludeDownloads(serviceUnderscored, layerInfos){
      var i;
      if(downloader && excludeDownload.length){
        if(excludeDownload[0] === "*"){
          for (i = 0; i < layerInfos.length; i++) {
            excludeDownload[i] =  serviceUnderscored + "/" + utils.underscore(layerInfos[i].name);
          }
        }else{
          for(i = 0; i<excludeDownload.length; i++){
            excludeDownload[i] = serviceUnderscored + "/" + utils.underscore(excludeDownload[i]);
          }
        }
        downloader.exclude(excludeDownload);
      }
    }


  }
});
