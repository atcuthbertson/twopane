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

  var nameReg = /([^\/]*)\/MapServer/;


  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }

  function makeService(url){
    var service = new ArcGISDynamicMapServiceLayer(url);
    service.suspend();
    return service;
  }


  return function(url, container, resolver, map, hookService, options){

    var tabName = options.tabName || null;
    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];

    var serviceName = options.name||makeSpaced(url.match(nameReg)[1]);
    var serviceUnderscored = makeUnderscored(serviceName);


    var firstService = makeService(url);
    layerQueue.push(firstService, processLayer)
    info.register(url);



    var layerResolver = function(){
      var checks = {};

      function resolve(check){
        var obj = checks[check.id];
        return obj.fn(obj.services);
      }

      function register(check,service,fn){
        var id = check.id;
        if(checks[id]){
          checks[id].services.push(service);
        }else{
          checks[id] = {fn:fn,services:[service]}
        }
      }

      function resolveAll(){
        var resolvedLayers = [];
        for(var id in checks){
          resolvedLayers.push(checks[id].fn(checks[id].services)); 
        }
        return resolvedLayers;
      }


      return {
        resolve:resolve,
        register:register,
        resolveAll:resolveAll
      }

    }();

    clearAllLayers.register(function(){
      var layers = layerResolver.resolveAll();
      for(var i=0; i< layers.length; i++){
        toggleLayer(layers[i], 1);
      }
    });

    function processLayer(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;


      excludeDownloads(layerInfos);
     


      /*One map layer for each service layer, for independent transparencies*/
      for(var i=0; i<layerCount; i++){
        var service;
        if(i>0) service = makeService(url);
        else service = firstService;

        buildCheck(service, i, layerInfos[i]);
        map.addLayer(service, 1);
      }


      var serviceProps = {};

      serviceProps.node = container;
      serviceProps.name = serviceName;
      serviceProps.description = layer.description;
      serviceProps.tabName = tabName? tabName : serviceName;

      hookService(serviceProps);
      
    }




    function buildCheck(service, id, layerInfo){
      var underscoredName = makeUnderscored(layerInfo.name);
      var spacedName = makeSpaced(layerInfo.name);
      if(exclude.indexOf(underscoredName) !== -1) return;

      service.setVisibleLayers([id]);
      service.fullName =  serviceUnderscored + "/" + underscoredName;

      var check = makeCheck(container, spacedName, layerResolver.resolve);

      layerResolver.register(check, service, resolver);

      on(check,"change",checkResolver);
    }
    

    function checkResolver(){
      var layer = layerResolver.resolve(this);
      toggleLayer(layer, 0); 
      if(!layer.suspended)spinner(this,layer);
    }


    function toggleLayer(service, closeAll){
      if(service.suspended){
        if(!closeAll){
          service.resume();
          info.activate(service);
          if(downloader) downloader.add(service.fullName);
        }
      }else{
        service.suspend();
        info.deactivate(service);
        if(downloader) downloader.remove(service.fullName);
       // if (closeAll) checks[id].checked = false;
      }
    }


    function excludeDownloads(layerInfos){
      var i;
      if(downloader && excludeDownload.length){
        if(excludeDownload[0] === "*"){
          for (i = 0; i < layerInfos.length; i++) {
            excludeDownload[i] =  serviceUnderscored + "/" + makeUnderscored(layerInfos[i].name);
          }
        }else{
          for(i = 0; i<excludeDownload.length; i++){
            excludeDownload[i] = serviceUnderscored + "/" + makeUnderscored(excludeDownload[i]);
          }
        }
        downloader.exclude(excludeDownload);
      }
    }



  }
});
