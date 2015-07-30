define([
  "dojo/on",
  "dojo/_base/array",
  "dojo/request",

  "modules/layers/makeServices.js",
  "modules/buildParams.js",
  "modules/resolveLayers.js",
  "modules/broadcaster.js",
  "modules/clearAllLayers.js",
  "modules/toggleAll.js",
  "modules/toggleLayer.js",
  "modules/makeCheck.js",
  "modules/makeHeader.js",
  "modules/spinner.js",
  "modules/utils.js"

],

function(
  on,
  array,
  request,

  makeServices,
  buildParams,
  ResolveLayers,
  broadcaster,
  clearAllLayers,
  toggleAll,
  toggleLayer,
  makeCheck,
  makeHeader,
  spinner,
  utils
){

	// function checkResolver
  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    if(layer){
      toggleLayer.toggle(layer);
      if(!layer.suspended)spinner(this,layer);
    }
  }
  
	// makeParamResolver ----------------------------------------------
  function makeParamResolver(paramObj){
     
    return function(serviceGroup){
      for(var i=0; i<serviceGroup.params.length; i++){
        if(serviceGroup.params[i] === paramObj.param){
          return serviceGroup.services[i];
        }
      }
    }
  }

	// make attacher-----------------------------------------------------------
  function makeAttacher(resolver, container, hookServiceToTab, paramManager, options){

    function boundResolver(){
      return checkResolver.call(this,resolver)
    }


    var checks = [];

    return function (services, serviceObj){
      if(paramManager){
        services = paramManager.addLayers(services, options.keyLayers, options);
      }

      var underscoredService = utils.underscore(services[0].serviceName)
      if(underscoredService === options.selectedRadio.name){
        on.emit(options.firstRadioNode,"change",{bubbles:true,cancelable:true});
      }

      for(var i=0; i<services.length; i++){
        var service = services[i];
        var check;

        if(checks[i]){
          check = checks[i];
        }else{
         check = makeCheck(container, service, resolver.resolve, options);
         on(check,"change",boundResolver);
         checks[i] = check;
        }

        resolver.register(check, service);
      }

      if(serviceObj.needsUI){
			if (options.descriptionFile) {
				console.log("looking for options.descriptionFile");
				//get text file of description into variable
				request.get(options.descriptionFile).then (
					function(text){
						console.log("The file's contents are: " + text);
						options.description = serviceProps.description = text;
				
					}, 
					function(error){
						console.log("An error occurred: " + error);
						options.description = serviceProps.description= "error!";
				
					}
				);
			} else {
				options.description = serviceObj.evt.layer.description;
			}	
			
			var serviceProps = {
				node : container,
				description : options.description,
				tabName : options.tabName
			}

			hookServiceToTab(serviceProps);
      }
    }
  }

	// function buildDOM ------------------------------------------------------------------ 
	// this function builds the radio buttons, dropdown lists and other elements associated with the radio tab
	function buildDOM(urls, options){
		var form = document.createElement('form');
		var container = document.createElement('div');
		var radioName = Math.random();

		form.className = 'radioForm';
		makeHeader(container, options.radioTitle||"Select Data Type:");
     
		array.forEach(urls, function(url, i){
		
			console.log("before if statement");
			console.debug(options);
		
			var serviceName = utils.space(utils.getServiceName(url));
			var serviceAlias;
			if (options.serviceAlias){
				console.log("in if statement true");
				serviceAlias = options.serviceAlias[i];
			} else {
				serviceAlias = serviceName;
			}
			var serviceUnderscored = utils.underscore(serviceName);

			var wrap = document.createElement('div');
			var inp = document.createElement('input');
			var label = document.createElement('label');
			var inpId = Math.random();

			inp.id = inpId;  // inp.id is random idnumber
			inp.className = 'radioInput';
			inp.type = 'radio';
			inp.name = radioName;  // radioName is random idnumber
			inp.serviceName = serviceUnderscored;
			inp.alias = serviceAlias;  // inp.alias is how radio label will appear
			label.setAttribute('for',inpId);  // assign label to the radio button
			//label.textContent = label.innerText = serviceName;
			//label.textContent = serviceName;
			label.textContent = serviceAlias;
			
			//label.servicePointer = serviceName;

			if(i===0){
				inp.checked = "checked";
				//set options.selectedRadio.name = serviceUnderscored, which is populated from service name
				options.selectedRadio.name = serviceUnderscored;
				options.firstRadioNode = inp;
			}
		
			// put the radio button and input in a wrapper called wrap
			wrap.appendChild(inp);
			wrap.appendChild(label);
			// place the wrap in the form
			form.appendChild(wrap);
			
			// on change to radio button, fire everything subscribed to options.toggleEffects (see code below)
			on(inp, "change", options.toggleEffects.broadcast);
		
		});

    container.appendChild(form);
       

    return container;
  }
  
  function makeLegendUpdater(resolver){
    return function updateLegends(e){
		var toggleName = e.target.serviceName;
      //var toggleName = utils.underscore(utils.getRadioLabel(e));
      var checkObjs = resolver.getRegistered();
      for(var i=0; i<checkObjs.length; i++){
        var services = checkObjs[i].services;
        for(var j=0; j<services.length; j++){
          if(services[j].serviceName === toggleName){
            checkObjs[i].check.updateLegend(services[j]);
            break;
          }
        }
      }
    }
  }


return function(urls, map, hookServiceToTab, options){
	console.log("radio function");
	// this function resolves a service for the selected radio button
   function resolvingFn(services){
		var name = options.selectedRadio.name;
      for(var i=0; i<services.length; i++){
			if(name === services[i].serviceName){
          return services[i];
			}
      }
   }

   if(!options.toggleEffects) options.toggleEffects = broadcaster();
   if(!options.paramEffects) options.paramEffects = broadcaster();
   if(!options.selectedRadio) options.selectedRadio = {name:""};
   var resolver = ResolveLayers(resolvingFn);
   var container = buildDOM(urls, options);
    
   var paramManager = options.paramTitle ? buildParams(container, resolver, makeParamResolver, options) : null;
   var attachUI = makeAttacher(resolver, container, hookServiceToTab, paramManager, options);
    
   options.toggleEffects.subscribe(toggleChecks);
   if (paramManager) options.toggleEffects.subscribe(paramManager.setParams) 
   if(!options.excludeLegends) options.toggleEffects.subscribe(makeLegendUpdater(resolver));

   function toggleChecks(e){
		toggleAll(resolver, function(){
			console.log("toggle checks");
			console.log(e.target.serviceName);
			options.selectedRadio.name = e.target.serviceName;
			//options.selectedRadio.name = utils.underscore(utils.getServiceNameFromRadio(e));
		});
   } 
   // getRadioLabel
   clearAllLayers.register(resolver);
     
   makeHeader(container, options.checkTitle||'Show Layers');

   array.forEach(urls, function(url,i){
		makeServices(url, map, attachUI, +(i===0), options);
   });

}

});
