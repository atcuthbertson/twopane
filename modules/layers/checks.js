define([
  "dojo/on",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ImageParameters",

  "modules/info.js"
  ],
function(
  on,

  ArcGISDynamicMapServiceLayer,
  ImageParameters,

  info
){


  //Need to add to the DOM. Onload, list layers from service and add them to the provided node.
  // Make inputs / checkbox / whatever and attach handlers. May call populate based on what is checked

  //need to do something about legends

  //need to provide an array of zip files for active layers


  //need to rework the populate function such that only the proper things are added to the right pane
  //This will differ per layer type but is managed internally. The function is eventually called with
  //to set the title and content nodes (currently as innerHTML, but might make more sense as append)

  var imageParameters = new ImageParameters({layerIds:[-1],layerOption:ImageParameters.LAYER_OPTION_SHOW});
  var activeUrls = {};
  var nameReg = /([^\/]*)\/MapServer/;
  var serviceWrapper = 'serviceWrapper';

  var DOC = document;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }



  return function(url, node, populate){

    var layerTitle;
    var layerContent;
    var service = new ArcGISDynamicMapServiceLayer(url, {"imageParameters": imageParameters});
    service.suspend();

    service.on("load",function(e){
      var layer = e.layer;
      console.log(layer);
      layerTitle = url.match(nameReg)[1];
      layerContent = layer.description;

      var container = DOC.createElement('div');
      layer.layerInfos.forEach(function(layerInfo){
        var check = makeNode(layerInfo,container);
        on(check,"change")
      });

      node.appendChild(container);
      populate(layerTitle,layerContent);
    });

    info.register(url);



//add in spinner and opacity slider. And legend. And Handlers.
    function makeNode(layerInfo,container){
      var id = Math.random();

      var wrapper = DOC.createElement('div');
      wrapper.className = serviceWrapper;

      var check = DOC.createElement('input'); 
      check.type = "checkbox";
      check.id = id;

      var label = DOC.createElement('label');
      label.setAttribute('for',id);
      label.innerText = makeSpaced(layerInfo.name);

      wrapper.appendChild(check);
      wrapper.appendChild(label);

      container.appendChild(wrapper);

      return check;
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