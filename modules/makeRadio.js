  makeRadioServices(
    [
      { name:"Domestic"
      , url:"https://"+server+"/arcgis/rest/services/" + serverFolder + "/DomesticWellDepthSummary/MapServer"
      , checked:1
      },
      {
        name:"Production"
      , url:"https://"+server+"/arcgis/rest/services/" + serverFolder + "/ProductionWellDepthSummary1/MapServer"
      }
    ]
    ,"pane2"
    ,"Well Type"
  );

    function makeRadioServices(services, id, dataType){
    var header = DOC.createElement('h3');
    var radioForm = DOC.createElement('form');
    var radios = [];

    header.className = "paneHeadings"
    header.textContent = (dataType || "Data Type")+":";

    function addDesc(e){serviceDescriptions[id] = e.layer.description}

    function switchRadio(e){
      var radio = e.target;
      for(var i=0;i<radios.length;i++){
        if(radios[i] !== radio){
          wipeLayer(servicesById[radios[i].id])
        }
      }
      updateLayerVisibility(servicesById[radio.id],this.parentNode.parentNode);
    }

    for(var i=0; i<services.length;i++){
      var url = services[i].url;
      var name = services[i].name;
      var checked = services[i].checked;
      var currId = id + name;
      var service = new ArcGISDynamicMapServiceLayer(url, {"imageParameters": imageParameters});

      var radio = DOC.createElement('input');
      var label = DOC.createElement('label')
      radio.type="radio";
      radio.id = currId;
      radio.name = id +"radio";
      radio.className = "serviceRadio";
      if(checked) radio.checked = "checked";
      label.textContent = name;
      label.className = "radioLabel";
      label.setAttribute('for',currId);
      radioForm.appendChild(radio);
      radioForm.appendChild(label);
      radioForm.appendChild(DOC.createElement('br'));

      on(radio, "click", switchRadio)

      radios.push(radio)
      services[i].service = service;
      service.suspend();
      layers.push(service);
      identifyTasks[url] = new IdentifyTask(url);
      servicesById[currId] = service;
      service.on("load",addDesc);
    }

    var pane = dom.byId(id);
    pane.insertBefore(radioForm,pane.firstChild);
    pane.insertBefore(header,pane.firstChild);

    on(query("#"+id+" input[type=checkbox]"), "click", function(){
      for(var i=0; i<radios.length;i++){
        if(radios[i].checked){
          updateLayerVisibility(servicesById[radios[i].id],this.parentNode.parentNode);
          break;
        }
      }
    });

  }

  function wipeLayer(service){
    service.suspend();
    removeVisibleUrl(service.url);
    service.setVisibleLayers([-1]);
  }

