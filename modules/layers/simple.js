define([
  "dojo/on",

  "modules/layers/makeServices.js",
  "modules/resolveLayers.js",
  "modules/clearAllLayers.js",
  "modules/toggleLayer.js",
  "modules/makeCheck.js",
  "modules/spinner.js",
  "modules/utils.js"
],

function(
  on,

  makeServices,
  ResolveLayers,
  clearAllLayers,
  toggleLayer,
  makeCheck,
  spinner,
  utils
){

  function resolvingFn(services){
    return services[0]; 
  }


  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    if(layer){
      toggleLayer.toggle(layer);
      if(!layer.suspended)spinner(this,layer);
    }
  }

      //  Make all services, augment services, call passed function
      //  This function will decide how many checks to build
      //  and how to hook them to each service
      //  (if params exist, for each param, build a mapping from
      //  param name to service.. then carry this over to the check/resolver)




  function makeAttacher(resolver, container, hookServiceToTab, options){

    function boundResolver(){
      return checkResolver.call(this,resolver)
    }

    return function (services, serviceObj){
      for(var i=0; i<services.length; i++){
        var service = services[i];
        var check = makeCheck(container, service, resolver.resolve, options);

        resolver.register(check, service);
        on(check,"change",boundResolver);
      }

      if(serviceObj.needsUI){
        var serviceProps = {
          node : container,
          description : serviceObj.evt.layer.description,
          tabName : options.tabName
        }

        hookServiceToTab(serviceProps);
      }
    }
  }

  /*
   * The return value of the module.
   *
   */ 
  return function(url, map, hookServiceToTab, options){
     
    var serviceName = utils.space(utils.getServiceName(url));
    if(!options) options = {};
    if (!options.tabName) options.tabName = serviceName;

    var container = document.createElement('div');
    var title = document.createElement('h3');

    title.textContent = title.innerText = serviceName;
    container.appendChild(title);
     
    var resolver = ResolveLayers(resolvingFn);
    var attachUI = makeAttacher(resolver, container, hookServiceToTab, options);

    clearAllLayers.register(resolver);
    toggleLayer.register(options);

    makeServices(url, map, attachUI, 1, options);
  }

});
