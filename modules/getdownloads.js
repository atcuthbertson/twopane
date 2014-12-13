define([
  "dojo/dom-class",
  "modules/downloadMultiple.js"],
function(
  domClass,
  downloadMultiple
){

  return function(path, node, dlSite/*, guaranteedDownloads*/){
    var downloads = {};
    var dlCount = 0;
    var excluded = {};
    var excludedCount = 0;
    var dlFiles = [];
    var neutralText = dlSite ? "Visit Website" : "Select a Layer";
    
    node.parentNode.style.display = "block"; 
    if(dlSite){
      node.textContent = node.innerText = neutralText;
      node.href = dlSite;
    }

    function getFullPath(name){
      return path + "/" + name + ".zip";
    }


    function download(){      
      downloadMultiple(dlFiles);
      setTimeout(function(){node.href = dlSite;},0)
      dlFiles.length = 0;
    }


    function add(name){
      if(excluded[name]){
        excludedCount++;
        if(dlCount === 0){
          domClass.add(node,"noDownloadAvailable")
          node.textContent = node.innerText = "Unavailable";
        }
        return;
      }

      downloads[name] = 1;
      if(dlCount === 0){
        domClass.add(node,"downloadable")
        node.textContent = node.innerText = "Download";
      }
      dlCount++;
    }


    function remove(name){
      if(excluded[name]){
        excludedCount--;
        if(dlCount === 0 && excludedCount === 0){
          domClass.remove(node,"noDownloadAvailable")
          node.textContent = node.innerText = neutralText; 
        }
        return;
      }
      
      downloads[name] = 0;
      dlCount--;
      if(dlCount === 0){
        domClass.remove(node,"downloadable");
        if(excludedCount === 0){
          domClass.remove(node,"noDownloadAvailable")
          node.textContent = node.innerText = neutralText;
        }else{
          domClass.add(node,"noDownloadAvailable")
          node.textContent = node.innerText = "Unavailable";
        }
      }
    }


    function exclude(exclusions){
      for(var i=0; i<exclusions.length;i++){
        excluded[exclusions[i]] = 1;
      }
    }


    function prepareDownloads(){
      for(var name in downloads){
        if(downloads.hasOwnProperty(name) && downloads[name]){
          dlFiles.push(getFullPath(name))
        }
      }

      if(dlFiles.length) node.removeAttribute('href');
    }


    return {
      download:download,
      add:add,
      remove:remove,
      exclude:exclude,
     prepareDownloads:prepareDownloads   
    }
  }
})
