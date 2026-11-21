// Small deterministic routes for authored people, using the live world's solid geometry.
P.WalkPath = (function () {
  var W = {}, C = P.CFG.experience.people;
  W.valid = function (s, p, r) {
    var q = { x: p.x, y: p.y }; P.World.clampWalk(q, r, s.props);
    return Math.hypot(q.x-p.x, q.y-p.y) < C.epsilon;
  };
  function clear(s, a, b, r) {
    var n = Math.max(1, Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/C.sample));
    for (var i=0;i<=n;i++) if (!W.valid(s,{x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},r)) return false;
    return true;
  }
  W.nearest = function (s, p, r, avoid) {
    for (var ring=0;ring<=C.rings;ring++) for (var i=0;i<(ring?C.angles:1);i++) {
      var t=i*Math.PI*2/C.angles, q={x:p.x+Math.cos(t)*ring*C.grid,y:p.y+Math.sin(t)*ring*C.grid};
      if (avoid && (typeof avoid==='function'?avoid(q):Math.hypot(q.x-avoid.x,q.y-avoid.y)<avoid.r)) continue;
      if (W.valid(s,q,r)) return q;
    }
    return null;
  };
  W.find = function (s, from, to, r) {
    if (!from || !to || !W.valid(s,from,r) || !W.valid(s,to,r)) return null;
    if (clear(s,from,to,r)) return [{x:to.x,y:to.y}];
    var g=C.grid, root={x:from.x,y:from.y,ix:Math.round(from.x/g),iy:Math.round(from.y/g),cost:0},
      open=[root], best={}, count=0;
    best[root.ix+','+root.iy]=0;
    while (open.length && count++<C.searchNodes) {
      open.sort(function(a,b){return a.score-b.score;}); var n=open.shift();
      if (Math.hypot(n.x-to.x,n.y-to.y)<g*C.finishDistance && clear(s,n,to,r)) return unwind(n,to);
      for (var x=-1;x<=1;x++) for (var y=-1;y<=1;y++) {
        if (!x&&!y) continue;
        var q={ix:n.ix+x,iy:n.iy+y,parent:n}, key=q.ix+','+q.iy;
        q.x=q.ix*g;q.y=q.iy*g;q.cost=n.cost+Math.hypot(q.x-n.x,q.y-n.y);
        if (Math.hypot(q.x-from.x,q.y-from.y)>C.searchSpan || best[key]<=q.cost || !clear(s,n,q,r)) continue;
        best[key]=q.cost;q.score=q.cost+Math.hypot(q.x-to.x,q.y-to.y);open.push(q);
      }
    }
    return null;
  };
  function unwind(n,to) {
    var route=[{x:to.x,y:to.y}];
    while (n.parent) {route.unshift({x:n.x,y:n.y});n=n.parent;}
    return route;
  }
  W.length = function (from,path) {
    var total=0, p=from;(path||[]).forEach(function(q){total+=Math.hypot(q.x-p.x,q.y-p.y);p=q;});return total;
  };
  W.move = function (a,path,speed,dt,s,r) {
    var left=speed*dt, moved=0;
    while (path && path.length && left>0) {
      var p=path[0],dx=p.x-a.x,dy=p.y-a.y,d=Math.hypot(dx,dy),n=Math.min(left,d);
      if(s&&d>C.epsilon&&!W.valid(s,{x:a.x+dx/d*n,y:a.y+dy/d*n},r)){path.length=0;break;}
      if (d>C.epsilon) {a.fx=dx/d;a.fy=dy/d;a.x+=dx/d*n;a.y+=dy/d*n;}
      left-=n;moved+=n;if(d<=n+C.epsilon)path.shift();
    }
    a.moving=moved>C.epsilon;a.walk=(a.walk||0)+moved;return moved;
  };
  return W;
})();
