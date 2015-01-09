define([
  "esri/dijit/InfoWindow",
  "dijit/layout/ContentPane",
  "dijit/layout/TabContainer",

  "dojo/on",
  "dojo/_base/array",
  "esri/geometry/ScreenPoint",

  "esri/tasks/identify",
  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",
  ],
function(
  InfoWindow,
  ContentPane,
  TabContainer,

  on,
  array,
  ScreenPoint,

  identify,
  IdentifyTask,
  IdentifyParameters
){
  var DOC = document
    , map
    , infoWindow
    , tabs
    , mapPane
    , mapPaneId
    , identifyParameters

    , mdX = 0
    , mdY = 0
    , lastClick = 0
    , wasDouble = 0
    , notMap = 0

    , activeLayers = {}
    , identifyTasks = {}

    , titleFn
    , contentFn
    ;




  function init (mapArg, options){
    map = mapArg;
    titleFn = options&&options.setTitle ? options.setTitle : setTitle;
    contentFn = options&&options.setContent ? options.setContent : setContent;

    mapPane = map.container;
    mapPaneId = mapPane.id;


    infoWindow = new InfoWindow();
    infoWindow.startup();
    infoWindow.setTitle('<a id="zoomLink" action="javascript:void 0">Information at this Point</a>')
    map.setInfoWindow(infoWindow);

    identifyParameters = new IdentifyParameters();
    identifyParameters.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
    identifyParameters.tolerance = 3;
    identifyParameters.returnGeometry = false;


    tabs = new TabContainer({style:"height:100%;"},'infoTabContainer');
    infoWindow.setContent(tabs.domNode)


    infoWindow.on('hide',function(){
      infoWindow.resize(425,325);
    })

    infoWindow.resize(425,325);
    infoWindow.show(0,0);
    setTimeout(function(){infoWindow.hide()},0);




    //Handle clicks intelligently
    on(mapPane,"mousedown",function(e){
      mdX = e.clientX;
      mdY = e.clientY;
      var now = new Date().getTime();

      if(now - lastClick < 300)
        wasDouble = 1;
      else
        wasDouble = 0;

      lastClick = now;

      //if the first click wasn't on the map either, don't first double
      if(wasDouble&&notMap){
        return;
      }

      if(e.target.id.slice(0,mapPaneId.length)===mapPaneId)
        notMap = 0;
      else
        notMap = 1;

      if(wasDouble)
        fireZoom(e);
    });


    on(mapPane,"mouseup",function(e){
      if (notMap) return;
      if(wasDouble){
        return wasDouble = 0;
      }
      if(Math.abs(e.clientX-mdX)<10&&Math.abs(e.clientY-mdY)<10){

        addEventCoordinates(e);
        runIdentify(e);
        setInfoPoint(e);
      }
    });
  }




  function fireZoom(e){
    addEventCoordinates(e)
    lastClick = 0;
    infoWindow.hide();
    map.centerAndZoom(e.mapPoint,map.getLevel()+1)
  }


  function addEventCoordinates(e){
    var  x = e.clientX - centerPane.offsetLeft -1;
    var  y = e.clientY - centerPane.offsetTop -1;

    e.screenPoint = new ScreenPoint(x,y);
    e.mapPoint = map.toMap(e.screenPoint)
  }


  function setInfoPoint(event){
    if(infoWindow.zoomHandler)
      infoWindow.zoomHandler.remove();
    var zoomLink = DOC.getElementById('zoomLink');
    if(zoomLink){
      infoWindow.zoomHandler = on(zoomLink,'click',function(){
        map.centerAndZoom(event.mapPoint,12)
      });
    }
  }




  function runIdentify(event){
    var noneShowing = 1;
    infoWindow.show(event.screenPoint);

    identifyParameters.geometry = event.mapPoint;
    identifyParameters.mapExtent = map.extent;
    identifyParameters.width = map.width;
    identifyParameters.height = map.height;

    array.forEach(tabs.getChildren(),function(v){tabs.removeChild(v)});

    for(var url in identifyTasks){
      var layers = activeLayers[url];
      if(!layers.length) continue;

      noneShowing = 0;
      identifyParameters.layerIds = layers;
      identifyTasks[url].execute(identifyParameters,processIdentify)
    }

    if(noneShowing){
      setNoData();
    }
  }




  function processIdentify (results){
    if(!results.length) return setNoData();

    array.forEach(results,function(result){
      var tab = new ContentPane(makePane(result))
      tabs.addChild(tab);
    })

    tabs.resize();
  }




  function makePane(result){
    var title = titleFn(result);
    var content = contentFn(result)

    return {
            title:title,
            content:content
           }
  }


  function setTitle(result){
    return utils.space(result.layerName);
  }


  function setContent(result){

    var attributes = result.feature.attributes;
    var list = "<ul>";
    for (var key in attributes){
      if(attributes.hasOwnProperty(key)
        &&key!=="OBJECTID"
        &&key!=="Shape"
        &&key!=="Shape_Area"
        &&key!=="Shape_Length"
        &&key!=="Pixel Value"
        ){
        list += "<li><strong>" + utils.space(key) + "</strong>: " + getAttributeHTML(attributes[key]) + "</li>"
      }
    }
    list +="</ul>"
    return list;
  }


  function getAttributeHTML(value){
    var link = /(?:^https?|^ftp):\/\//i;

    if(link.test(value))
      return '<a target="_blank" href="'+value+'">'+value+'</a>'
    else
      return value;
  }



  function setNoData(){
    var tab = new ContentPane({
        content:"<p>No Data</p>",
        title:"No Data"
      })
      tabs.addChild(tab);
  }



  function activate(service){
    activeLayers[service.url].push(service.visibleLayers[0]);
  }


  function deactivate(service){
    var arr = activeLayers[service.url];
    for(var i=0; i<arr.length; i++){
      if(arr[i] === service.visibleLayers[0]) return arr.splice(i,1)
    }
  }


  function register(url){
    identifyTasks[url] = new IdentifyTask(url);
    activeLayers[url] = [];
  }


  return {
    activate:activate,
    deactivate:deactivate,
    register:register,
    init:init
  }

});
