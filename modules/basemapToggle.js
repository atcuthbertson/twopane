define(['esri/dijit/BasemapToggle'],function(BasemapToggle){
  return function(map){

    BasemapToggle();

    var DOC = document;
    var t = "topo";
    var s = "satellite";
    var g = "gray";
    var src = "//js.arcgis.com/3.10/js/esri/dijit/images/basemaps/"
    var basemapNode = DOC.createElement('div');
    var basemapPic = DOC.createElement('img');
    var labelWrapper = DOC.createElement('div');
    var basemapLabel = DOC.createElement('span');

    basemapNode.id = "basemapNode";

    labelWrapper.appendChild(basemapLabel)
    basemapNode.appendChild(basemapPic);
    basemapNode.appendChild(labelWrapper);

    map.container.appendChild(basemapNode);
    setBasemap(t,s);

    function setBasemap(bmap,next){
      basemapPic.src = src + next + ".jpg";
      basemapLabel.textContent = basemapLabel.innerText = next.charAt(0).toUpperCase() + next.slice(1);
      if(map.getBasemap()===bmap) return;
      map.setBasemap(bmap);
    }

    return function(){
      var current = map.getBasemap();
      current === t
        ? setBasemap(s,g)
        : current === s
          ? setBasemap(g,t)
          : setBasemap(t,s)
      ;
    }
  }
});
