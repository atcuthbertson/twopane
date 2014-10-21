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

    function getDownloads(id){
      var service = servicesById[id];
      var zips = ["downloads/_readme.txt"];
      for(var i =1, len = service.visibleLayers.length;i<len;i++){
        zips.push(makeDownload(service.layerInfos[service.visibleLayers[i]].name))
      }
      return zips
    }

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
      downloads[name] = 1;
      if(dlCount === 0){
        domClass.add(node,"downloadable")
        node.textContent = "Download";
      }
      dlCount++;
    }

    function remove(name){
      downloads[name] = 0;
      dlCount--;
      if(dlCount === 0){
        domClass.remove(node,"downloadable");
        node.textContent = "Select a Layer";
      }
    }

    return {
      download:download,
      add:add,
      remove:remove
    }
  }
})