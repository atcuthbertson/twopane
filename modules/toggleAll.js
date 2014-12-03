define([
  'dojo/_base/array',
  'dojo/on'
],

function(
  array,
  on
){

  var opacities = [];

  function checkAll(checkObjs, resolver, firstPass){
    array.forEach(checkObjs,function(checkObj){
      var check = checkObj.check;
      var service = resolver.resolve(check);
      if(!service)return;
      if(firstPass){
        opacities.push(service.opacity);
      }else{
        service.setOpacity(opacities.shift());
      }

      if(check.checked){
        on.emit(check,"change",{bubbles:true,cancelable:true});
      }
    });
  }

  function toggleAll(resolver, fn){
    var checkObjs = resolver.getRegistered();
    checkAll(checkObjs,resolver,1);
    fn();
    checkAll(checkObjs,resolver,0);
  }

  return toggleAll;
});