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

    var serviceName = makeSpaced(url.match(nameReg)[1]);
    var serviceUnderscored = makeUnderscored(serviceName);

    var services = [];
    var checks = [];
    var fullNames = [];


    var firstService = makeService(url,services);
    layerQueue.push(firstService, processLayer)
    info.register(url);


    var container = DOC.createElement('div');
    var title = DOC.createElement('h3');
    title.innerText = serviceName;
    container.appendChild(title);


    function processLayer(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;


      excludeDownloads(layerInfos);
    

      clearAllLayers.register(function(){
        for(var i=0; i< layerCount; i++){
          toggleLayer(i, 1);
        }
      })


      /*One map layer for each service layer, for independent transparencies*/
      for(var i=0; i<layerCount; i++){
        if(i>0) makeService(url,services);
        map.addLayer(services[i]);
        buildCheck(layerInfos[i],i,container,services);
      }
      

      var service = {};

      service.node = container;
      service.name = serviceName;
      service.description = layer.description;
      service.tabName = tabName? tabName : serviceName;

      hookService(service);
      
    }


    function buildCheck(layerInfo, id, container){
      var underscoredName = makeUnderscored(layerInfo.name);
      var spacedName = makeSpaced(layerInfo.name);
      if(exclude.indexOf(underscoredName) !== -1) return;

      var resolveService = getServiceResolver(id)

      services[id].setVisibleLayers([id]);
      fullNames[id] =  serviceUnderscored + "/" + underscoredName;

      var check = makeCheck(container, spacedName, resolveService);
      checks.push(check);

      on(check,"change",function(){
        toggleLayer(id, 0);
        if(!services[id].suspended)spinner(check,services[id]);
      });

    }

    function getServiceResolver(id){
      //dynamicStuffhere
      var resolvedServices = services;
      return function(){
        return resolvedServices[id];
      }
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

    function excludeDownloads(layerInfos){
      if(downloader && excludeDownload.length){
        if(excludeDownload[0] === "*"){
          for (var i = 0; i < layerInfos.length; i++) {
            excludeDownload[i] =  serviceUnderscored + "/" + makeUnderscored(layerInfos[i].name);
          }
        }else{
          for(var i = 0; i<excludeDownload.length; i++){
            excludeDownload[i] = serviceUnderscored + "/" + makeUnderscored(excludeDownload[i]);
          }
        }
        downloader.exclude(excludeDownload);
      }
    }



  }
});
