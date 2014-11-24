define(["modules/info.js"],function(info){

  var downloader;

  function register(options){
    downloader = options.downloader; 
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
    register:register
  }

});
