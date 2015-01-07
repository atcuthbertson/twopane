//Two-pane template for GIS web apps at DWR. See https://github.com/wpears/twopane for more information.


// Include modules that you want to use in your application. The first argument is an array of
// strings identifying the modules to be included and the second argument is a function that gets
// its arguments populated by the return value of each module. Order matters.
require([
  "esri/map",
  "esri/geometry/Extent",

  "esri/dijit/HomeButton",
  "esri/dijit/Scalebar",

  "dojo/on",
  "dojo/dom",
  "dojo/ready",

  "modules/info.js",
  "modules/basemapToggle.js",
  "modules/closeToggle.js",
  "modules/getdownloads.js",
  "modules/searchbox.js",
  "modules/makeTabs.js",
  "modules/populate.js",
  "modules/clearAllLayers.js",
  "modules/layers/radio.js",
  "modules/layers/simple.js"
], 

function(
  Map,
  Extent,

  HomeButton,
  Scalebar,

  on,
  dom,
  ready,

  info,
  basemapToggle,
  closeToggle,
  GetDownloads,
  Searchbox,
  makeTabs,
  populate,
  clearAllLayers,
  RadioLayer,
  CheckLayer
){

  //Disable CORS detection, since services.arcgisonline.com is not CORS enabled
  //You can happily ignore this
  esri.config.defaults.io.corsDetection = false;


  //Fires when the DOM is ready and all dependencies are resolved. Usually needed when using dijits.
  ready(function() {
    var W = window;

    //Properly assign server variables
    var server = document.location.hostname;
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

    var basemapHandler;
    var closeToggler;
    var home;

    var staticServices = {};
 



    //Layout the application based on screen dimensions
    function setNodeDimensions (){
      var elem = document.documentElement;
      var width = elem.offsetWidth;
      var height = elem.offsetHeight;
      var left = leftPane.offsetWidth;

      mapPane.style.width = width - left + "px";
      mapPane.style.left = left + "px";
      dataNode.style.height = height - 80 + "px"
    }

    setNodeDimensions();
    on(W,"resize",setNodeDimensions);

   


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



    
    //Initialize the basemap toggler and the info window widgets once the map has loaded 
    map.on("load", function(){
      map.disableDoubleClickZoom();
       
      basemapHandler = basemapToggle(map);
      on(dom.byId("basemapNode"),"mousedown",basemapHandler);

      info.init(map);
    });




    // Initialize the Geocoder widget
    Searchbox(map);




    //Initialize the home extent button
    home = new HomeButton({
      map: map
    }, "homeButton");

    home.startup();

    


    //Apply listener to toggling right pane widget
    closeToggle();
    on(closeButton, "mousedown", closeToggle);


   

    //Display the application now that most of the dijits are in the page
    dom.byId("mainContainer").style.visibility="visible";
    



    //Create app-wide auto-downloader.
    //Place your downloads in the downloads folder (provide the path below)
    //Assumes Service_Name_Layer_Name.zip format
    //Services can be exluded on a case by case basis (see below)
    var downloader = GetDownloads("./downloads", downloadNode, "http://water.ca.gov/groundwater");
     
    //Preparing downloads means discovering the active layers
    on(downloadNode,"mousedown", downloader.prepareDownloads);
    on(downloadNode,"click", downloader.download)

   
      

    //Initialize the populate module with a node where information will be placed 
    populate.init(dataNode);




    //Module to clear all layers from every included service
    clearAllLayers.init(clearAll);




    //Hooks services to UI features. This allows the right pane to be populated when switching tabs
    var hookServiceToTab = makeTabs(serviceNode, populate);



  
    //A simple check layer. Accepts the service url, a reference to the map, 
    //a function that binds the service to the left and right panes, and an options object for configuring legends, downloads, titles, and parameters.
    CheckLayer("https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Boundaries/MapServer",
      map,
      hookServiceToTab,
      {
        downloader:downloader
      }
    );

    
    //A simple check layer with downloads and legends turned off
    CheckLayer("https://gis.water.ca.gov/arcgis/rest/services/Public/Subsidence/MapServer",
      map,
      hookServiceToTab,
      {
        downloader:downloader,
        excludeLegends:true,
        excludeDownload:["*"]
      }
    );


    //A fairly complex radio layer. 
    //The radio itself allows one to switch between services with similar signatures (ie with Points, Contours, and Color Ramps as service layers).
    //Parameters are turned on (by providing key layers) which limit the checks produced to just one per key layer
    //So several $Some_param_Points will result in one Points checkbox and a select element to choose between all the values of $Some_param
    RadioLayer(["https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Depth/MapServer",
       "https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Elevation/MapServer",
       "https://gis.water.ca.gov/arcgis/rest/services/Public/GIC_Change/MapServer"],
      map,
      hookServiceToTab,
      {
        keyLayers:["Points","Contours","ColorRamp"],
        excludeLegends:true,
        radioTitle:"Select Data Type:",
        paramTitle:"Select Period:",
        checkTitle:"Show Layers:",
        tabName:"Water Levels",
        downloader:downloader,
      }
    );
     
  });
  });
