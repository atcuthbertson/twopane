define([
  "dojo/on",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/layerQueue.js",
  "modules/makeCheck.js",
  "modules/info.js",
  "modules/spinner.js",
  "modules/clearAllLayers.js",
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

  function forEach(arr,fn){
    for(var i=0, len=arr.length; i < len; i++){
      fn(arr[i],i);
    }
  }

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


  return function(urls, container, resolver, map, hookService, options){

    if(typeof urls !== "object") urls = [urls];

    var tabName = options.tabName || null;
    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];



    clearAllLayers.register(function(){
      var layerObjects = resolver.getRegistered();
      for(var i=0; i< layerObjects.length; i++){
        var layerObj = layerObjects[i];
        if(layerObj.check.checked){
          layerObj.check.checked = false;
          toggleLayer(resolver.resolve(layerObj.check));
        }
      }
    });



    var buildCheck = function(){
      var checks = [];
      return function(serviceUnderscored, service, id, layerInfo){

        var underscoredName = makeUnderscored(layerInfo.name);
        var spacedName = makeSpaced(layerInfo.name);
        if(exclude.indexOf(underscoredName) !== -1) return;

        service.setVisibleLayers([id]);
        service.fullName =  serviceUnderscored + "/" + underscoredName;
        service.service = serviceUnderscored;

        if(checks[id]){
          return checks[id];
        }else{
          var check = makeCheck(container, spacedName, resolver.resolve);
          checks[id] = check;
          on(check,"change",checkResolver);
          return check;
        }
      }
    }();
    


    function checkResolver(){
      var layer = resolver.resolve(this);
      toggleLayer(layer);
      if(!layer.suspended)spinner(this,layer);
    }



    forEach(urls,function(url,i){
      var firstService = makeService(url);
      if(i===0) layerQueue.push(firstService, processLayer, 1);
      else layerQueue.push(firstService, processLayer, 0);
    });



    function processLayer(serviceObj){
      var firstService = serviceObj.service;
      var layer = serviceObj.evt.layer;

      var url = layer.url
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;

      var serviceName = makeSpaced(url.match(nameReg)[1]);
      var serviceUnderscored = makeUnderscored(serviceName);

      info.register(url);
      excludeDownloads(serviceUnderscored, layerInfos);
     
      /*One map layer for each service layer, for independent transparencies*/
      //Really it needs to go ->
      //make all services
      //make LAYER DEPENDENT CHECKS
      //  meaning pass in fn to make checks
      //  this is where parameters can come in
      //  there will also be a layer dependent way to bind services to checks
      //
      //  So again.
      //  Make all services, augment services, call passed function
      //  This function will decide how many checks to build
      //  and how to hook them to each service
      //  (if params exist, for each param, build a mapping from
      //  param name to service.. then carry this over to the check/resolver)
      //
      for(var i=0; i<layerCount; i++){
        var service;
        if(i>0) service = makeService(url);
        else service = firstService;
        
        var check = buildCheck(serviceUnderscored, service, i, layerInfos[i]);
        resolver.register(check, service);
        map.addLayer(service, 1);
      }

      if(serviceObj.needsUI){
        var serviceProps = {};

        serviceProps.node = container;
        serviceProps.name = serviceName;
        serviceProps.description = layer.description;
        serviceProps.tabName = tabName? tabName : serviceName;

        hookService(serviceProps);
      }

      //TODO how does hooking change with radio?
      //quite a bit, especially if we are allowing different right pane stuff
      //per radio. Means we will need to only hook the service after all are processed...
      //or allow some sort of resolving to occur.
      //hookservice needs to be redone anyway wrt performance (new nodes every time) and
      // flexibility (add only visible checks)
      

      
    }



    function toggleLayer(service){
      if(service.suspended){
          service.resume();
          info.activate(service);
          if(downloader) downloader.add(service.fullName);
      }else{
        service.suspend();
        info.deactivate(service);
        if(downloader) downloader.remove(service.fullName);
      }
    }



    function excludeDownloads(serviceUnderscored, layerInfos){
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
