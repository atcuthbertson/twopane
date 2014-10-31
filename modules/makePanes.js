define(["dojo/on","dojo/dom-class"],function(on, domClass){
  return function(serviceNode, populate, services, names){
    var len = services.length;
    var width = len > 4
              ? 100/(Math.ceil(len / 2)) + '%'
              : 100/len + '%'
              ;

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
          serviceNode.appendChild(node);

          lastNode = node;
          lastButton = this;
        }
      }
    }();

    var container = document.createElement('div');
    container.className = "paneHandles";
     
    for (var i = 0; i < len; i++) {
      var button = document.createElement('div');
      button.className = "paneHandle";
      button.textContent = names[i];
      button.style.width = width;
      if(i === 3 && len > 4){
        button.style.borderLeft = "none"
        if(len === 5){
         centerRow(button, width); 
        }
      }
      if(i === 5 && len === 7){
        centerRow(button,width); 
      }

      container.appendChild(button); 

      on(button, "click", attachButton(services[i]));
      if(i === 0) on.emit(button, "click",{bubbles:false,cancelable:false});
    }

    serviceNode.insertBefore(container,serviceNode.firstChild);

  }

  function centerRow(node,width){
    node.style.marginLeft = +width.slice(0,-1)/2 + '%';
  }
 
  
});
