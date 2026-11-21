// Cosmetic connections use factual bodies, released tools and owned warnings; they never create damage.
P.BossPropContinuity=(function(){
  var V={};
  function cable(R,from,to,sag,color){var c=R.ctx;c.save();c.lineCap='round';c.beginPath();c.moveTo(from.x,from.y);
    c.quadraticCurveTo((from.x+to.x)/2,(from.y+to.y)/2+sag*R.ppm,to.x,to.y);
    c.strokeStyle='#242C32';c.lineWidth=.065*R.ppm;c.stroke();c.strokeStyle=color;c.lineWidth=.027*R.ppm;c.stroke();c.restore();}
  V.air=function(R,s){
    var e=s.dir.trialBoss||s.gen&&s.gen.boss;if(!e||e.dead||!P.BossPuppet.ready(e.bossPreset))return;
    var hand=P.BossPuppet.contact(e),a=e.ai;if(!hand)return;
    if(e.bossPreset==='cook'&&a.act==='throw'&&a.m==='pause'&&a.cookToss){
      var p=Math.max(0,Math.min(1,(1-a.t/P.CFG.bosses.cook.throw.recover)/.82));
      if(p<1){var q=a.cookToss,x=R.X(q.x)+(hand.x-R.X(q.x))*p,y=R.Y(q.y)+(hand.y-R.Y(q.y))*p-Math.sin(Math.PI*p)*.48*R.ppm;
        P.CookFx.rememberTool(e.id,e.x+(x-R.X(e.x))/R.ppm,e.y-(y-R.Y(e.y))/R.ppm,(1-p)*Math.PI);
        P.BossPuppet.tool(R.ctx,'cook',x,y,R.ppm,(1-p)*Math.PI);}
    }
    var C=P.CFG.bossPerformance[e.bossPreset];if(!C.control||a.m!=='windup')return;
    var warning=s.enemyTele.find(function(t){return t.owner===e.id;});if(!warning)return;
    var from={x:hand.offX,y:hand.offY},to={x:R.X(warning.x),y:R.Y(warning.y)};
    if(e.bossPreset!=='vatman'&&e.bossPreset!=='ticketMan')cable(R,from,to,.28,e.bossPreset==='linekeeper'?'#77B6CD':'#CAB590');
  };
  V.settle=function(R,e,p){
    var old=e.deathPose,hand=P.BossPuppet.contact(e);if(!old||!hand)return;
    if(e.bossPreset==='cook'&&old.ai.cookToss&&old.ai.cookToss.released){
      var original=P.BossPerformance.pose({bossPreset:e.bossPreset,ai:old.ai,windup:old.windup},{}),tool=P.CookFx.toolPose(e.id);
      if(original.release&&hand.released&&tool){var fall=Math.min(1,p*2),height=Math.max(0,tool.y-old.y);
        P.BossPuppet.tool(R.ctx,'cook',R.X(tool.x+.22*fall),R.Y(tool.y-height*fall*fall),R.ppm,tool.a+(Math.PI/2-tool.a)*fall);}
    }
    if(old.dockRope){var q=old.dockRope,a=q.start+q.span*Math.max(0,q.t)/q.T;
      cable(R,{x:hand.x,y:hand.y},{x:R.X(q.x+Math.cos(a)*q.r),y:R.Y(q.y+Math.sin(a)*q.r)},.2+p*.9,'#DAC6A5');}
    if(old.bridgeCast)old.bridgeCast.lines.forEach(function(q){
      var d=q.dist>=q.len?q.dist*q.reel/P.CFG.bosses.bigFisher.cast.reel:q.dist;
      cable(R,{x:hand.tipX,y:hand.tipY},{x:R.X(q.x+q.dx*d),y:R.Y(q.y+q.dy*d)},.3+p*.8,'#D0BCA0');});
  };
  return V;
})();
