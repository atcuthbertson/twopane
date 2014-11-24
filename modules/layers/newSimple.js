define([
  "modules/layers/makeServices.js",
  "modules/resolveLayers.js",
  "modules/clearAllLayers.js",
  "modules/toggleLayer.js"
  ],
function(
  makeServices,
  ResolveLayers,
  clearAllLayers,
  toggleLayer
){

  function resolvingFn(services){
    return services[0]; 
  }

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  var nameReg = /([^\/]*)\/MapServer/;
      //
      //  Make all services, augment services, call passed function
      //  This function will decide how many checks to build
      //  and how to hook them to each service
      //  (if params exist, for each param, build a mapping from
      //  param name to service.. then carry this over to the check/resolver)
      //



    var buildCheck = function(){
      var checks = [];
      return function(serviceUnderscored, service, id, layerInfo){

        var underscoredName = makeUnderscored(layerInfo.name);
        var spacedName = makeSpaced(layerInfo.name);


        if(checks[id]){
          return checks[id];
        }else{
          var check = makeCheck(container, spacedName, resolver.resolve);
          checks[id] = check;
          on(check,"change",checkResolver);
          return check;
        }
      }
    }();


    function checkResolver(){
      var layer = resolver.resolve(this);
      toggleLayer.toggle(layer);
      if(!layer.suspended)spinner(this,layer);
    }

      var firstService = makeService(url);
      if(i===0) 
      else layerQueue.push(firstService, processLayer, 0);
    });

        var check = buildCheck(serviceUnderscored, service, i, layerInfos[i]);
        resolver.register(check, service);
if(serviceObj.needsUI){
        var serviceProps = {};

        serviceProps.node = container;
        serviceProps.name = serviceName;
        serviceProps.description = layer.description;
        serviceProps.tabName = tabName? tabName : serviceName;

        hookService(serviceProps);
      }
      */
  function attachUI(services){
    console.log(services);
  }

  return function(url, map, hookService, options){
    
    var serviceName = makeSpaced(url.match(nameReg)[1]);
    var container = document.createElement('div');
    var title = document.createElement('h3');

    title.textContent = title.innerText = serviceName;
    container.appendChild(title);
     
    var resolver = ResolveLayers(resolvingFn);
    clearAllLayers.register(resolver);  
    toggleLayer.register(options);

    makeServices(url, map, attachUI, options);
  }

});
