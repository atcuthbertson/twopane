define([
  'dijit/registry',
  'dijit/form/ComboBox',
  'dojo/store/Memory',
  'modules/toggleAll.js',
  'modules/makeHeader.js',
  'modules/utils.js'
],

function(
  registry,
  ComboBox,
  Memory,
  toggleAll,
  makeHeader,
  utils
){

  return function(container, resolver, makeParamResolver, options){

    var inp = document.createElement('input');
    var groupObj = {};
    var paramObject = {param:''};
    var firstPass = 1;
    resolver.wrap(makeParamResolver(paramObject));

    makeHeader(container, options.paramTitle||"Select Parameter:"); 
    container.appendChild(inp); 

    var memory = new Memory({
      data:[]
    });

    var combo = new ComboBox({store:memory,
                              searchAttr:"param"
                             },inp);
    options.paramEffects.subscribe(function(value){
      toggleAll(resolver,function(){
        paramObject.param = value;
      });
    });
    
    combo.onChange = options.paramEffects.broadcast;
    combo.startup();
     
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
          var param = extractParam(service, layer);

          if(param){
            groups[j].services.push(service);
            groups[j].params.push(param);
            break;
          }
        }
      }

      return groups;
    }

    function extractParam(service, layer){
      if(service.layerName.match(layer)){
        var arr = service.layerName.split(layer);
        for(var i=0; i<arr.length; i++){
          if(arr[i]!==''){
            return utils.trim(utils.space(arr[i]));
          }
        }
      }
      return null;
    }

    function addLayers(services, keyLayers, options){
      var serviceGroups = groupServices(services, keyLayers)
      groupObj[serviceGroups[0].serviceName] = {
        group:serviceGroups,
        params:unionParams(serviceGroups)
      }
      return serviceGroups
    }

    function unionParams(serviceGroups){
      var paramObj = {};
      var params = [];
      for(var i=0; i<serviceGroups.length; i++){
        var currParams = serviceGroups[i].params;
        for(var j=0; j<currParams.length; j++){
          var curr = currParams[j];
          if(!paramObj[curr]){
            params.push({param:curr});
            paramObj[curr] = 1;
          }
        }
      }
      return params;
    }


    function setParams(e){
      var params = groupObj[utils.underscore(utils.getRadioLabel(e))].params;
      var lastVal = combo.value;
      memory.setData(params);
      for(var i=0; i<params.length; i++){
        if(lastVal === params[i].param) break;
      }
      if(firstPass){
        paramObject.param = params[0].param;
        firstPass = 0;
      }
      if(i===params.length||!lastVal)combo.setValue(params[0].param)
    }

     
    return {
      setParams:setParams,
      addLayers:addLayers 
    } 
  }
});
