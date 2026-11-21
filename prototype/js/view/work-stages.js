// Current illustrated loads, landings and stalls, uniformly scaled on the existing world anchors.
P.WorkStages = (function(){
 var S={}, frames={load:[14,95,239,104],bridge:[283,64,204,151],stairs:[537,25,193,200],
   stall:[25,261,209,235],gangway:[273,307,217,170],ramp:[528,307,222,168]};
 var weather=[[37,53,438,176],[688,44,155,187],[35,365,442,86],[552,301,432,177]];
 S.weather=function(c,i,x,base,u,width,height){
  if(!P.StreetArt.current())return false;
  var im=P.StreetArt.image('weather-controls-reset'),f=weather[i];if(!im)return true;
  var h=height===undefined?width*f[3]/f[2]:height;
  c.drawImage(im,f[0],f[1],f[2],f[3],x-width*u/2,base-h*u,width*u,h*u);return true;
 };
 S.draw=function(c,kind,x,base,u,width){
  if(!P.StreetArt.current())return false;
  var im=P.StreetArt.image('work-stages-audit8'),f=frames[kind];if(!im||!f)return true;
  var k=width*u/f[2];c.drawImage(im,f[0],f[1],f[2],f[3],x-width*u/2,base-f[3]*k,width*u,f[3]*k);
  return true;
 };
 S.landing=function(c,kind,x,y,u,width,progress){
  if(!P.StreetArt.current())return false;
  // A descending landing keeps its illustrated proportions; its resting lip meets the real gap edge.
  return S.draw(c,kind,x,y+(.18-1.55*(1-progress))*u,u,width);
 };
 S.helper=function(c,pose,x,y,u,face){
  if(!P.StreetArt.current())return false;
  var im=P.StreetArt.image('helper-roles-audit8');if(!im)return true;
  var cw=im.naturalWidth/3,ch=im.naturalHeight/2,k=P.CFG.view.spriteScale.hero*1.04*u/(ch*.94);
  c.save();c.translate(x,y);c.scale(face||1,1);
  c.drawImage(im,pose%3*cw,Math.floor(pose/3)*ch,cw,ch,-cw*.5*k,-ch*.98*k,cw*k,ch*k);c.restore();return true;
 };
 return S;
})();
