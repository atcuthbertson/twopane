define([
  "dojo/on",
  "dojo/_base/array",

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


  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    if(layer){
      toggleLayer.toggle(layer);
      if(!layer.suspended)spinner(this,layer);
    }
  }

  function makeParamResolver(paramObj){
     
    return function(serviceGroup){
      for(var i=0; i<serviceGroup.params.length; i++){
        if(serviceGroup.params[i] === paramObj.param){
          return serviceGroup.services[i];
        }
      }
    }
  }


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
        var serviceProps = {
          node : container,
          description : serviceObj.evt.layer.description,
          tabName : options.tabName
        }

        hookServiceToTab(serviceProps);
      }
    }
  }




  function buildDOM(urls, options){
    var form = document.createElement('form');
    var container = document.createElement('div');
    var radioName = Math.random();

    form.className = 'radioForm';
    makeHeader(container, options.radioTitle||"Select Data Type:");
     
     
    array.forEach(urls, function(url, i){
      var serviceName = utils.space(utils.getServiceName(url));
      var serviceUnderscored = utils.underscore(serviceName);

      var wrap = document.createElement('div');
      var inp = document.createElement('input');
      var label = document.createElement('label');
      var inpId = Math.random();

      inp.id = inpId;
      inp.className = 'radioInput';
      inp.type = 'radio';
      inp.name = radioName;
      label.setAttribute('for',inpId);
      label.textContent = label.innerText = serviceName;

      if(i===0){
        inp.checked = "checked";
        options.selectedRadio.name = serviceUnderscored;
        options.firstRadioNode = inp;
      }

      
      wrap.appendChild(inp);
      wrap.appendChild(label);
      form.appendChild(wrap);

      on(inp, "change", options.toggleEffects.broadcast);

    });

    container.appendChild(form);
       

    return container;
  }
  
  function makeLegendUpdater(resolver){
    return function updateLegends(e){
      var toggleName = utils.underscore(utils.getRadioLabel(e));
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
        options.selectedRadio.name = utils.underscore(utils.getRadioLabel(e));
      });
    } 

    clearAllLayers.register(resolver);
     
    makeHeader(container, options.checkTitle||'Show Layers');

    array.forEach(urls, function(url,i){
      makeServices(url, map, attachUI, +(i===0), options);
    });

  }

});
