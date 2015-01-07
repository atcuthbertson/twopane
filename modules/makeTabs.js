define([
  "dojo/on",
  "dojo/dom-class",
  "modules/layerQueue.js"
],

function(
  on,
  domClass,
  layerQueue
){
  
  return function(serviceNode, populate){

    var len;
    var width;
    var container = document.createElement('div');
    container.className = "paneHandles";
    serviceNode.insertBefore(container,serviceNode.firstChild);


    layerQueue.subscribe(function(services){
      len = services.length;
      width = len > 4 
              ? 100/(Math.ceil(len / 2)) + '%'
              : 100/len + '%'
              ;
    })




    var attachButton = function(){
      var lastNode = null;
      var lastButton = null;
      return function(service){
        return function(button){
          if(lastNode){
            serviceNode.removeChild(lastNode);
            domClass.remove(lastButton,"selectedButton");
          }
          domClass.add(this,"selectedButton");
          serviceNode.appendChild(service.node);
          populate(service.tabName, service.description); 

          lastNode = service.node;
          lastButton = this;
        }
      }
    }();

     
    function hookServiceToTab(service){
      var button = document.createElement('div');
      button.className = "paneHandle";
      button.textContent = service.tabName;
      button.style.width = width;

      var curr = container.childNodes.length;
      if(curr === 1) container.style.display = "block";
      if(curr === 3 && len > 4){
        button.style.borderLeft = "none"
        if(len === 5){
         centerRow(button, width); 
        }
      }
      if(curr === 5 && len === 7){
        centerRow(button,width); 
      }

      container.appendChild(button); 

      on(button, "click", attachButton(service));
      if(curr === 0) on.emit(button, "click",{bubbles:false,cancelable:false});
    }




    return hookServiceToTab;

  }

  function centerRow(node,width){
    node.style.marginLeft = +width.slice(0,-1)/2 + '%';
  }
 
  
});
