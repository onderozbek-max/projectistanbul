// Specific authored upper poses load over supporting boots; one anatomical unit scale throughout.
P.BossJoints = (function () {
  var B = {};
  B.point = function (frame, anchor, k, facing, x, y, pose) {
    var hipX=anchor[0], hipY=frame[3]*.67, a=pose.roll || 0;
    var dx=x-hipX, dy=y-hipY;
    return {x:(hipX+dx*Math.cos(a)-dy*Math.sin(a)-anchor[0])*k*facing,
      y:(hipY+dx*Math.sin(a)+dy*Math.cos(a)+(pose.load || 0)*frame[3]*.016-anchor[1])*k};
  };
  B.draw = function (c,img,frame,anchor,k,pose) {
    var w=frame[2],h=frame[3],cut=h*.67,head=h*.28,load=pose.load || 0,roll=pose.roll || 0;
    function part(y,height) { c.drawImage(img,frame[0],frame[1]+y,w,height,-anchor[0]*k,(y-anchor[1])*k,w*k,height*k); }
    // A fixed sole and authored knee stance. Load travels through the hips, not a whole-sprite squash.
    part(cut,h-cut);
    c.save(); c.translate(0,(cut-anchor[1])*k); c.rotate(roll); c.translate(0,-(cut-anchor[1])*k+load*h*.016*k);
    part(head,cut-head+2);
    c.save(); c.translate(0,(head-anchor[1])*k); c.rotate(-roll*.38); c.translate(0,-(head-anchor[1])*k);
    part(0,head+2); c.restore(); c.restore();
  };
  return B;
})();
