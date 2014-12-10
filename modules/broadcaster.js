define([],function(){

  return function(){

    var subscribed = [];

    function subscribe(fn){
      subscribed.push(fn); 
      return fn;
    }

    function unsubscribe(fn){
      for(var i=0; i< subscribed.length; i++){
        if(subscribed[i] === fn){
          return subscribed.splice(i,1)[0];
        }
      }
    }

    function broadcast(){
      console.log("BROADCASTING")
      for(var i=0; i<subscribed.length; i++){
        console.log(subscribed[i])
        subscribed[i].apply(this,arguments);
      }
    }
    return {
      subscribe:subscribe,
      unsubscribe:unsubscribe,
      broadcast:broadcast
    }
  }
});
