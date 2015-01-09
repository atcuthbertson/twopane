define([
  'dojo/_base/array',
  'dojo/on',
  'dojo/dom-class'
],

function(
  array,
  on,
  domClass
){

  var opacities = [];

  function checkAll(checkObjs, resolver, firstPass){

    array.forEach(checkObjs,function(checkObj){
      var check = checkObj.check;
      var service = resolver.resolve(check);
      if(!service){
        return disableCheck(check);
      }
      if(check.disabled) enableCheck(check);
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

  function disableCheck(check){
    domClass.add(check.parentNode, 'disabledCheck');
    check.disabled = 1;
  }

  function enableCheck(check){
    domClass.remove(check.parentNode, 'disabledCheck');
    check.disabled = 0;
  }

  function toggleAll(resolver, fn){
    var checkObjs = resolver.getRegistered();
    checkAll(checkObjs,resolver,1);
    fn();
    checkAll(checkObjs,resolver,0);
  }

  return toggleAll;
});
