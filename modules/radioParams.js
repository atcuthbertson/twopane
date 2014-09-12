    var serviceTypes = ["Change","Elevation","Depth"];
    var serviceNames = ["_Ramp","_Contours","_Points"];

    var depthRadio = dom.byId("radio1");
    var elevRadio = dom.byId("radio2");
    var changeRadio = dom.byId("radio3");

    var measurementCheck = dom.byId("levelMeasurement");
    var contoursCheck = dom.byId("levelContours");
    var rampCheck = dom.byId("levelRamp");
    var checks = query("#activeLayers input");

    var totalServices = serviceTypes.length*serviceNames.length;
    var loadedServices = 0;



  forEach(serviceTypes,function(type){
    forEach(serviceNames,function(name){
      var url = prefix+type+name+suffix;
      var layer = new ArcGISDynamicMapServiceLayer(url,
            {"imageParameters": imageParameters})
      layer.on('update-end',layerUpdateEnd);
      layer.suspend();
      layers.push(layer)
      staticServices[type+name] = layer;
      identifyTasks[url] = new IdentifyTask(url);
      layer.on('load',function(evt){initializeLayers(evt.layer,type,name)});
    });
  });

  // Add active layers to map
  map.addLayers(layers);



      function initializeLayers(layer,type,name){
    var key = type+name;
    if(name==="_Points")serviceDescriptions[type] = layer.description;
    if(key==="Change_Points"){
      changeSpans = buildChangeYears(layer.layerInfos);
      
    }else if(key==="Depth_Points"){
      depthYears = buildDepthYears(layer.layerInfos);
    }
    loadedServices++;
    if(loadedServices===totalServices){
      setYearData(changeRadio);
      inputQuery();
      attachInputHandlers();
    }
  }

function yearChange(year){
  setSpanData(year);
  inputQuery();
}

function spanChange(){
  inputQuery();
}

function checkHandler(e){
  var check = e.target;
  if(check.checked) addLoading(check);
  else removeLoading(check);

  inputQuery();
}

/*radioNames[type]
  serviceDescriptions[type];
  */
//populateRightPane is provided.. need to give it hooks to proper data... it just puts data in the dom and resizes
function clearAndQuery(){
  populateRightPane();
  showLegend(this.id)
  clearAllLayers();
  setYearData(this);
  inputQuery();
}

//Query builder for Groundwater Level Change

function inputQuery(){
  var type = getRadio();
  if(type === "Change") spanDijit.attr("disabled",false);
  else spanDijit.attr("disabled",true);

  var checkedServices = getCheckedServices();

  toggleLayers(type,checkedServices);
}

function toggleLayers(type,checkedServices){
  var services = getServicesFromChecks(checkedServices);
  forEach(services,function(name,i){
    var key = type+name;
    var layerId = getLayerId(type,key);
    if(layerId===undefined){
      disableLayer(checks[i])
    }else{
      enableLayer(checks[i])
      if(checkedServices[i])
        showLayer(key,layerId)
      else
        hideLayer(key,layerId)
    }
  })
}

function getCheckedServices(){
  return checks.map(function(node,i){
    return node.checked
  });
}

function clearAllLayers(){
  var checked = getCheckedServices();
  forEach(serviceTypes,function(type){
    var services = getServicesFromChecks(checked);
    forEach(services,function(name, i){
      var key = type+name;
      var layerId = getLayerId(type,key);
      hideLayer(key,layerId)
    })
  })
}

function showLayer(serviceName,layerId){
  var service = staticServices[serviceName];
    service.resume();
    service.setVisibleLayers([layerId])
    addVisibleUrl(service.url,service)
}

function hideLayer(serviceName,layerId){
  var service = staticServices[serviceName];
  if(!service.suspended){
    service.setVisibleLayers(noLayers)
    service.suspend();
    removeVisibleUrl(service.url);
  }
}


//Build this dynamically from an array of radio categories provided
function getRadio(){
    var type = depthRadio.checked === true
             ? "Depth"
             : elevRadio.checked
               ? "Elevation"
               : "Change"
             ;
    return type;
}




//delete this.. make a user provide objects which have service endpoints and legend info
function showLegend(id){
  if(id === "radio1"){
    pointsLegend.src = "images/Dynamic_DepthPoints.png";
  contoursLegend.src= "images/Dynamic_DepthContour.png";
  rampLegend.src= "images/Dynamic_DepthRamp.png";
  }else if (id === "radio2"){
    pointsLegend.src = "images/Dynamic_ElevationPoints.png"
  contoursLegend.src= "images/Dynamic_ElevationContour.png";
  rampLegend.src= "images/Dynamic_ElevationRamp.png";

  }else{
    pointsLegend.src = "images/Dynamic_ChangePoints.png";
  contoursLegend.src= "images/Dynamic_ChangeContours.png";
  rampLegend.src= "images/Dynamic_ChangeRamp.png";

  }
}


function attachInputHandlers(){
  on(levelComboYr,"change",yearChange)
  on(levelComboSeason,"change",inputQuery)
  on(levelComboSpan,"change",inputQuery)

  on(depthRadio,"click",clearAndQuery)
  on(elevRadio,"click",clearAndQuery)
  on(changeRadio,"click",clearAndQuery)

  on(measurementCheck,"click", checkHandler)
  on(contoursCheck,"click", checkHandler)
  on(rampCheck,"click", checkHandler)
}