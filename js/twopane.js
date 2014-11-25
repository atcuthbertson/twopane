
// Include modules That you want to use in your application. The first argument is an array of
// strings identifying the modules to be included and the second argument is a function that gets
// its arguments populated by the return value of each module. Order matters.
require([
  "esri/map",
  "esri/geometry/Extent",

  "esri/dijit/BasemapToggle",
  "esri/dijit/HomeButton",
  "esri/dijit/Scalebar",

  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/query",
  "dojo/ready",

  "modules/info.js",
  "modules/getdownloads.js",
  "modules/searchbox.js",
  "modules/makeTabs.js",
  "modules/populate.js",
  "modules/clearAllLayers.js",
  "modules/layers/newRadio.js",
  "modules/layers/newSimple.js",
   
  "require"
  ], 

function(
  Map,
  Extent,

  BasemapToggle,
  HomeButton,
  Scalebar,

  on,
  dom,
  domClass,
  query,
  ready,

  info,
  GetDownloads,
  Searchbox,
  makeTabs,
  populate,
  clearAllLayers,
  RadioLayer,
  CheckLayer,

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
    var serviceNode = dom.byId("serviceNode");
    var clearAll = dom.byId("clearAll");
    var rightPane = dom.byId('rightPane');
    var dataNode = dom.byId('dataNode');
    var downloadNode = dom.byId("downloadNode");
    var closeButton = dom.byId('closeRP');

    var closeToggle;
    var home;

    var oldIE =(DOC.all&&!W.atob)?true:false;


    var staticServices = {};
 

    if(oldIE) fx = require("dojo/_base/fx", function(fx){return fx});


    //Layout the application based on screen dimensions
    function setNodeDimensions (){
      var elem = DOC.documentElement;
      var width = elem.offsetWidth;
      var height = elem.offsetHeight;
      var left = leftPane.offsetWidth;

      mapPane.style.width = width - left + "px";
      mapPane.style.left = left + "px";
      dataNode.style.height = height - 80 + "px"
    }


    setNodeDimensions();

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
        maxZoom:16
      });


    //save the map to a global variable, useful for app development
    window.map = map;


    

    map.on("load", function(){
      map.disableDoubleClickZoom();

      var basemapToggle = BasemapToggle();
      on(dom.byId("basemapNode"),"mousedown",basemapToggle);

      info.init(map);
    });




    //Geocoder
    Searchbox(map);




    //custom basemap toggle
    function BasemapToggle(){
      var t = "topo";
      var s = "satellite";
      var g = "gray";
      var src = "//js.arcgis.com/3.10/js/esri/dijit/images/basemaps/"
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
    home = new HomeButton({
      map: map
    }, "homeButton");

    home.startup();




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
        arro.style.marginLeft = "-23px";
        arro.textContent = "\u25C0";
      }

      function showPane(){
        var i = 0, j = movers.length;
        showing = 1;
        
        setTimeout(arrowRight,100)

        if(oldIE){
          for(;i<j;i++){
            if(movers[i] === rightPane)
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
          if(movers[i] === rightPane)
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


   



    on(W,"resize",setNodeDimensions);
    on(closeButton,"mousedown", closeToggle);
    dom.byId("mainContainer").style.visibility="visible";

    W.setTimeout(function(){
      on.emit(closeButton, "mousedown",{bubbles:true,cancelable:true})
      //if(populateRightPane.noLayers) populateRightPane("Read information about selected layers here")
      setNodeDimensions();
    },300);


    //Place your downloads in the downloads folder, provide the path below
    //Assumes Service_Name_Layer_Name.zip format
    //Be certain the zip files are in place and properly named, or the app will throw errors.
    //Otherwise, don't include the downloader
    var downloader = GetDownloads("./downloads", downloadNode);

    on(downloadNode,"click",downloader.download)


    //initialize the populate module with a node where information will be placed 
    populate.init(dataNode);


    //clear all layers
    clearAllLayers.init(clearAll);

    //Hooks services to UI features.
    var hookService = makeTabs(serviceNode, populate);


    //Layer composed of simple checkboxes
    RadioLayer(["https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Boundaries/MapServer",
       "https://gis.water.ca.gov/arcgis/rest/services/Public/Subsidence/MapServer"],
      map,
      hookService,
      {
        radioTitle:"Select Data Type:",
        checkTitle:"Show Layers:",
        tabName:"Boundaries",
        exclude:["B118_GW_Basins"],
        downloader:downloader,
        excludeDownload:["Groundwater_Management_Plan"]
      }
    );
    
    CheckLayer("https://gis.water.ca.gov/arcgis/rest/services/Public/Subsidence/MapServer",
      map,
      hookService,
      {
        downloader:downloader,
        excludeDownload:["*"]
      }
    );

    CheckLayer("https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Boundaries/MapServer",
      map,
      hookService,
      {
        downloader:downloader
      }
    );
     
          



  });
  });
