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

  //The resolvingFn differentiates between services that share the same check (every type of layer has a resolvingFn).
  //For this simple layer, the each check will resolve to exactly one service, so we just return the first entry in our service list
  function resolvingFn(services){
    return services[0]; 
  }




  //Resolve a check to a given layer (passing in the proper resolver). The 'this' value is expected to be a check
  //Each check is registered with the resolver (below in makeAttacher) so that it can later be resolved
  //This also toggles the layer's visibility once it is resolved
  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    if(layer){
      toggleLayer.toggle(layer);
      if(!layer.suspended)spinner(this,layer);
    }
  }





  //Save a function in this closure and return a function that will be used
  //to make all the checks, register each check with a resolver, apply listeners to the checks, and contect with the tab manager
  function makeAttacher(resolver, container, hookServiceToTab, options){

    //Call the check resolver this whatever 'this' value the boundResolver is handed 
    function boundResolver(){
      return checkResolver.call(this,resolver)
    }

    //return the attachUI function
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

    makeServices(url, map, attachUI, 1, options);
  }

});
