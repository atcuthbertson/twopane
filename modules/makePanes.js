define(["dojo/on","dojo/dom-class"],function(on, domClass){
  return function(serviceNode, nodes, names){
    var nodeLength = nodes.length;
    var width = nodeLength > 4
              ? 100/(Math.ceil(nodeLength / 2)) + '%'
              : 100/nodes.length + '%'
              ;

    var attachButton = function(){
      var lastNode = null;
      var lastButton = null;
      return function(node){
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
     
    for (var i = 0; i < nodeLength; i++) {
      var button = document.createElement('div');
      button.className = "paneHandle";
      button.textContent = names[i];
      button.style.width = width;
      if(i === 3 && nodeLength > 4){
        button.style.borderLeft = "none"
        if(nodeLength === 5){
         centerRow(button, width); 
        }
      }
      if(i === 5 && nodeLength === 7){
        centerRow(button,width); 
      }

      container.appendChild(button); 

      on(button, "click", attachButton(nodes[i]));
      if(i === 0) on.emit(button, "click",{bubbles:false,cancelable:false});
    }

    serviceNode.insertBefore(container,serviceNode.firstChild);

  }

  function centerRow(node,width){
    node.style.marginLeft = +width.slice(0,-1)/2 + '%';
  }
 
  
});
