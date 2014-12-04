define([],function(){
  return function(container, text){
    var header = document.createElement('h4');
    header.textContent = header.innerText = text;
    header.className = 'divisionHeader';
    container.appendChild(header);
  }
});
