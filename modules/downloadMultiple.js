  function makeDownloads(arr){
    if(arr.length>1)
      forEach(arr,makeDownload)
  }

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
