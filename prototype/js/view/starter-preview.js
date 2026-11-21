// Safe Arsenal display: real rank1 weapon simulation and current illustrated actors, no campaign settlement.
P.StarterPreview=(function(){
  var V={},raf=0,serial=0;
  V.stop=function(){serial++;cancelAnimationFrame(raf);};
  V.play=function(canvas,id){
    V.stop();var token=serial,s=P.createSim(120,{levelIndex:1}),c=canvas.getContext('2d'),time=0,last=0,acc=0;
    s.enemies=[];s.hero.x=0;s.hero.y=50;s.hero.weapons={};s.hero.weapons[id]=1;s.events=[];s.props.carts=[];s.props.canisters=[];
    for(var i=0;i<4;i++)P.Combat.spawnEnemy(s,'walker',1.5+i*.7,50+(i%2)*.6,{state:'active'});
    P.FireAnim.reset(s);P.WFx.reset();
    var R={ctx:c,ppm:45,W:320,H:180,dpr:1,noGround:false,simTime:0,X:function(x){return 72+x*45;},Y:function(y){return 140-(y-50)*45;}};
    R.toScreen=function(x,y){return{x:R.X(x),y:R.Y(y)};};
    function frame(now){
      if(token!==serial||!canvas.isConnected)return;
      var dt=last?Math.min(.05,(now-last)/1000):0;last=now;time+=dt;acc+=dt;
      while(acc>=1/60){s.t+=1/60;s.runT+=1/60;P.Weapons.step(s,1/60);acc-=1/60;}
      P.drainEvents(s).forEach(function(ev){P.FireAnim.onEvent(ev,s);P.WFx.onEvent(ev,s);});P.FireAnim.update(dt,s);P.WFx.update(dt,s);R.simTime=s.t;
      c.fillStyle='#303B42';c.fillRect(0,0,320,180);
      s.enemies.forEach(function(e){if(!e.dead)P.Sprites.enemy(R,e,s.hero);});
      var opts={u:45*1.22,face:1,phase:0,still:true,flash:0,noArms:false,motion:{}};P.FireAnim.heroOpts(s,opts);
      P.Sprites.hero(c,R.X(0),R.Y(50),opts);P.FireAnim.drawHeld(R,s,opts.grips);
      P.WFx.drawProjectiles(R,s);P.WFx.drawParts(R);
      var q=s.ws&&s.ws.knifeSwing;
      if(q&&q.active){c.strokeStyle='#F2DFB0';c.lineWidth=2;c.beginPath();c.moveTo(R.X(0),R.Y(50));c.lineTo(R.X(Math.cos(q.angle)*q.range),R.Y(50+Math.sin(q.angle)*q.range));c.stroke();}

      if(time<3.8)raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
  };
  return V;
})();
