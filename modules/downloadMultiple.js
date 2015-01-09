define(['dojo/_base/array'],function(array){

  var DOC = document;

  /* Iframe hack to download multiple files at once without server-side code */
  /* This will throw a 404 if the file doesn't exist */
  function makeDownload(url){
    var ifr = DOC.createElement('iframe');
    ifr.style.display="none";
    var first = 1;

    ifr.onload=function(){
      if(!first) return;
      first = 0;
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


  return function(paths){
    array.forEach(paths,makeDownload)
  }

});