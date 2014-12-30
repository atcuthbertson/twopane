define([],function(){
  var nameReg = /([^\/]*)\/MapServer/;

  function makeSpaced(name){
    return name.replace(/_/g," ")
  }

  function makeUnderscored(name){
    return name.replace(/ /g,"_")
  }

  return {
    space:makeSpaced,
    underscore:makeUnderscored
  }
});
