// Illustrated mechanisms and continuous hand-to-mechanism contact; simulation owns completion.
P.WorkControls = (function () {
  var W = {}, slots = { hoist:0, courtyard:0, depot:8, bell:1, wires:2, fuse:3,
    marketAwning:4, ferryMooring:5, fishShutters:6, cargoHook:7, tramPoints:8,
    dockRamp:7, marketGate:6, marketSignal:8, bridgeRods:0, bridgeLift:0,
    bridgeScreens:4, bridgeRescue:5, bridgeWave:5, platform:8, points:8, luggage:7, guide:6, announce:8 };
  W.has = function (kind) { return slots[kind] !== undefined; };
  W.rope = function (kind) { return /bell|Mooring|Lift|Rescue|Rods|courtyard/.test(kind); };
  W.axis = function (R, p) { return { x:R.X(p.x+.45), y:R.Y(p.y+.22)-.5*R.ppm }; };
  W.hand = function (R, s, action) {
    var q=W.axis(R,action.p), u=R.ppm, phase=action.progress*Math.PI*4;
    if (W.rope(action.kind)) return {x:q.x-.12*u,y:q.y+(.10+.18*(1-Math.cos(phase)))*u};
    var lever=/Points|Ramp|Signal|depot|Hook|points|platform/.test(action.kind);
    var a=lever ? -.85+action.progress*1.6 : phase;
    return {x:q.x+Math.cos(a)*.16*u,y:q.y+Math.sin(a)*.12*u};
  };
  W.draw = function (R, p, kind, done) {
    if (!W.has(kind) || !P.StreetArt.current()) return false;
    var im=P.StreetArt.image('world-controls-audit8'); if (!im) return true;
    var i=slots[kind], cw=im.naturalWidth/3, ch=im.naturalHeight/3, q=W.axis(R,p), u=R.ppm;
    var width=kind==='bell'?1.6:1.3, height=width*ch/cw;
    R.ctx.drawImage(im,i%3*cw,Math.floor(i/3)*ch,cw,ch,q.x-width*.5*u,q.y-height*.56*u,width*u,height*u);
    if (done) { R.ctx.fillStyle='#A5E8BD'; R.ctx.beginPath(); R.ctx.arc(q.x+.32*u,q.y-.36*u,.06*u,0,Math.PI*2); R.ctx.fill(); }
    return true;
  };
  W.tool = function (R,s,a,grips) {
    var q=W.axis(R,a.p), c=R.ctx, u=R.ppm;
    var h=grips && (Math.cos(a.aim)<0?grips.left:grips.right); if (!h) return;
    var rope=W.rope(a.kind), tip=W.hand(R,s,a);
    c.save(); c.lineCap='round'; c.lineJoin='round';
    c.beginPath(); c.moveTo(q.x,q.y);
    if (rope) c.quadraticCurveTo(q.x-.08*u,(q.y+h.y)*.5,q.x-.1*u,h.y);
    else c.lineTo(tip.x,tip.y);
    c.lineTo(h.x,h.y); c.strokeStyle='#242B31'; c.lineWidth=.095*u; c.stroke();
    c.strokeStyle=rope?'#F0D9A9':'#DBB96D'; c.lineWidth=.044*u; c.stroke();
    c.restore();
  };
  return W;
})();
