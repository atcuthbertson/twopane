
define(["modules/layers/baseCheck.js"],function(baseCheck){

  function resolver(services){
    return services[0]; 
  }

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }


  var nameReg = /([^\/]*)\/MapServer/;

  return function(urls, map, hookService, options){

    var container = buildDOM(urls);
    return baseCheck(urls[0], container, resolver, map, hookService, options);
  }


  function buildDOM(urls){
    var form = document.createElement('form'); 
    var container = document.createElement('div');
    var dataType = document.createElement('h4');
    var radioName = Math.random();

    form.className = 'radioForm';
    dataType.textContent = dataType.innerText = "Select Data Type";
    dataType.className = 'divisionHeader';
    form.appendChild(dataType);
     
    for(var i=0; i <urls.length; i++){   
      var serviceName = makeSpaced(urls[i].match(nameReg)[1]);
      var wrap = document.createElement('div');
      var inp = document.createElement('input');
      var label = document.createElement('label');
      var inpId = Math.random();

      inp.id = inpId;
      inp.className = 'radioInput';
      inp.type = 'radio';
      inp.name = radioName;
      if(i===0) inp.checked = "checked";
      label.setAttribute('for',inpId);
      label.textContent = label.innerText = serviceName;
      
      wrap.appendChild(inp);
      wrap.appendChild(label); 
      form.appendChild(wrap);
    }     
    container.appendChild(form);

    var showLayers = document.createElement('h4');
    showLayers.className = 'divisionHeader';
    showLayers.textContent = showLayers.innerText = 'Show Layers';
    container.appendChild(showLayers);

    return container;
  }
});
