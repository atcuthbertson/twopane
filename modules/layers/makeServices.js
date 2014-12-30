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


  function makeService(url){
    var service = new ArcGISDynamicMapServiceLayer(url);
    service.suspend();
    return service;
  }


  return function(url, map, attachUI, needsUI, options){


    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];
    
    layerQueue.push(makeService(url), processLayer, needsUI);


    function processLayer(serviceObj){
      var firstService = serviceObj.service;
      var layer = serviceObj.evt.layer;
      var services = [];

      var url = layer.url
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;

      var serviceName = utils.space(url.match(nameReg)[1]);
      var serviceUnderscored = utils.underscore(serviceName);

      info.register(url);
      excludeDownloads(serviceUnderscored, layerInfos);
     
      /*One map layer for each service layer, for independent transparencies*/
      
      for(var i=0; i<layerCount; i++){
        var service;
        var underscoredName = utils.underscore(layerInfos[i].name);
        if(exclude.indexOf(underscoredName) !== -1) continue;
        if(i>0) service = makeService(url);
        else service = firstService;  
  
        service.setVisibleLayers([i]);
        service.fullName =  serviceUnderscored + "/" + underscoredName;
        service.serviceName = serviceUnderscored;
        service.layerName = underscoredName;
        
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
