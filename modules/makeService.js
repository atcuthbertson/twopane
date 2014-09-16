define([
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ImageParameters",

  "modules/info.js"
  ],
function(
  ArcGISDynamicMapServiceLayer,
  ImageParameters,

  info
){


  //Need to add to the DOM
  //need to do something about legends
  //need to provide an array of zip files for active layers
  //need to rework the populate function such that only the proper things are added to the right pane

  var imageParameters = new ImageParameters({layerIds:[-1],layerOption:ImageParameters.LAYER_OPTION_SHOW});
  var activeUrls= {};

  return function(url, node, populate){

      var service = new ArcGISDynamicMapServiceLayer(url, {"imageParameters": imageParameters});
      service.suspend();

      info.register(url);

      on(query("#"+id+" input"), "click", function(){updateLayerVisibility(service,this.parentNode.parentNode)});
      service.on("load",function(e){serviceDescriptions[id] = e.layer.description})


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
        info.deactivate(service.url);
        activeUrls[service.url] = 0;
      }else{
        service.resume();
        info.activate(service.url);
        activeUrls[service.url] = 1;
      }
      service.setVisibleLayers(visibleLayerIds);

    }

      function getDownloads(id){
      var service = servicesById[id];
      var zips = ["downloads/_readme.txt"];
      for(var i =1, len = service.visibleLayers.length;i<len;i++){
        zips.push(makeDownload(service.layerInfos[service.visibleLayers[i]].name))
      }
      return zips
    }

    function makeDownload(name){
      return "downloads/" + name.split(" ").join("_") + ".zip"
    }

    return {
      service:service,
      getDownloads:getDownloads
    }
  }
});