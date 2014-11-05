define([
  "dojo/on",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/layerQueue.js",
  "modules/makeCheck.js",
  "modules/info.js",
  "modules/spinner.js"
  ],
function(
  on,

  ArcGISDynamicMapServiceLayer,

  layerQueue,
  makeCheck,
  info,
  spinner
){
  //need to do something about legends

  //need to provide an array of zip files for active layers


  var activeUrls = {};
  var nameReg = /([^\/]*)\/MapServer/;

  var DOC = document;

  var queued = [];
  var busy = 0;
  var active = 0;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }


  return function(url, map, hookService, options){

    var tabName = options.tabName || null;
    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];
    var paramFilter = options.paramFilter || null;

    
    var service = {}; 


    var active = 0;
    if(!busy){
      active = 1;
      busy = 1;
    }

    var container = DOC.createElement('div');
    var serviceName;
    var serviceUnderscored;
    var serviceDescription;

    var services = [];
    var fullNames = [];

    var firstService = makeService(url,services);

    layerQueue.push(firstService, processLayer)

    info.register(url);


    function processLayer(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;
      var i;

      serviceName = makeSpaced(url.match(nameReg)[1]);
      serviceUnderscored = makeUnderscored(serviceName);
      serviceDescription = layer.description;

      if(downloader && excludeDownload.length){
        if(excludeDownload[0] === "*"){
          for (i = 0; i < layerInfos.length; i++) {
            excludeDownload[i] =  serviceUnderscored + "/" + makeUnderscored(layerInfos[i].name);
          }
        }else{
          for(i=0; i<excludeDownload.length; i++){
            excludeDownload[i] = serviceUnderscored + "/" + excludeDownload[i];
          }
        }
        downloader.exclude(excludeDownload);
      }

      var title = DOC.createElement('h3');
      title.innerText = serviceName;
      container.appendChild(title);

      if(paramFilter){
        paramFilter(url,services,container);
      }else{
        /*One map layer for each service layer, for independent transparencies*/
        for(i=0; i<layerInfos.length; i++){
          if(i>0) makeService(url,services);
          buildCheck(layerInfos[i],i,container,services);
        }

        for(i=0; i<services.length; i++){
          map.addLayer(services[i],1);
        }
      }
      
      service.node = container;
      service.name = serviceName;
      service.description = serviceDescription;
      service.tabName = tabName? tabName : serviceName;

      hookService(service);
      
    }


    function buildCheck(layerInfo, i, container){
      var underscoredName = makeUnderscored(layerInfo.name);
      if(exclude.indexOf(underscoredName) !== -1) return;

      services[i].setVisibleLayers([i]);
      fullNames[i] =  serviceUnderscored + "/" + underscoredName;
      var check = makeCheck(layerInfo, i, container, services);
      on(check,"change",function(){
        toggleLayer(i);
        if(!services[i].suspended)spinner(check,services[i]);
      })
    }


    function toggleLayer(id, closeAll){
      var service = services[id];
      if(service.suspended && !closeAll){
        service.resume();
        info.activate(service.url,id);
        if(downloader) downloader.add(fullNames[id]);
      }else{
        service.suspend();
        info.deactivate(service.url,id);
        if(downloader) downloader.remove(fullNames[id]);
      }
    }


    return service; 


  }


    function makeService(url,services){
      var service = new ArcGISDynamicMapServiceLayer(url);
      service.suspend();
      services.push(service);
      return service;
    }

});
