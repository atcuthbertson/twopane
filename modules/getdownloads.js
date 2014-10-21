define(["modules/downloadMultiple.js"],function(downloadMultiple){
  return function(path/*, guaranteedDownloads*/){
    var downloads = {};



    function getDownloads(id){
      var service = servicesById[id];
      var zips = ["downloads/_readme.txt"];
      for(var i =1, len = service.visibleLayers.length;i<len;i++){
        zips.push(makeDownload(service.layerInfos[service.visibleLayers[i]].name))
      }
      return zips
    }

    function getFullPath(name){
      return "path/" + name + ".zip";
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
    }

    function remove(name){
      downloads[name] = 0;
    }

    return {
      download:download,
      add:add,
      remove:remove
    }
  }
})