// Authored walkable pockets around existing work; no extra required objective or fictional elevation.
(function(C){
  C.dramaSpace={clearance:1.0,seek:[0,-2,2,-4,4],bellSide:2.65,dominoDamage:95,domino:{x:1.2,ahead:4,w:2.1,h:1.3},
    // [kind,x,y relative to work point,width,depth]. Existing illustrated props own art and collision.
    levels:{
      2:[['crates',-3.6,-7,1.3,1.0],['crates',3.6,-4,1.3,1.0]],
      3:[['crates',-2.6,-5,2.4,1.1],['bin',2.8,-2,0.8,0.8]],
      4:[],5:[['crates',-3.5,3,1.2,1.1],['crates',3.5,6,1.2,1.1]],
      6:[['crates',-1.6,-7,3.0,1.1],['crates',1.6,-3.5,3.0,1.1]],
      7:[['crates',-3.6,-3,1.2,1],['crates',-3.6,3,1.2,1]],
      8:[['crates',0,3.4,2.2,1.4]],
      9:[['crates',1.6,-5,2.1,1.1]],
      10:[['crates',-3.4,3,1.2,1.2],['crates',3.4,6,1.2,1.2]],
      11:[['crates',2.4,-4,2.0,2.2],['crates',-2.8,4,1.1,1.2]],
      12:[['bin',-3.2,-3,.8,.8],['bin',3.2,2,.8,.8]],
      13:[],14:[['crates',2.6,-4,1.4,1.1]],
      15:[],16:[],17:[['crates',2.3,-4,1.6,1.1]],
      18:[],19:[],20:[['crates',0,4,1.7,1.5]],
      21:[['crates',-2.8,-3,1.2,1.2]],22:[],
      23:[],24:[['crates',-3.2,-3,1.2,1.1]],
      25:[['bin',-3.2,4,.8,.8],['bin',3.2,7,.8,.8]],
      26:[],27:[],28:[['crates',2.4,-4,1.4,1.0]],
      29:[['crates',0,-4,1.6,1.2]],30:[['crates',-3.5,3,1.1,1.2],['crates',3.5,7,1.1,1.2]]
    }};
})(P.CFG);
