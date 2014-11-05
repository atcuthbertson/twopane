define([
  "dojo/on",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/layerQueue.js",
  "modules/makeCheck.js",
  "modules/info.js",
  "modules/spinner.js",
  "modules/clearAllLayers.js"
  ],
function(
  on,

  ArcGISDynamicMapServiceLayer,

  layerQueue,
  makeCheck,
  info,
  spinner,
  clearAllLayers
){
  //need to do something about legends

  //need to provide an array of zip files for active layers

  var DOC = document;
  var nameReg = /([^\/]*)\/MapServer/;


  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }

  function makeService(url,services){
    var service = new ArcGISDynamicMapServiceLayer(url);
    service.suspend();
    services.push(service);
    return service;
  }


  return function(url, map, hookService, options){

    var tabName = options.tabName || null;
    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];
    var paramFilter = options.paramFilter || null;

    
    var service = {}; 


    var container = DOC.createElement('div');
    var serviceName;
    var serviceUnderscored;
    var serviceDescription;

    var services = [];
    var checks = [];
    var fullNames = [];


    var firstService = makeService(url,services);
    layerQueue.push(firstService, processLayer)
    info.register(url);


    function processLayer(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;
      var i;

      serviceName = makeSpaced(url.match(nameReg)[1]);
      serviceUnderscored = makeUnderscored(serviceName);
      serviceDescription = layer.description;


      if(downloader && excludeDownload.length){
        if(excludeDownload[0] === "*"){
          for (i = 0; i < layerCount; i++) {
            excludeDownload[i] =  serviceUnderscored + "/" + makeUnderscored(layerInfos[i].name);
          }
        }else{
          for(i=0; i<excludeDownload.length; i++){
            excludeDownload[i] = serviceUnderscored + "/" + excludeDownload[i];
          }
        }
        downloader.exclude(excludeDownload);
      }


      clearAllLayers.register(function(){
        for(var i=0; i< layerCount; i++){
          toggleLayer(i, 1);
        }
      })


      var title = DOC.createElement('h3');
      title.innerText = serviceName;
      container.appendChild(title);

      if(paramFilter){
        paramFilter(url,services,container);
      }else{
        /*One map layer for each service layer, for independent transparencies*/
        for(i=0; i<layerCount; i++){
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
      checks.push(check);

      on(check,"change",function(){
        toggleLayer(i, 0);
        if(!services[i].suspended)spinner(check,services[i]);
      });
    }


    function toggleLayer(id, closeAll){
      var service = services[id];
      if(service.suspended){
        if(!closeAll){
          service.resume();
          info.activate(service.url,id);
          if(downloader) downloader.add(fullNames[id]);
        }
      }else{
        service.suspend();
        info.deactivate(service.url,id);
        if(downloader) downloader.remove(fullNames[id]);
        if (closeAll) checks[id].checked = false;
      }
    }



  }
});
