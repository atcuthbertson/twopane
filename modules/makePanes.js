define(["dojo/on"],function(on){
  return function(serviceNode, nodes, names){
    var container = document.createElement('div');
    container.className = "paneHandles";

    for (var i = 0, l = nodes.length; i < l; i++) {
      var node = nodes[i];
      var button = document.createElement('div');
      button.className = "paneHandle";
      button.textContent = names[i];
      container.appendChild(button);
       
    }
  }
});
