define([
  "dijit/form/HorizontalSlider",
  "modules/utils.js"
],

function(
  Slider,
  utils
){

  var DOC = document;

  return function(container, service, resolveLayer, legendDir){

    var name = utils.space(service.layerName);

    function getLegendName(service){
      return legendDir + utils.underscore(service.serviceName) + "/" + utils.underscore(service.layerName) + ".png";
    }

    function updateLegend(service){
      legend.src = getLegendName(service); 
    }

    if(legendDir){
      if(legendDir[legendDir.length - 1] !== "/") legendDir += "/"
    }else{
      legendDir = "images/legends/"
    }

    var legendName = getLegendName(service); 

    var id = Math.random(); 
    var wrapper = DOC.createElement('div');
    wrapper.className = 'serviceWrapper';

    var check = DOC.createElement('input');
    check.type = "checkbox";
    check.id = id;

    var label = DOC.createElement('label');
    label.setAttribute('for',id);
    label.textContent = label.innerText = name;

    var sliderNode = DOC.createElement('div');

    var legend = DOC.createElement('img');
    legend.className = 'legend';
    legend.src = legendName;

    wrapper.appendChild(check);
    wrapper.appendChild(label);
    wrapper.appendChild(sliderNode);
    wrapper.appendChild(legend);

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
     
    check.slider = slider;
    check.updateLegend = updateLegend;
    container.appendChild(wrapper);
     
    return check; 
  }
  
});
