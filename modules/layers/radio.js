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

    var selected = {name:""};
    var container = buildDOM(urls, selected);
    var resolver = ResolveLayers(resolvingFn);

    function resolvingFn(services){
      for(var i=0; i<services.length; i++){
        if(selected.name === services[i].service){
          return services[i];
        }
      }
    }



    return baseCheck(urls, container, resolver, map, hookService, options);
  }
//TODO likely need to wrap the input on change and provide it in a closure to baseCheck, where it can then
//operate on checks/services. Need this interface to be sensible, already the above call shows signs of bloat
// This of clearing up how the resolver functions or allowing it to be triggered reflexively

// ultimately, clicking on a new radio (OR ADJUSTING A PARAMETER) 
//needs to resolve every active check, turn off all these layers
// then replace them with the new active layers.


  function buildDOM(urls,selected){
    var form = document.createElement('form');
    var container = document.createElement('div');
    var dataType = document.createElement('h4');
    var radioName = Math.random();

    form.className = 'radioForm';
    dataType.textContent = dataType.innerText = "Select Data Type";
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
        selected.name = serviceUnderscored;
      });

    });     
    container.appendChild(form);

    var showLayers = document.createElement('h4');
    showLayers.className = 'divisionHeader';
    showLayers.textContent = showLayers.innerText = 'Show Layers';
    container.appendChild(showLayers);

    return container;
  }
});