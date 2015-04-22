define([
  "dijit/form/HorizontalSlider",
  "modules/utils.js",
  "modules/toggleLayer.js",
  "dojo/on"
],

function(
  Slider,
  utils,
  ToggleLayer,
  on
){

  var DOC = document; // for debugging.  Available outside function because in closure.
  
  

  return function(container, service, resolveLayer, options){

    var name = utils.space(service.layerName);
    var legendDir = options.legendDir; 
    
    function getLegendName(service){
      return legendDir + utils.underscore(service.serviceName) + "/" + utils.underscore(service.layerName) + ".png";
    }

    function updateLegend(service){
      var src = getLegendName(service);
      if(legend.src !== src) legend.src = src; 
    }
	function doCheck(){
	//var doCheck = function(){  // doCheck method of check object
		//console.log("doCheck fucntion");
		check.sliderWrapper.style.display = "block";
		if (!check.excludeLegends){
			check.legendWrapper.style.display = "block";
		}
		
		check.checked = true;
	}
	
	function doUncheck(){
	//var doUncheck = function(){ // doUncheck method of check object
		//console.log("doUncheck function");
		check.sliderWrapper.style.display = "none";
		if (!check.excludeLegends) {
			check.legendWrapper.style.display = "none";
		}
		check.checked = false;
	}
	
    if(legendDir){
      if(legendDir[legendDir.length - 1] !== "/") legendDir += "/"
    }else{
      legendDir = "images/legends/"
    }

	var underscoredName = utils.underscore(service.serviceName);
	var startEnabled = true;
	var excludeLegends = options.excludeLegends || false;
    var legendName = getLegendName(service); 
	var startEnabled = service.startEnabled;
    var id = Math.random(); 
    var wrapper = DOC.createElement('div');
    wrapper.className = 'serviceWrapper';

    var check = DOC.createElement('input');
    check.type = "checkbox";
    check.id = id;

    var label = DOC.createElement('label');
    label.setAttribute('for',id);
    label.textContent = label.innerText = name;

	// make title wrapper and add to service wrapper
	var titleWrapper = DOC.createElement('div');
    titleWrapper.appendChild(check);
    titleWrapper.appendChild(label);
	titleWrapper.className = "titleWrapper";
	wrapper.appendChild(titleWrapper);
	
	// make slider wrapper and add to service wrapper
	var sliderWrapper = DOC.createElement('div');
    var sliderNode = DOC.createElement('div');
    sliderWrapper.appendChild(sliderNode);
	sliderWrapper.className = "sliderWrapper";
	//add sliderwrapper to servicewrapper
	wrapper.appendChild(sliderWrapper);
	
	
	// make legend wrapper
    if(!options.excludeLegends){  // only make if necessary
      var legendWrapper = DOC.createElement('div');
	  var legend = DOC.createElement('img');
	  legendWrapper.appendChild(legend);
      legend.className = 'legend';
      legend.src = legendName;
      wrapper.appendChild(legendWrapper);
	  legendWrapper.appendChild(legend);
	  legendWrapper.className = "legendWrapper";
	  check.legend = legend; 
	  check.legendWrapper = legendWrapper;
	  check.legendWrapper.style.display = "none";
	  check.excludeLegends = options.excludeLegends;
    }
    var slider = new Slider({
      value:1,
      minimum:0,
      maximum:1,
      intermediateChanges: true,
      style:"width:120px;",
      onChange:function(value){
        var curr = resolveLayer(check);
        if(curr) curr.setOpacity(value);
      }
      }, sliderNode
    )
     
    slider.startup(); 
    
	check.sliderWrapper = sliderWrapper; // expose the sliderWrapper 
    check.slider = slider; // expose the slider
    check.updateLegend = updateLegend;
	check.doCheck = doCheck;
	check.doUncheck = doUncheck;
	check.excludeLegend = options.excludeLegend;
    container.appendChild(wrapper);
	// checks start out unchecked, so slider and legends should be hidden initially.
	if (startEnabled) {
		/*check.sliderWrapper.style.display = "block";
		if (!options.excludeLegends){
			check.legendWrapper.style.display = "block";
		}
		check.checked = true;*/
		doCheck();
		ToggleLayer.toggleOn(service);
		} else {
		doUncheck();
	}
	

	
	// create listener to hide slider and legend (if necessary) if unchecked, show if checked
	
	on (check, "change", function(){
		if (check.checked){
			// console.log("checked");
			doCheck();
		}else {
			// console.log("unchecked");
			doUncheck();
		}});
	
	
	/*if (options.startEnabled){
		for (i=0; i< options.StartEnabled.length; i++){
			if options.startEnabled[i] === 
	*/
	// lets see if we can start a check enabled.
	
    return check; 
  }
  
});
