// Signature defeat beats. [effect, beat sound, ink colors, travel x/y, lean, squash, impact delay].
P.BossDefeatProfiles = (function () {
  var BY = {
    cook: ['split','cleaver','#F29B58','#FFE3AE',-.28,0,1.14,.28,.35],
    roaster: ['ember','hiss','#EF713C','#FFC75F',.20,.5,.92,.40,.44],
    linekeeper: ['grid','zap','#71CAFA','#E5FBFF',.08,.24,.32,.27,.40],
    switchkeeper: ['cross','shutter','#77ACFB','#DCE7FF',-.37,.16,1.13,.34,.49],
    vatman: ['rails','bruteStomp','#D96B64','#FFCA8E',.12,-.12,.48,.63,.52],
    istiklal: ['rails','bruteStomp','#D96B64','#FFCA8E',.12,-.12,.48,.63,.52],
    galata: ['bell','bell','#D3A264','#FBEDAA',.18,.31,.87,.52,.49],
    karakoy: ['ribbons','swish','#E99AB3','#FFE3CB',-.62,.42,1.38,.31,.37],
    bridge: ['tide','ferryHorn','#5EB9D3','#D3F7FD',.76,.18,1.2,.31,.50],
    eminonu: ['crates','rattle','#D88751','#F4D196',.52,.10,.83,.48,.41],
    sirkeci: ['tickets','shutter','#E4B371','#F6F4D3',-.43,.12,.56,.48,.49],
    kapalicarsi: ['curtain','glass','#C281C0','#F8CFA7',-.62,.27,1.27,.41,.45],
    beyazit: ['pages','swish','#9C9BCD','#FFEBC5',.71,.46,1.62,.45,.36],
    kumkapi: ['net','rattle','#698F9C','#D3DAB3',-.35,.22,.53,.58,.50],
    saray: ['tiles','glass','#5DBCB0','#CFF6CF',.28,.58,.71,.37,.38],
    halic: ['vases','glass','#A890C4','#F4D9FC',.42,.33,1.47,.32,.48],
    yenikapi: ['wheels','rattle','#CE944E','#FFF196',-.76,.29,1.36,.41,.36],
    samatya: ['clatter','tink','#C89874','#FCEBDC',.27,.18,.62,.46,.53],
    yedikule: ['rampart','bruteStomp','#AB8C7F','#F9D8AE',.06,-.09,.23,.75,.41],
    kazlicesme: ['wind','swish','#7ECB91','#E0FAD6',-.81,.53,1.72,.35,.36],
    zeytinburnu: ['forge','boom','#B9683F','#FFD080',.12,.71,.63,.42,.52],
    bakirkoy: ['awning','shutter','#9CB4DC','#F4EBFB',-.34,.13,.77,.57,.38],
    bakirkoysahil: ['buoys','ferryHorn','#77A2C2','#FFD371',.66,.33,.92,.39,.47],
    atakoysahil: ['mooring','shock','#71AFA5','#C6E8E2',-.65,.18,1.46,.49,.44],
    atakoy: ['paving','bruteStomp','#A5998A','#D6EBD5',.24,-.10,.67,.68,.51]
  };
  var SPECIAL = { bellkeeper: 'galata', dockBride: 'karakoy', bigFisher: 'bridge', quayCaptain: 'eminonu', ticketMan: 'sirkeci' };
  return function (hood, preset) { return BY[SPECIAL[preset] || preset] || BY[hood] || BY.istiklal; };
})();
