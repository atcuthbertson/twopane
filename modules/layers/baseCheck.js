define([
  "dojo/on",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/layerQueue.js",
  "modules/makeCheck.js",
  "modules/info.js",
  "modules/spinner.js",
  "modules/clearAllLayers.js",
  "modules/resolveLayers.js"
  ],
function(
  on,

  ArcGISDynamicMapServiceLayer,

  layerQueue,
  makeCheck,
  info,
  spinner,
  clearAllLayers,
  resolveLayers

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


  return function(urls, container, resolver, map, hookService, options){

    if(typeof urls !== "object") urls = [urls];
    var firstUrl = urls[0]

    var tabName = options.tabName || null;
    var exclude = options.exclude || [];
    var downloader = options.downloader || null;
    var excludeDownload = options.excludeDownload || [];

    var serviceName = options.name||makeSpaced(firstUrl.match(nameReg)[1]);
    var serviceUnderscored = makeUnderscored(serviceName);


    var firstService = makeService(firstUrl);
    //TODO queue every url
    //pass in a flag for check building
    layerQueue.push(firstService, processLayer);




    clearAllLayers.register(function(){
      var layerObjects = resolveLayers.getRegistered();
      for(var i=0; i< layerObjects.length; i++){
        var layerObj = layerObjects[i]
        if(layerObj.check.checked) layerObj.check.checked = false;
        toggleLayer(resolveLayers.resolve(layerObj.check), 1);
      }
    });



    function processLayer(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;
      var layerCount = layerInfos.length;

      info.register(layer.url);
      excludeDownloads(layerInfos);
     
      /*One map layer for each service layer, for independent transparencies*/
      for(var i=0; i<layerCount; i++){
        var service;
        if(i>0) service = makeService(url);
        else service = firstService;

        var check = buildCheck(service, i, layerInfos[i]);
        resolveLayers.register(check, service, resolver);
        map.addLayer(service, 1);
      }


      var serviceProps = {};

      serviceProps.node = container;
      serviceProps.name = serviceName;
      serviceProps.description = layer.description;
      serviceProps.tabName = tabName? tabName : serviceName;

      //TODO how does hooking change with radio?
      //quite a bit, especially if we are allowing different right pane stuff
      //per radio. Means we will need to only hook the service after all are processed...
      //or allow some sort of resolving to occur.
      //hookservice needs to be redone anyway wrt performance (new nodes every time) and
      // flexibility (add only visible checks)
      
      hookService(serviceProps);
      
    }




    function buildCheck(service, id, layerInfo){
      var underscoredName = makeUnderscored(layerInfo.name);
      var spacedName = makeSpaced(layerInfo.name);
      if(exclude.indexOf(underscoredName) !== -1) return;

      service.setVisibleLayers([id]);
      service.fullName =  serviceUnderscored + "/" + underscoredName;

      var check = makeCheck(container, spacedName, resolveLayers.resolve);
      on(check,"change",checkResolver);
      return check;
    }
    

    function checkResolver(){
      var layer = resolveLayers.resolve(this);
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
