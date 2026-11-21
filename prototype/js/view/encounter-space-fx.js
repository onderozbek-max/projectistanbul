// A brief source-local cue accompanies the real apparatus diversion; it promises no invulnerability.
P.EncounterSpaceFx=(function(){
  var F={};
  F.ground=function(R,s){
    var q=s.encounterSpace&&s.encounterSpace.release;
    if(!q||!q.targets.length||s.t>=q.until)return;
    var age=s.t-q.at,c=R.ctx,u=R.ppm,p=Math.min(1,age/1.2);
    c.save();c.globalAlpha=.46*(1-p);c.strokeStyle='#AFD0C1';c.lineWidth=1.5;
    for(var i=1;i<=2;i++){c.beginPath();c.ellipse(R.X(q.x),R.Y(q.y),(.22+i*.18+p*.3)*u,(.09+i*.07+p*.1)*u,0,0,Math.PI*2);c.stroke();}
    c.restore();
  };
  return F;
})();
