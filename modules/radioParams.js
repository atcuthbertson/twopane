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

    var changeSpans;
    var changeYears=[];
    var depthYears=[];



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


function buildChangeYears(layerInfos){
  var yearObj= {};
  forEach(layerInfos,function(info,i){
    var years = extractYears(info.name);
    addYearsFromSpan(yearObj,years);
  })

  for(var year in yearObj){
    changeYears.push({"year":year})
    yearObj[year].sort(sortSpans);
  }
  changeYears.sort(sortYears)
  return yearObj;
}

function buildDepthYears(layerInfos){
  var yearReg = /\d{4}/;
  forEach(layerInfos,function(info,i){
    depthYears.push({"year":info.name.match(yearReg)})
  });
  return depthYears.sort(sortYears);
}


function extractYears(name){
  var arr = name.split("_");
  return [arr[0].slice(1),arr[1].slice(1)]
}


function addYearsFromSpan(yearObj,years){
  var end = years[0];
  var start = years[1];
  var phrase = makeSpanPhrase(start,end);

  ensureKeyExists(yearObj,start);
  ensureKeyExists(yearObj,end);

  yearObj[start].push({span:phrase});
  yearObj[end].push({span:phrase});
}


function ensureKeyExists(obj,year){
  if(obj[year] === undefined) obj[year] = [];
}


function makeSpanPhrase(start, end){
  return start+" to "+end;
}

function sortObj(a,b,key){
  return a[key]-b[key];
}

function sortSpans(a,b){
  return sortObj(a,b,"span")
}
function sortYears(a,b){
  return sortObj(a,b,"year")
}


function setSpanData(year){
  var years = changeSpans[year];
  levelStoreSpan.setData(years)
  levelComboSpan.setValue(years[0].span);
}


function setYearData(radio){
  if(radio === changeRadio){
    levelStoreYr.setData(changeYears);
    if(!checkYear(selectYear.value,changeYears))
      levelComboYr.setValue(changeYears[changeYears.length-1].year);
  }else{
    levelStoreYr.setData(depthYears);
    if(!checkYear(selectYear.value,depthYears))
      levelComboYr.setValue(depthYears[depthYears.length-1].year);
  }
}

function checkYear(year,years){
  for(var i=0;i<years.length;i++){
    if(years[i].year == year) return 1;
  }
  return 0;
}



var levelStoreYr = new Memory({
  data: []
});

var levelStoreSeason = new Memory({
  data: [
    {name:"Spring"}
  ]
});

var levelStoreSpan= new Memory({
  data:[]
});


var levelComboYr = new ComboBox({
        id: "selectYear",
        name: "Year",
        style:{width: "100px"},
        value: "",
        store: levelStoreYr,
        searchAttr: "year"
    },"selectYear");

var levelComboSeason = new ComboBox({
        id: "selectSeason",      
        name: "Season",
        style:{width: "100px"},
        value: "Spring",
        store: levelStoreSeason,
        searchAttr: "name"
    }, "selectSeason");
  
var levelComboSpan= new ComboBox({
        id: "selectSpan",
        name: "Comparison Period",
        style:{width: "125px", align:"center"},
        value: "",
        store: levelStoreSpan,
        searchAttr: "span"
    }, "selectSpan");

var selectSeason=dom.byId("selectSeason");
var selectYear = dom.byId("selectYear");
var selectSpan = dom.byId("selectSpan");
var spanDijit = registry.byId("selectSpan");


//Getting layer ID from combobox dropdown selections

function getLayerId(type,key){
  var layerInfos = staticServices[key].layerInfos
  var season = selectSeason.value;
  var year = selectYear.value;
  var span = type === "Change"
           ? selectSpan.value
           : ''
           ;
  return matchLayer(layerInfos,season,year,span);
}

function getLayerName(type,key){
  var layerInfos = staticServices[key].layerInfos;
  var id = getLayerId(type,key);
  if(layerInfos[id])
    return layerInfos[id].name
}

//misguided service-specific. There is a better way than layer name regexes...maybe
//Need to at least provide the layer matching function
function matchLayer(layerInfos,season,year,span){
  var reg;
  if(span !== ''){
    var spl = span.split(' ');
    var start = spl[0];
    var end = spl[2];
    reg = new RegExp(end + ".*" + start);
  }else{
    reg = new RegExp("("+season+"|"+season[0]+").*"+year)
  }
  for(var i=0; i < layerInfos.length;i++){
    if(reg.test(layerInfos[i].name))
      return i;
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



    var radioNames = {
      Depth : "Depth Below Ground",
      Elevation : "Groundwater Elevation",
      Change : "Change in Groundwater Level"
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

function disableLayer(input){
  input.disabled = true;
  input.checked = false;
  input.parentNode.style.opacity="0.7"
}

function enableLayer(input){
  input.disabled = false;
  input.parentNode.style.opacity="1"
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