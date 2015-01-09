define([
  "esri/graphic",
  "esri/SpatialReference",
  "esri/geometry/Point",
  "esri/geometry/webMercatorUtils",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",

  "dojo/_base/Color",
  "dojo/on",

  "modules/geocode.js"
  ],
function(
  Graphic,
  SpatialReference,
  Point,
  wmUtils,
  MarkerSymbol,
  LineSymbol,

  Color,
  on,

  geocode
){
  return function(map){
    var mapPane = map.container;

    var symbol = new MarkerSymbol(
      MarkerSymbol.STYLE_CIRCLE
      , 10
      , new LineSymbol(LineSymbol.STYLE_SOLID, new Color("#44474d"), 1)
      , new Color("#041222")
      );
    var lastGraphic = null;


    var wrapper = document.createElement('div');
    var geocoder = document.createElement('input');


    wrapper.className = 'geocoderWrapper';
    geocoder.className = 'geocoder';
    geocoder.autofocus = 'autofocus';

    wrapper.appendChild(geocoder);
    mapPane.appendChild(wrapper);

    geocoder.tabIndex = "1";

    on(geocoder,"keyup",function(e){
      if(e.keyCode === 13){
        clearLastGeocode();
        geocode(geocoder.value,parseGeocoder)
      }else if(e.keyCode === 8 && geocoder.value === ''){
        clearLastGeocode();
      }
    });


    function parseGeocoder(data){
      var dataObj = JSON.parse(data);
      var topResult = dataObj.results[0];
      if(topResult){
        var location = topResult.geometry.location;
        var address = topResult.formatted_address;

        reflectLocationChoice(address)
        showLocation(location)
      }
    }


    function reflectLocationChoice(address){
      return geocoder.value = address;
    }


    function showLocation(location){
      var loc = wmUtils.lngLatToXY(location.lng,location.lat);
      var pnt = new Point(loc, new SpatialReference(102100));

      lastGraphic = new Graphic(pnt,symbol)

      map.graphics.add(lastGraphic);
      map.centerAndZoom(pnt,12);
    }


    function clearLastGeocode(){
      if(lastGraphic){
        map.graphics.remove(lastGraphic);
        lastGraphic = null;
      }
    }
  }
})