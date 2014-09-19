define([
  "dojo/on",

  "dijit/form/HorizontalSlider",

  "esri/layers/ArcGISDynamicMapServiceLayer",

  "modules/info.js"
  ],
function(
  on,

  Slider,

  ArcGISDynamicMapServiceLayer,

  info
){


  //Need to add to the DOM. Onload, list layers from service and add them to the provided node.
  // Make inputs / checkbox / whatever and attach handlers. May call populate based on what is checked

  //need to do something about legends

  //need to provide an array of zip files for active layers


  //need to rework the populate function such that only the proper things are added to the right pane
  //This will differ per layer type but is managed internally. The function is eventually called with
  //to set the title and content nodes (currently as innerHTML, but might make more sense as append)

  var activeUrls = {};
  var nameReg = /([^\/]*)\/MapServer/;
  var serviceWrapper = 'serviceWrapper';

  var DOC = document;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }


  return function(url, node, map, populate){

    var layerTitle;
    var layerContent;

    var services = [];

    var firstService = makeService(url,services);

    info.register(url);


    firstService.on("load",function(e){
      var layer = e.layer;
      var layerInfos = layer.layerInfos;

      layerTitle = url.match(nameReg)[1];
      layerContent = layer.description;

      for(var i=1; i<layerInfos.length; i++){
        makeService(url,services);
      }

      /*Add services in reverse order to make overlap more intuitive (top overlaps bottom)*/
      for(i= layerInfos.length-1;i>-1; i--){
        map.addLayer(services[i])
      }


      var container = DOC.createElement('div');

      layerInfos.forEach(function(layerInfo,i){
        services[i].setVisibleLayers([i]);

        var check = makeNode(layerInfo, i, container, services);
        on(check,"change",function(){toggleLayer(i,services)})
      });

      node.appendChild(container);
      populate(layerTitle,layerContent);
    });
  }  


    function makeService(url,services){
      var service = new ArcGISDynamicMapServiceLayer(url);
      service.suspend();
      services.push(service);
      return service;
    }


//add in spinner and legend.
    function makeNode(layerInfo, layerId, container, services){
      var id = Math.random();

      var wrapper = DOC.createElement('div');
      wrapper.className = serviceWrapper;

      var check = DOC.createElement('input');
       check.type = "checkbox";
      check.id = id;

      var label = DOC.createElement('label');
      label.setAttribute('for',id);
      label.innerText = makeSpaced(layerInfo.name);

      var sliderNode = DOC.createElement('div')

      wrapper.appendChild(check);
      wrapper.appendChild(label);
      wrapper.appendChild(sliderNode);

      var slider = new Slider({
        value:1,
        minimum:0,
        maximum:1,
        intermediateChanges: true,
        style:"width:120px;",
        onChange:function(value){
          services[layerId].setOpacity(value);
        }
        }, sliderNode
      ).startup();

      container.appendChild(wrapper);

      return check;
    }

    function toggleLayer(id,services){
      var service = services[id];
      if(service.suspended){
        service.resume();
        info.activate(service.url,id);
      }else{
        service.suspend();
        info.deactivate(service.url,id);
      }
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

  /*  return {
      service:service,
      getDownloads:getDownloads
    }*/

});