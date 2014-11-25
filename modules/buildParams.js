define([],function(){

  function groupServices(services, keyLayers){
    var groups = {};

    for(var h = 0; h<keyLayers.length; h++){
      groups[keyLayers[h]] = [];
    }

    for(var i=0; i<services.length; i++){
      for(var j=0; j<keyLayers.length; j++){
        var service = services[i];
        var layer = keyLayers[j];
        if(service.layerName.indexOf(layer) > -1){
          groups[layer].push(service);
          break;
        }
      }
    }

    return groups;
  }


  return function(services, keyLayers, resolver, container, options){
    var serviceGroups = groupServices(services, keyLayers)
    console.log(serviceGroups)
  }
});