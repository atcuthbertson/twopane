define([],function(){

  var DOC = document;

  /* Iframe hack to download multiple files at once without server-side code */
  function makeDownload(url){
    var ifr = DOC.createElement('iframe');
    ifr.style.display="none";

    ifr.onload=function(){
      var ifrDoc = ifr.contentWindow||ifr.contentDocument;
      if(ifrDoc.document) ifrDoc = ifrDoc.document;

      var form = ifrDoc.createElement('form');
      form.action = url;
      form.method = "GET";
      ifrDoc.body.appendChild(form);
      form.submit();
      setTimeout(function(){
        DOC.body.removeChild(ifr);
      },2000);
    }
    
    DOC.body.appendChild(ifr);
  }

  function forEach(arr, fn){
    for(var i=0, len = arr.length; i < len; i++){
      fn(arr[i])
    }
  }

  return function(paths){
    forEach(paths,makeDownload)
  }

});