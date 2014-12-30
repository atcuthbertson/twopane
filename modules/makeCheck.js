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

    if(legendDir){
      if(legendDir[legendDir.length - 1] !== "/") legendDir += "/"
    }else{
      legendDir = "images/"
    }

    var legendName = legendDir + utils.underscore(service.serviceName) + "_" + utils.underscore(service.layerName) + ".png";

    var id = Math.random(); 
    var wrapper = DOC.createElement('div');
    wrapper.className = 'serviceWrapper';

    var check = DOC.createElement('input');
    check.type = "checkbox";
    check.id = id;

    var label = DOC.createElement('label');
    label.setAttribute('for',id);
    label.textContent = label.innerText = name;

    var legend = DOC.createElement('img');
    img.className = 'legend';
    img.src = legendName;

    var sliderNode = DOC.createElement('div');

    wrapper.appendChild(check);
    wrapper.appendChild(label);
    wrapper.appendChild(legend);
    wrapper.appendChild(sliderNode);

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
     
    check.slider = slider;
    slider.startup(); 

    container.appendChild(wrapper);

    return check;
  }
});
