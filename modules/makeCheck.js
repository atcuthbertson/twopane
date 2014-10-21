define([
  "dijit/form/HorizontalSlider"
  ],
function(
  Slider
){

    var DOC = document;

    function makeSpaced(name){
      return name.replace(/_/g," ")
    }

    return function(layerInfo, layerId, container, services){
      var id = Math.random();

      var wrapper = DOC.createElement('div');
      wrapper.className = 'serviceWrapper';

      var check = DOC.createElement('input');
       check.type = "checkbox";
      check.id = id;

      var label = DOC.createElement('label');
      label.setAttribute('for',id);
      label.innerText = makeSpaced(layerInfo.name);

      var sliderNode = DOC.createElement('div')

      wrapper.appendChild(check);
      wrapper.appendChild(label);
      wrapper.appendChild(sliderNode);

      var slider = new Slider({
        value:1,
        minimum:0,
        maximum:1,
        intermediateChanges: true,
        style:"width:120px;",
        onChange:function(value){
          services[layerId].setOpacity(value);
        }
        }, sliderNode
      ).startup();

      container.appendChild(wrapper);

      return check;
    }
});