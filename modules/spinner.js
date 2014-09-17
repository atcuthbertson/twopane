    //could/should likely be a module that each of the layers add
    function addLoading(check){
      var img = DOC.createElement('img')
      img.className = "loadingImg";
      img.src = "../images/loading.gif";
      check.parentNode.insertBefore(img,check)
    }

    function removeLoading(check){
      var p = check.parentNode;
      var prev = check.previousSibling
      if(prev&&prev.tagName === 'IMG')
        p.removeChild(prev)
    }

    function toggleLoading(check){
      if(check.checked) removeLoading(check);
    }

    function layerUpdateEnd(e){
      var layer = e.target;
      if(layer){
        toggleLoading(getCheckFromLayer(layer))
      }
    }

    function getCheckFromLayer(layer){
      var arr = layer.url.split('_');
      var type = arr[arr.length-1].split('/')[0];
      switch(type){
        case "Points":
          return measurementCheck;
        case "Contours":
          return contoursCheck;
        case "Ramp":
          return rampCheck;
      }
    }