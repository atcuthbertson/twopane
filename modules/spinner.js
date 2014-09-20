define([],function(){

  function removeLoading(check){
    var p = check.parentNode;
    var prev = check.previousSibling
    if(prev&&prev.tagName === 'IMG')
      p.removeChild(prev)
  }

  function toggleLoading(check){
    if(check.checked) removeLoading(check);
  }


  return function (check,service){
      var img = document.createElement('img')
      img.className = "loadingImg";
      img.src = "images/loading.gif";
      check.parentNode.insertBefore(img,check)

      var handle = service.on('update-end',function(){
        removeLoading(check);
        handle.remove();
      });
    }
})