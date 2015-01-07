define(["modules/info.js"],function(info){

  var downloader;

  function registerDownloader(dl){
    downloader = dl; 
  }

  function toggle(service){
    if(service.suspended){
      service.resume();
      info.activate(service);
      if(downloader) downloader.add(service.fullName);
    }else{
      service.suspend();
      info.deactivate(service);
      if(downloader) downloader.remove(service.fullName);
    }
  }

  return {
    toggle:toggle,
    registerDownloader:registerDownloader
  }

});
