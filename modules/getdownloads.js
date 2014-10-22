define([
  "dojo/dom-class",
  "modules/downloadMultiple.js"],
function(
  domClass,
  downloadMultiple
){
  return function(path, node/*, guaranteedDownloads*/){
    var downloads = {};
    var dlCount = 0;
    var excluded = {};
    var excludedCount = 0;


    function getFullPath(name){
      return path + "/" + name + ".zip";
    }


    function download(){
      var dlFiles = [];
      for(var name in downloads){
        if(downloads.hasOwnProperty(name) && downloads[name]){
          dlFiles.push(getFullPath(name))
        }
      }
      downloadMultiple(dlFiles);
    }


    function add(name){
      if(excluded[name]){
        excludedCount++;
        if(dlCount === 0){
          domClass.add(node,"noDownloadAvailable")
          node.textContent = "Unavailable";
        }
        return;
      }

      downloads[name] = 1;
      if(dlCount === 0){
        domClass.add(node,"downloadable")
        node.textContent = "Download";
      }
      dlCount++;
    }


    function remove(name){
      if(excluded[name]){
        excludedCount--;
        if(dlCount === 0){
          domClass.remove(node,"noDownloadAvailable")
          node.textContent = "Select a Layer";
        }
        return;
      }
      
      downloads[name] = 0;
      dlCount--;
      if(dlCount === 0){
        domClass.remove(node,"downloadable");
        if(excludedCount === 0){
          domClass.remove(node,"noDownloadAvailable")
          node.textContent = "Select a Layer";
        }else{
          domClass.add(node,"noDownloadAvailable")
          node.textContent = "Unavailable";
        }
      }
    }


    function exclude(exclusions){
      for(var i=0; i<exclusions.length;i++){
        excluded[exclusions[i]] = 1;
      }
    }


    return {
      download:download,
      add:add,
      remove:remove,
      exclude:exclude
    }
  }
})