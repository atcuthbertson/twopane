define([
  "esri/dijit/InfoWindow",
  "dijit/layout/ContentPane",
  "dijit/layout/TabContainer",

  "dojo/on",
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

    , activeUrls = {}
    , identifyTasks = {}
    ;




  function init (mapArg){
    map = mapArg;
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


  function activate(url,service){
    activeUrls[url] = service;
  }


  function deactivate(url){
    activeUrls[url] = null;
  }


  function register(url,task){
    identifyTasks[url] = task;
  }




  function addEventCoordinates(e){
    var  x = e.clientX - centerPane.offsetLeft -1;
    var  y = e.clientY - centerPane.offsetTop -1;

    e.screenPoint = new ScreenPoint(x,y);
    e.mapPoint = map.toMap(e.screenPoint)
  }


  function fireZoom(e){
    addEventCoordinates(e)
    lastClick = 0;
    infoWindow.hide();
    map.centerAndZoom(e.mapPoint,map.getLevel()+1)
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
    forEach(tabs.getChildren(),function(v){tabs.removeChild(v)});

    for(var taskUrl in identifyTasks){
      if(!activeUrls[taskUrl]) continue;
        noneShowing = 0;
        identifyParameters.layerIds = activeUrls[taskUrl].visibleLayers;
        identifyTasks[taskUrl].execute(identifyParameters,doProcess(taskUrl))
    }

    if(noneShowing){
      setNoData();
    }
  }

  function doProcess(url){
    return function(results){
      processIdentify(results,url);
    }
  }

  function processIdentify (results,url){
    if(!results.length) return
    forEach(results,function(result){
      var tab = new ContentPane(makePane(result,url))
      tabs.addChild(tab);
    })
    tabs.resize();
  }

  function makePane(result,url){
    var isChange = !!url.match("GIC_Change");
    var activeData = !!url.match(/_Change_|_Depth_|_Elevation_/);
    var title;
    var blurb;
    if(activeData){
      title = getTitle(result,isChange);
      blurb = getBlurb(title,isChange,url);
    }else{
      title = makeSpaced(result.layerName)
      blurb = '';
    }
    var content = makeContent(result.feature.attributes,blurb)

    return{title:title,content:content}
  }



  function getTitle(result,isChange){
    var name = result.layerName;
    var season = name.match(/S|F/);
    if(season[0] === "S") season = "Spring "
    else season = "Fall "

    if(isChange){
      var arr=name.match(/(\d{4}).*(\d{4})/);
      return arr[2] +" to "+arr[1];
    }
    return season+name.match(/\d{4}/)[0]
  }



  function makeContent(attributes,blurb){
    var list = blurb+"<ul>";
    for (var key in attributes){
      if(attributes.hasOwnProperty(key)
        &&key!=="OBJECTID"
        &&key!=="Shape"
        &&key!=="Shape_Area"
        &&key!=="Shape_Length"
        &&key!=="Pixel Value"
        ){
        var spaced = makeSpaced(key)
        list+= "<li><strong>"+spaced+"</strong>: "+getAttributeHTML(attributes[key])+"</li>"
      }
    }
    list +="</ul>"
    return list;
  }



  function makeSpaced(name){
    return name.replace(/_/g," ")
  }



  function getAttributeHTML(value){
    var pboLink = /http:\/\/pboshared\.unavco\.org.*/i;
    var regLink = /(?:^https?|^ftp):\/\//i;
    var hydstraImg = /^<img.*hydstra/i;

    if(pboLink.test(value))
      return makeImage(value);
    else if(regLink.test(value))
      return '<a target="_blank" href="'+value+'">'+value+'</a>'
    else if(hydstraImg.test(value))
      return makeEmbedded(value,0);
    else
      return value;
  }



  function makeImage(link){
    setTimeout(function(){
      infoWindow.resize(560,420);
      tabs.resize();
    },0)
    var image = '<div class="identifyLinkImage" style="background-image:url('+link+')"></div>';
    return '<a target="_blank" href="'+link+'">'+image+'</a>'
  }



  function makeEmbedded(value){
    var urlReg = /src=['"](.*?)['"]/;
    var url = urlReg.exec(value)[1];

    value = value.slice(0,5)+'style="width:512px;height:384px;" '+value.slice(5);

    setTimeout(function(){
      infoWindow.resize(612,500);
      tabs.resize();
    },0)

    return '<a target="_blank" href="'+url+'">'+value+'</a>'
  }



  function getBlurb(title,isChange,url){
    var type;
    if(isChange){
        return "<span>Groundwater change from "+ title+".</span>";
    }else{
      if(url.match("GIC_Elevation"))
        type = "Groundwater elevation measured in "
      else type = "Water depth below ground measured in "
      return "<span>"+ type + name +".</span>"
    }
  }



  function setNoData(){
    var tab = new ContentPane({
        content:"<p>No Data</p>",
        title:"No Data"
      })
      tabs.addChild(tab);
  }


  //ie shim
  function forEach(arr,fn){
    for(var i=0;i<arr.length;i++){
      fn(arr[i],i,arr)
    }
  }


  return {
    activate:activate,
    deactivate:deactivate,
    register:register,
    init:init
  }

});
