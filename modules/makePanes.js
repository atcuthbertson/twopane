define(["dojo/on"],function(on){
  return function(serviceNode, nodes, names){
    var width = nodes.length > 4
              ? 100/(Math.ceil(nodes.length / 2)) + '%'
              : 100/nodes.length + '%'
              ;

    var container = document.createElement('div');
    container.className = "paneHandles";
     
    for (var i = 0, l = nodes.length; i < l; i++) {
      var node = nodes[i];
      var button = document.createElement('div');
      button.className = "paneHandle";
      button.textContent = names[i];
      button.style.width = width;
      container.appendChild(button); 
    }

    serviceNode.insertBefore(container,serviceNode.firstChild);
  }
});
