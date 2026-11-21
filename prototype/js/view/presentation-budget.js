// Cosmetic wording has one shared budget. Harmful geometry and source/body tells never enter this filter.
P.PresentationBudget=(function(){
  var B={},lastText={},lastAt=-1e9,slows=[],slowAt=-1e9;
  B.letter=function(active,x,y,text){
    var now=performance.now()/1000;
    if(now-(lastText[text]||-1e9)<2.5||now-lastAt<.65||active.length>=2)return false;
    if(active.some(function(p){return Math.hypot(p.x-x,p.y-y)<2.3;}))return false;
    lastText[text]=now;lastAt=now;return true;
  };
  B.slow=function(T,k){
    var now=performance.now()/1000;if(now-slowAt<.65||P.Settings&&P.Settings.reduceMotion)return null;
    slows=slows.filter(function(q){return now-q.at<1;});k=Math.max(.45,k);
    var loss=slows.reduce(function(sum,q){return sum+q.loss;},0),granted=Math.min(T,Math.max(0,.18-loss)/(1-k));
    if(granted<.045)return null;slowAt=now;slows.push({at:now,loss:granted*(1-k)});return{t:granted,T:granted,k:k};
  };
  B.reset=function(){lastText={};lastAt=slowAt=-1e9;slows=[];};
  return B;
})();
