define([],function(){
  var nameReg = /([^\/]*)\/MapServer/;
  var trimStr = /^[_\s]+|[_\s]+$/g; 
  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }

  function getServiceName(url){
    return url.match(nameReg)[1])
  }

  function trim(str){
    return str.replace(trimStr,'')
  }

  return {
    space:makeSpaced,
    underscore:makeUnderscored,
    getServiceName:getServiceName,
    trim:trim
  }
});
