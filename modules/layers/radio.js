
define(["modules/layers/baseCheck.js"],function(baseCheck){

  function resolver(services){
    return services[0]; 
  }

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }


  var nameReg = /([^\/]*)\/MapServer/;

  return function(urls, map, hookService, options){
    
    var form = document.createElement('form'); 
    var container = document.createElement('div');

    form.className = 'radioForm';

    for(var i=0; i <urls.length; i++){   
      var serviceName = makeSpaced(urls[i].match(nameReg)[1]);
      var inp = document.createElement('input');
      var label = document.createElement('label');
      var inpId = Math.random();

      inp.id = inpId;
      inp.type = 'radio';
      label.setAttribute('for',inpId);
      label.textContent = label.innerText = serviceName;
      
      form.appendChild(inp);
      form.appendChild(label); 
    }     
    container.appendChild(form);

    return baseCheck(urls[0], container, resolver, map, hookService, options);
  }

});
