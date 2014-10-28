define(["dojo/on"],function(on){
  return function(serviceNode, nodes, names){
    var nodeLength = nodes.length;
    var width = nodeLength > 4
              ? 100/(Math.ceil(nodeLength / 2)) + '%'
              : 100/nodes.length + '%'
              ;

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
          button.style.marginLeft = +width.slice(0,-1)/2 + '%';
        }
      }
      container.appendChild(button); 
    }

    serviceNode.insertBefore(container,serviceNode.firstChild);
  }
});
