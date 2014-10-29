//Provide to the layers to add layer metadata to the right pane
define([],function(){
    function populateRightPane(title,data){

      if(title){
        var titleNode = DOC.createElement('h3');
        titleNode.className = 'datatitle';
        titleNode.innerHTML = title;
        dataNode.appendChild(titleNode);
      }

      if(data){
        var contentDiv = DOC.createElement('div');
        contentDiv.innerHTML = data;
        dataNode.appendChild(contentDiv);
      }
    }


    //Track whether any layer has been added to the map
    populateRightPane.noLayers = 1;


    function clearRightPane(){
      dataNode.innerHTML = '';
    }

    return {
      setData:setData,
      show:show,
      showLayer:showLayer
    }
});
