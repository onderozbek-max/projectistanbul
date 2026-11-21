// The signal uses the free arm; the punch keeps the ticket tool's separate raised/committed poses.
P.TicketActing=(function(){
  var T={};
  T.signal=function(c,im,frame,k,e){
    var a=e.ai;if(a.act!=='stationSignal'||a.m!=='windup'&&a.m!=='switchRecover')return false;
    var x=262,y=186,w=67,h=174,px=276,py=193,anchor=frame[2]*frame[4];
    var p=a.m==='windup'?Math.min(1,(e.windup||0)*2):Math.min(1,a.t/.25);
    var angle=-1.35*p;
    c.save();c.scale(k,k);c.translate(-anchor,-frame[3]);
    c.save();c.beginPath();c.rect(-100,-100,frame[2]+200,frame[3]+200);c.rect(x,y,w,h);c.clip('evenodd');
    c.drawImage(im,frame[0],frame[1],frame[2],frame[3],0,0,frame[2],frame[3]);c.restore();
    c.translate(px,py);c.rotate(angle);
    c.drawImage(im,frame[0]+x,frame[1]+y,w,h,x-px,y-py,w,h);c.restore();return true;
  };
  return T;
})();
