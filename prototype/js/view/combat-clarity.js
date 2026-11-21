// Friendly spectacle yields to feet and imminent danger. Collision and enemy rendering are untouched.
P.CombatClarity=(function(){
  var V={},C={feet:.43,warningPad:.09,limit:8,opacity:.62};
  function hole(R,draw){
    var c=R.ctx;c.beginPath();c.rect(-R.W*4,-R.H*4,R.W*8,R.H*8);draw(c);c.clip('evenodd');
  }
  V.begin=function(R,s){
    var c=R.ctx;c.save();
    var dense=Object.keys(s.hero.weapons).length>=4||s.enemies.filter(function(e){return !e.dead&&Math.hypot(e.x-s.hero.x,e.y-s.hero.y)<5;}).length>=12;
    if(!dense)return;
    c.globalAlpha*=s.hero.hp/s.hero.maxHp<=.25?.38:.52;
    hole(R,function(c){var x=R.X(s.hero.x),y=R.Y(s.hero.y)-.70*R.ppm;
      c.moveTo(x+.49*R.ppm,y);c.ellipse(x,y,.49*R.ppm,1.04*R.ppm,0,0,Math.PI*2);});
    s.enemies.filter(function(e){return e.type==='bloater'&&!e.dead&&e.swell>0&&!e.boss;}).slice(0,C.limit).forEach(function(e){
      var B=P.CFG.enemies.bloater,r=(e.mini?B.mini.burstR:B.burstR)+C.warningPad;
      hole(R,function(c){c.moveTo(R.X(e.x)+r*R.ppm,R.Y(e.y));c.arc(R.X(e.x),R.Y(e.y),r*R.ppm,0,Math.PI*2);});
    });
    s.enemies.filter(function(e){return e.boss&&!e.dead;}).forEach(function(e){hole(R,function(c){var x=R.X(e.x),y=R.Y(e.y)-1.1*R.ppm;c.moveTo(x+1.0*R.ppm,y);c.ellipse(x,y,1.0*R.ppm,1.55*R.ppm,0,0,Math.PI*2);});});
    s.enemyTele.forEach(function(t){
      if(t.kind==='ring')hole(R,function(c){c.moveTo(R.X(t.x)+(t.r+C.warningPad)*R.ppm,R.Y(t.y));c.arc(R.X(t.x),R.Y(t.y),(t.r+C.warningPad)*R.ppm,0,Math.PI*2);});
      else if(t.kind==='lane')hole(R,function(c){
        var w=t.w/2+C.warningPad,points=[[-w,0],[w,0],[w,t.len],[-w,t.len]];
        points.forEach(function(p,i){var x=R.X(t.x+t.dy*p[0]+t.dx*p[1]),y=R.Y(t.y-t.dx*p[0]+t.dy*p[1]);if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.closePath();
      });
    });
  };
  V.end=function(R){R.ctx.restore();};
  return V;
})();
