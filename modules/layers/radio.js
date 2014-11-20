define([
  "modules/layers/baseCheck.js",
  "modules/resolveLayers.js",
  "dojo/on"],
function(
  baseCheck,
  ResolveLayers,
  on
){


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

  var nameReg = /([^\/]*)\/MapServer/;



  return function(urls, map, hookService, options){

    var resolver = ResolveLayers(resolvingFn);
    var selected = {name:""};
    var container = buildDOM(urls, resolver, selected, options);


    function resolvingFn(services){
      for(var i=0; i<services.length; i++){
        if(selected.name === services[i].service){
          return services[i];
        }
      }
    }


    return baseCheck(urls, container, resolver, map, hookService, options);
  }



  function changeAll(checkObjs){
    forEach(checkObjs,function(checkObj){
      var check = checkObj.check;
      if(check.checked){
        on.emit(check,"change",{bubbles:true,cancelable:true});
      }
    });
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

      on(inp, "change", function(){
        var checkObjs = resolver.getRegistered();
        changeAll(checkObjs);
        selected.name = serviceUnderscored;
        changeAll(checkObjs);
      });

    });     
    container.appendChild(form);

    var showLayers = document.createElement('h4');
    showLayers.className = 'divisionHeader';
    showLayers.textContent = showLayers.innerText = options.checkTitle||'Show Layers';
    container.appendChild(showLayers);

    return container;
  }
});