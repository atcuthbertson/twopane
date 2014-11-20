define(["modules/layers/baseCheck.js","modules/resolveLayers.js"],function(baseCheck, ResolveLayers){

  function resolvingFn(services){
    return services[0]; 
  }

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  var nameReg = /([^\/]*)\/MapServer/;

  return function(url, map, hookService, options){
    
    var serviceName = makeSpaced(url.match(nameReg)[1]);
    var container = document.createElement('div');
    var title = document.createElement('h3');

    title.textContent = title.innerText = serviceName;
    container.appendChild(title);

    var resolver = ResolveLayers(resolvingFn);

    return baseCheck(url, container, resolver, map, hookService, options);
  }

});
