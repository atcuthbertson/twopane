// Legend toggle module
// Creates a toggle button for hiding or showing legend pane
// Arguements:  map, container
//	map is the map the legend will be associated with
// 	container is the dom node in which the legend is.  This the is DOM node that will be hidden or shown by toggle.
//
// Module expects a 'legendButton.png' image in the image folder
//
// Last modified:  Aaron Cuthbertson, 3/19/2015



define(["dojo/on", "dijit/Tooltip"],function(on, Tooltip){
  return function(map, container){

    //BasemapToggle();
	var legendContainer = document.getElementById(container);
    var DOC = document;
	
	function reverseDisplay(d) {
		console.log("ReverseDisplay " + d);
		if(document.getElementById(d).style.display == "none") 
			{ document.getElementById(d).style.display = "block"; }
		else 
			{ document.getElementById(d).style.display = "none"; }
	}
	
	

	var legendNode = DOC.createElement('div');
	var legendPic = DOC.createElement('img');
	legendPic.src = "images/legendButton.png";
    var labelWrapper = DOC.createElement('div');
    var legendLabel = DOC.createElement('span');

    legendNode.id = "legendButton";
	legendNode.Title = "Legend";
	var tooltip = new Tooltip({ 
		connectId: [legendNode], 
		label: "toggle legend"
		});
    labelWrapper.appendChild(legendLabel)
    legendNode.appendChild(legendPic);
    legendNode.appendChild(labelWrapper);

    map.container.appendChild(legendNode);
	on (legendNode, "mousedown", function(){
		console.log("reverse display here" + legendContainer.style.show);
		if (legendContainer.style.display ==="none" || !legendContainer.style.display){
			legendContainer.style.display = "block";
		} else {
			console.log("turn off legend");
			legendContainer.style.display = "none";
		}
		
	});

  }
});
