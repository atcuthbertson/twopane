define([
  "dojo/on",

  "modules/layers/makeServices.js",
  "modules/buildParams.js",
  "modules/resolveLayers.js",
  "modules/clearAllLayers.js",
  "modules/toggleLayer.js",
  "modules/makeCheck.js",
  "modules/spinner.js"
],

function(
  on,

  makeServices,
  buildParams,
  ResolveLayers,
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

  function forEach(arr,fn){
    for(var i=0, len=arr.length; i < len; i++){
      fn(arr[i],i);
    }
  }



  function checkResolver(resolver){
    var layer = resolver.resolve(this);
    toggleLayer.toggle(layer);
    if(!layer.suspended)spinner(this,layer);
  }



  function makeAttacher(resolver, container, hookService, options){

    function boundResolver(){
      return checkResolver.call(this,resolver)
    }

    var checks = {};

    return function (services, serviceObj){
      if(options.keyLayers){
        services = buildParams(options.keyLayers,services,resolver,container,options);
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

  function makeChanger(){
    var opacities = [];
    return function(checkObjs, resolver){
      forEach(checkObjs,function(checkObj){
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



  function buildDOM(urls, resolver, selected, options){
    var form = document.createElement('form');
    var container = document.createElement('div');
    var dataType = document.createElement('h4');
    var radioName = Math.random();

    form.className = 'radioForm';
    dataType.textContent = dataType.innerText = options.radioTitle|| "Select Data Type:";
    dataType.className = 'divisionHeader';
    form.appendChild(dataType);
     
    forEach(urls, function(url, i){
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
        selected.name = serviceUnderscored;
      }

      
      wrap.appendChild(inp);
      wrap.appendChild(label); 
      form.appendChild(wrap);

      var changeAll = makeChanger();

      on(inp, "change", function(){
        var checkObjs = resolver.getRegistered();
        changeAll(checkObjs, resolver);
        selected.name = serviceUnderscored;
        changeAll(checkObjs, resolver);
      });

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
      for(var i=0; i<services.length; i++){
        if(selected.name === services[i].serviceName){
          return services[i];
        }
      }
    }

    var resolver = ResolveLayers(resolvingFn);
    var selected = {name:""};
    var container = buildDOM(urls, resolver, selected, options);
    var attachUI = makeAttacher(resolver, container, hookService, options);

    clearAllLayers.register(resolver);
    toggleLayer.register(options);

    forEach(urls, function(url,i){
      makeServices(url, map, attachUI, +(i===0), options);
    });

  }

});