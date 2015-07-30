define([
  "dojo/on",
  "dojo/_base/array",
  "dojo/request",

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
  array,
  request,

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
    return function (serviceLayers, serviceObj){


	  for(var i=0; i<serviceLayers.length; i++){
        var serviceLayer = serviceLayers[i];
        var check = makeCheck(container, serviceLayer, resolver.resolve, options);

        resolver.register(check, serviceLayer);
        on(check,"change",boundResolver);
      }
      var loadedDescription; 
      if(serviceObj.needsUI){
			var serviceProps = {
				node : container,
				//description : serviceObj.evt.layer.description,
				//description: loadedDescription,
				tabName : options.tabName
			};
			//get text file of description into variable
			request.get(options.descriptionFile).then (
				function(text){
					console.log("The file's contents are: " + text);
					serviceProps.description = text;
					
				}, 
				function(error){
					console.log("An error occurred: " + error);
					serviceProps.description= "error!";
					
				});
			
			hookServiceToTab(serviceProps);
      }
    }
  }



  /*
   * The return value of the module. This is what we are calling from twopane.js
   *
   */ 
  return function(urls, map, hookServiceToTab, options){
	  // urls is an array of services
     
    //var serviceName = utils.space(utils.getServiceName(url)); // not applicable to multiple services

    //Create options as an empty object if we didn't pass one.
    //This allows other modules to not have to worry if it exists or not
    if(!options) options = {};
    

   var container = document.createElement('div');
	
   var title = document.createElement('h3');
	
	if (!options.tabName) {  // should always have tab title option, but handle if it isn't passed
		options.tabName = "Untitled Tab";
	}
	title.textContent = title.innerText = options.tabName;
	
    
    container.appendChild(title);
     
    //Create a resolver which associates checks with the appropriate serviceLayer and recalls the right one based on the resolvingFn
    var resolver = ResolveLayers(resolvingFn);

    //Build the UI attacher. We make the attachUI function inside a closure so it has access to additional arguments and functions without
    //cluttering its call signature
    var attachUI = makeAttacher(resolver, container, hookServiceToTab, options);

    //Allow layers registered to our resolver to be cleared by the 'clear all' button
    clearAllLayers.register(resolver);
     
    //Make the actual map services for the ArcGIS Server service at the provided URL
	 array.forEach(urls, function(url,i){
      makeServices(url, map, attachUI, +(i===0), options);
    });

  }

});
