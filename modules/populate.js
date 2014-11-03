define([],function(){
    var node;
    var lastWrap; 
    function populate(title, data){
      var wrapper = DOC.createElement('div');
      if(title){
        var titleNode = DOC.createElement('h3');
        titleNode.className = 'datatitle';
        titleNode.innerHTML = title;
        wrapper.appendChild(titleNode);
      }

      if(data){
        var contentDiv = DOC.createElement('div');
        contentDiv.innerHTML = data;
        wrapper.appendChild(contentDiv);
      }

      if(lastWrap)node.removeChild(lastWrap);

      node.appendChild(wrapper);
    }
    
    populate.init = function(container){
      node = container;
    }

    return populate;
});
