define(["modules/layers/baseCheck.js"],function(baseCheck){

  function resolver(services){
    return services[0]; 
  }

  return function(url, map, hookService, options){
    var container = document.createElement('div');
    var title = document.createElement('h3');
    title.innerText = serviceName;
    container.appendChild(title);

    return baseCheck(url, container, resolver, map, hookService, options);
  }

});
