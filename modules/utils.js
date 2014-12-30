define([],function(){
  var nameReg = /([^\/]*)\/MapServer/;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }

  function getServiceName(url){
    return url.match(nameReg)[1])
  }

  return {
    space:makeSpaced,
    underscore:makeUnderscored
  }
});
