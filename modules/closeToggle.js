define([
  "dojo/query",
  "dojo/dom",
  "dojo/dom-class",
  "require"
],

function(
  query,
  dom,
  domClass,
  require 
){
  
  //Detect whether an old version of Internet Explorer is being used
  var oldIE =(document.all&&!W.atob)?true:false;

  if(oldIE) fx = require("dojo/_base/fx", function(fx){return fx});
   
  var showing = 0;
  var arro = dom.byId("arro");
  var movers = query(".mov");

  function arrowRight(){
    arro.style.marginLeft = "0px";
    arro.textContent = "\u25B6";
  }

  function arrowLeft(){
    arro.style.marginLeft = "-23px";
    arro.textContent = "\u25C0";
  }



  function showPane(){
    var i = 0, j = movers.length;
    showing = 1;

    setTimeout(arrowRight,100)

      if(oldIE){
        for(;i<j;i++){
          if(movers[i] === rightPane)
            fx.animateProperty({node:movers[i], duration:300, properties:{marginRight:0}}).play();
          else fx.animateProperty({node:movers[i], duration:300, properties:{marginRight:285}}).play();
        }
      }else{
        for(;i<j;i++)
          domClass.add(movers[i],"movd");
      }
  }



  function hidePane(){
    var i = 0, j = movers.length;
    showing = 0;

    setTimeout(arrowLeft,100)

      if(oldIE){
        for(;i<j;i++){
          if(movers[i] === rightPane)
            fx.animateProperty({node:movers[i], duration:250, properties:{marginRight:-285}}).play();
          else fx.animateProperty({node:movers[i], duration:250, properties:{marginRight:0}}).play();
        }
      }else{
        for(;i<j;i++)
          domClass.remove(movers[i],"movd");
      }
  }



  return function(){
    if(showing) hidePane();
    else showPane();
  }
});
