
// Include modules That you want to use in your application. The first argument is an array of
// strings identifying the modules to be included and the second argument is a function that gets
// its arguments populated by the return value of each module. Order matters.
require([
  "esri/map",
  "esri/geometry/Extent",
  "esri/geometry/ScreenPoint",
  "esri/geometry/Point",
  "esri/SpatialReference",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/FeatureLayer",
  "esri/dijit/Scalebar",
  "esri/dijit/BasemapToggle",
  "esri/dijit/InfoWindow",
  "esri/dijit/Legend",
  "esri/TimeExtent", 
  "esri/dijit/TimeSlider",
  "esri/layers/ImageParameters",
  "esri/graphic",
  "esri/geometry/webMercatorUtils",

  "dojo/ready",
  "dojo/_base/Color",
  "dojo/parser",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/query",
  "dojo/store/Memory",
  "dijit/form/ComboBox",
  "esri/dijit/HomeButton",
  
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/layout/TabContainer",
  "dijit/form/CheckBox",
  "dijit/registry",

  "esri/tasks/identify",
  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",

  "modules/geocode.js",


  "require"
  ], 

function(
   Map,
   Extent,
   ScreenPoint,
   Point,
   SpatialReference,
   ArcGISDynamicMapServiceLayer,
   FeatureLayer,
   Scalebar,
   BasemapToggle,
   InfoWindow,
   Legend,
   TimeExtent, 
   TimeSlider,
   ImageParameters,
   Graphic,
   wmUtils,

   ready,
   Color,
   parser,
   on,
   dom,
   domClass,
   query,
   Memory,
   ComboBox,
   HomeButton,
  
   MarkerSymbol,
   LineSymbol,
   BorderContainer,
   ContentPane,
   TabContainer,
   CheckBox,
   registry,

   identify,
   IdentifyTask,
   IdentifyParameters,

   geocode,

   require
   ){

  //Disable CORS detection, since services.arcgisonline.com is not CORS enabled
  esri.config.defaults.io.corsDetection = false;


  // Fires when the DOM is ready and all dependencies are resolved. Usually needed when using dijits.
  ready(function() {
    var W = window;
    var DOC = document;

    var server = DOC.location.hostname;
    server = server === "localhost" ? "gis.water.ca.gov" : server;

    var serverFolder = server.slice(0,3) === "gis" ? "Public" : "cadre";
    var prefix = "https://"+server+"/arcgis/rest/services/" + serverFolder 
    var suffix = "/MapServer";


    var mapPane = dom.byId("centerPane");
    var svgLayer;
    var rp = dom.byId('rightPane');
    var titleNode = dom.byId('titleNode');
    var dataNode = dom.byId('dataNode');
    var closeButton = dom.byId('closeRP');

    var closeToggle;

    var oldIE =(DOC.all&&!W.atob)?true:false;



    var staticServices = {};
    var visibleServiceUrls = {};
    var identifyTasks = {};
    var servicesById = {};

    var serviceDescriptions = {};
    var imageParameters = new ImageParameters({layerIds:[-1],layerOption:ImageParameters.LAYER_OPTION_SHOW});
    

    if(oldIE) fx = require("dojo/_base/fx", function(fx){return fx});


    // Choose your initial extent. The easiest way to find this is to pan around the map, checking the
    // current extent with 'map.extent' in the Javascript console (F12 to open it)
    var initialExtent = new Extent({
	    "xmin" : -13300000,
      "ymin" : 3500000,
      "xmax" : -12800000,
      "ymax" : 5500000, 
	    "spatialReference":{
        "wkid" : 102100
      }
    });

	






    // Create the map. The first argument is either an HTML element (usually a div) or, as in this case,
    // the id of an HTML element as a string. See https://developers.arcgis.com/en/javascript/jsapi/map-amd.html#map1
    // for the full list of options that can be passed in the second argument.
  	var map = new Map(mapPane, {
        basemap : "topo",
  	    extent:initialExtent,
        minZoom:6,
  	    maxZoom:12
      });


    //save the map to a global variable, useful for app development
    window.map = map;


    
	


    //Once the map is loaded, set the infoWindow's size. And turn it off and on to prevent a flash of
    //unstyled content on the first point click.

    map.on("load", function(){
      map.disableDoubleClickZoom();
      svgLayer = dom.byId("centerPane_gc")
      infoWindow.resize(425,325);
      infoWindow.show(0,0);
      setTimeout(function(){infoWindow.hide()},0);

      var basemapToggle = BasemapToggle();
      on(dom.byId("basemapNode"),"mousedown",basemapToggle);
    });





    //initialize and hook up geocoder
    (function(){

      var symbol = new MarkerSymbol(
        MarkerSymbol.STYLE_CIRCLE
        , 10
        , new LineSymbol(LineSymbol.STYLE_SOLID, new Color("#44474d"), 1)
        , new Color("#041222")
        );
      var lastGraphic = null;


      var wrapper = DOC.createElement('div');
      var geocoder = DOC.createElement('input');


      wrapper.className = 'geocoderWrapper';
      geocoder.className = 'geocoder';
      geocoder.autofocus = 'autofocus';

      wrapper.appendChild(geocoder);
      mapPane.appendChild(wrapper);

      geocoder.tabIndex = "1";

      on(geocoder,"keyup",function(e){
        if(e.keyCode === 13){
          clearLastGeocode();
          geocode(geocoder.value,parseGeocoder)
        }
      });


      function parseGeocoder(data){
        var dataObj = JSON.parse(data);
        var topResult = dataObj.results[0];
        if(topResult){
          var location = topResult.geometry.location;
          var address = topResult.formatted_address;

          reflectLocationChoice(address)
          showLocation(location)
        }
      }


      function reflectLocationChoice(address){
        return geocoder.value = address;
      }


      function showLocation(location){
        var loc = wmUtils.lngLatToXY(location.lng,location.lat);
        var pnt = new Point(loc, new SpatialReference(102100));

        lastGraphic = new Graphic(pnt,symbol)

        map.graphics.add(lastGraphic);
        map.centerAndZoom(pnt,12);
      }


      function clearLastGeocode(){
        if(lastGraphic){
          map.graphics.remove(lastGraphic);
          lastGraphic = null;
        }
      }

    })();






    //could/should likely be a module that each of the layers add
    function addLoading(check){
      var img = DOC.createElement('img')
      img.className = "loadingImg";
      img.src = "images/loading.gif";
      check.parentNode.insertBefore(img,check)
    }

    function removeLoading(check){
      var p = check.parentNode;
      var prev = check.previousSibling
      if(prev&&prev.tagName === 'IMG')
        p.removeChild(prev)
    }

    function toggleLoading(check){
      if(check.checked) removeLoading(check);
    }

    function layerUpdateEnd(e){
      var layer = e.target;
      if(layer){
        toggleLoading(getCheckFromLayer(layer))
      }
    }

    function getCheckFromLayer(layer){
      var arr = layer.url.split('_');
      var type = arr[arr.length-1].split('/')[0];
      switch(type){
        case "Points":
          return measurementCheck;
        case "Contours":
          return contoursCheck;
        case "Ramp":
          return rampCheck;
      }
    }




    // Add dijits to the application



    //custom basemap toggle
    function BasemapToggle(){
      var t = "topo";
      var s = "satellite";
      var g = "gray";
      var src = "http://js.arcgis.com/3.10/js/esri/dijit/images/basemaps/"
      var basemapNode = DOC.createElement('div');
      var basemapPic = DOC.createElement('img');
      var labelWrapper = DOC.createElement('div');
      var basemapLabel = DOC.createElement('span');

      basemapNode.id = "basemapNode";

      labelWrapper.appendChild(basemapLabel)
      basemapNode.appendChild(basemapPic);
      basemapNode.appendChild(labelWrapper);

      centerPane.appendChild(basemapNode);
      setBasemap(t,s);

      function setBasemap(bmap,next){
        basemapPic.src = src + next + ".jpg";
        basemapLabel.textContent = next[0].toUpperCase() + next.slice(1);
        if(map.getBasemap()===bmap) return;
        map.setBasemap(bmap);
      }

      return function(){
        var current = map.getBasemap();
        current === t
        ? setBasemap(s,g)
        : current === s
          ? setBasemap(g,t)
          : setBasemap(t,s)
        ;
      }
    }



    //Home extent button
    var home= new HomeButton({
      map: map
    }, "homeButton");

    home.startup();


    //Info window and identify
    var infoWindow = new InfoWindow('infoWindow');
    infoWindow.startup();
    infoWindow.setTitle('<a id="zoomLink" action="javascript:void 0">Information at this Point</a>')
    map.setInfoWindow(infoWindow);

    var identifyParameters = new IdentifyParameters();
    identifyParameters.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    identifyParameters.tolerance = 3;
    identifyParameters.returnGeometry = false;

    //info.init(map,infoWindow, identifyParameters)




    //toggling right pane
    closeToggle = function(){
      var showing = 0;
      var arro = dom.byId("arro");
      var movers = query(".mov");

      function arrowRight(){
        arro.style.marginLeft = "0px";
        arro.textContent = "\u25B6";
      }

      function arrowLeft(){
        arro.style.marginLeft = "-25px";
        arro.textContent = "\u25C0";
      }

      function showPane(){
        var i = 0, j = movers.length;
        showing = 1;
        
        setTimeout(arrowRight,100)

        if(oldIE){
          for(;i<j;i++){
            if(movers[i] === rp)
              fx.animateProperty({node:movers[i], duration:300, properties:{marginRight:0}}).play();
            else fx.animateProperty({node:movers[i], duration:300, properties:{marginRight:285}}).play();
          }
        }else{
          for(;i<j;i++)
            domClass.add(movers[i],"movd");
        }
      }



      function hidePane(){
        var i = 0, j = movers.length;
        showing = 0;

        setTimeout(arrowLeft,100)

        if(oldIE){
          for(;i<j;i++){
          if(movers[i] === rp)
            fx.animateProperty({node:movers[i], duration:250, properties:{marginRight:-285}}).play();
          else fx.animateProperty({node:movers[i], duration:250, properties:{marginRight:0}}).play();
          }
        }else{
          for(;i<j;i++)
            domClass.remove(movers[i],"movd");
        }
      }

      return function(){
        if(showing) hidePane();
        else showPane();
      }
    }();





    //Show the application
    function resetDataHeight (){
      dataNode.style.height = DOC.documentElement.offsetHeight - 134 + "px"
    }


    resetDataHeight();
    on(W,"resize",resetDataHeight)
    on(closeButton,"mousedown", closeToggle);
    dom.byId("mainContainer").style.visibility="visible";

    W.setTimeout(function(){
      on.emit(closeButton, "mousedown",{bubbles:true,cancelable:true})
    },300);



    //This needs to be repurposed to pull in the download module.. then step through
    //visible layers and ask them to provide download links, then hand these in a flattened array
    //to the download module
    on(dom.byId("downloadLink"),"click",downloadZips)
    function downloadZips(){
      makeDownloads(getDataZips())
    }

    //Provide to the layers to add to the right pane
    function populateRightPane(title,data){
      titleNode.innerHTML = title;
      dataNode.innerHTML = data;
      resetDataHeight();
    }


    //ie shim
    function forEach(arr,fn){
      for(var i=0;i<arr.length;i++){
        fn(arr[i],i,arr)
      }
    }





  });
});

	
	  
