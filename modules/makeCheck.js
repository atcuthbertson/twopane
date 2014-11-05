define([
  "dijit/form/HorizontalSlider"
  ],
function(
  Slider
){

    var DOC = document;

    return function(container, name, resolveLayer){
      var id = Math.random();

      var wrapper = DOC.createElement('div');
      wrapper.className = 'serviceWrapper';

      var check = DOC.createElement('input');
      check.type = "checkbox";
      check.id = id;

      var label = DOC.createElement('label');
      label.setAttribute('for',id);
      label.innerText = name;

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
          resolveLayer().setOpacity(value);
        }
        }, sliderNode
      ).startup();

      container.appendChild(wrapper);

      return check;
    }
});