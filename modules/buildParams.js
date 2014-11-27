define([
  'dijit/form/ComboBox',
  'dojo/store/Memory'
],

function(
  ComboBox,
  Memory
){

  return function(container, resolver, makeParamResolver, options){

    function groupServices(services, keyLayers){
      var groups = [];

      for(var h = 0; h<keyLayers.length; h++){
        var group = {
          services : [],
          params: [],
          layerName : keyLayers[h],
          serviceName: services[0].serviceName
        };
        groups.push(group);
      }

      for(var i=0; i<services.length; i++){
        for(var j=0; j<keyLayers.length; j++){
          var service = services[i];
          var layer = keyLayers[j];
          var index = service.layerName.indexOf(layer)
            if(index > -1){
              groups[j].services.push(service);
              groups[j].params.push(service.layerName.slice(index+layer.length+1))
                break;
            }
        }
      }

      return groups;
    }

    function addLayers(services, keyLayers, options){
      var serviceGroups = groupServices(services, keyLayers)
        var inp = document.createElement('input');
      container.appendChild(inp); 

      var cb = new ComboBox({store:[123,345,456]},inp).startup(); 
      console.log(cb); 
      return serviceGroups
    }
    
    return addLayers; 
    
  } 
});
