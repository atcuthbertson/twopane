define([
  "dojo/on",
  "dojo/_base/array",

  "modules/layers/makeServices.js",
  "modules/buildParams.js",
  "modules/resolveLayers.js",
  "modules/broadcaster.js",
  "modules/clearAllLayers.js",
  "modules/toggleLayer.js",
  "modules/makeCheck.js",
  "modules/spinner.js"
],

function(
  on,
  array,

  makeServices,
  buildParams,
  ResolveLayers,
  broadcaster,
  clearAllLayers,
  toggleLayer,
  makeCheck,
  spinner
){

  var nameReg = /([^\/]*)\/MapServer/;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }



  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    toggleLayer.toggle(layer);
    if(!layer.suspended)spinner(this,layer);
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


  function makeAttacher(resolver, container, hookService, paramManager, options){

    function boundResolver(){
      return checkResolver.call(this,resolver)
    }


    var checks = [];

    return function (services, serviceObj){
      console.log("attachUI",arguments);
      if(paramManager){
        services = paramManager.addLayers(services, options.keyLayers, options);
      }

      var underscoredService = makeUnderscored(services[0].serviceName)
      if(underscoredService === options.selectedRadio.name){
        on.emit(options.firstRadioNode,"change",{bubbles:true,cancelable:true});
      }

      for(var i=0; i<services.length; i++){
        var service = services[i];
        var spacedName = makeSpaced(service.layerName);
        var check;

        if(checks[i]){
          check = checks[i];
        }else{
         check = makeCheck(container, spacedName, resolver.resolve);
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

        hookService(serviceProps);
      }
    }
  }



  function makeAllCheckToggler(){
    var opacities = [];
    return function(checkObjs, resolver){
      array.forEach(checkObjs,function(checkObj){
        var check = checkObj.check;
        if(check.checked){
          var service = resolver.resolve(check);
          if(opacities.length){
            service.setOpacity(opacities.shift());
          }else{
            opacities.push(service.opacity);
          }
          on.emit(check,"change",{bubbles:true,cancelable:true});
        }
      });
    }
  }



  function buildDOM(urls, resolver, options){
    var form = document.createElement('form');
    var container = document.createElement('div');
    var dataType = document.createElement('h4');
    var radioName = Math.random();
    var changeAll = makeAllCheckToggler();

    form.className = 'radioForm';
    dataType.textContent = dataType.innerText = options.radioTitle|| "Select Data Type:";
    dataType.className = 'divisionHeader';
    form.appendChild(dataType);

    options.toggleEffects.subscribe(toggleChecks);
    
    function toggleChecks(e){
      var checkObjs = resolver.getRegistered();
      changeAll(checkObjs, resolver);
      options.selectedRadio.name = makeUnderscored(e.target.nextSibling.innerHTML);
      changeAll(checkObjs, resolver);
    }
     
    array.forEach(urls, function(url, i){
      var serviceName = makeSpaced(url.match(nameReg)[1]);
      var serviceUnderscored = makeUnderscored(serviceName);

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
        console.log("setting selected radio",serviceUnderscored);
        options.selectedRadio.name = serviceUnderscored;
        options.firstRadioNode = inp;
      }

      
      wrap.appendChild(inp);
      wrap.appendChild(label);
      form.appendChild(wrap);

      on(inp, "change", options.toggleEffects.broadcast);

    });

    container.appendChild(form);

    var showLayers = document.createElement('h4');
    showLayers.className = 'divisionHeader';
    showLayers.textContent = showLayers.innerText = options.checkTitle||'Show Layers';
    container.appendChild(showLayers);

    return container;
  }





  return function(urls, map, hookService, options){

    function resolvingFn(services){
      var name = options.selectedRadio.name;
      console.log(name);
      for(var i=0; i<services.length; i++){
        if(name === services[i].serviceName){
          console.log("Radio resolver. Resolving ",services,"..got", services[i])
          return services[i];
        }
      }
    }
    if(!options.toggleEffects) options.toggleEffects = broadcaster();
    if(!options.paramEffects) options.paramEffects = broadcaster();
    if(!options.selectedRadio) options.selectedRadio = {name:""};
    var resolver = ResolveLayers(resolvingFn);
    var container = buildDOM(urls, resolver, options);
    var paramManager = buildParams(container, resolver, makeParamResolver, options);
    var attachUI = makeAttacher(resolver, container, hookService, paramManager, options);

    options.toggleEffects.subscribe(paramManager.setParams)
    clearAllLayers.register(resolver);
    toggleLayer.register(options);

    array.forEach(urls, function(url,i){
      makeServices(url, map, attachUI, +(i===0), options);
    });

  }

});
