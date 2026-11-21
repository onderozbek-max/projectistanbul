// Factual last-action state is copied before owned hazards are cancelled. No view/quality dependency.
P.BossDeathState={capture:function(e){
  var a=e.ai||{},copy={m:a.m,act:a.act,t:a.t,W:a.W,combo:a.combo,dist:a.dist,exposeT:a.exposeT,
    dir:{x:a.dir&&a.dir.x||0,y:a.dir&&a.dir.y||0},cookContact:a.cookContact?{age:a.cookContact.age,move:a.cookContact.move}:null,
    cookToss:a.cookToss?{x:a.cookToss.x,y:a.cookToss.y,released:!!a.cookToss.released}:null};
  function tool(q){if(!q)return null;var out={};Object.keys(q).forEach(function(k){if(typeof q[k]==='number'||typeof q[k]==='string'||typeof q[k]==='boolean')out[k]=q[k];});return out;}
  return{ai:copy,age:e.age,walk:e.walk,windup:e.windup||0,exposed:!!e.exposed,facing:e.dvx||e.vx||copy.dir.x,
    captainTow:tool(e.captainTow),dockRope:tool(e.dockRope),cartOpening:!!e.cartOpening,
    bridgeCast:e.bridgeCast?{left:e.bridgeCast.left,caught:e.bridgeCast.caught,lines:e.bridgeCast.lines.map(tool)}:null,
    bridgeNet:tool(e.bridgeNet),x:e.x,y:e.y};
}};
