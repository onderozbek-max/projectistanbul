// Chapter 1 arrival (L100 win): comic pages and their line data. Voice lines are the FIN* beats in js/dialogue/ (core beats + tr/finale.js, en/finale.js);
// the UI strings are in story/strings-finale.js. Pages: fin_arrive_a (3 panels: the street, the balcony light,
// the call at the door) and fin_arrive_b (2 panels: Dad's letter in the flat, the knock and Mila, the Sarıyer hook).
// Run by finale.js through P.Comic.page. Only FIN* ids are touched. Mom is voice only in this arrival: she is on the phone
// from Sarıyer, so no panel draws her bust (canon: docs/narrative.md, Letter #1 and the empty flat). The old one-page
// 'finale' comic in story-data.js is retired.
(function () {
  // Speakers for the FIN lines (the bust and side). Mila has her own bust (finale-scenes.js), so her lines use 'mila'.
  var SPK = { 'spk.arda': 'arda', 'spk.anne': 'anne', 'spk.baba': 'baba', 'spk.mila': 'mila' };
  var MOOD = { FINa3: 'sad', FINa4: 'scared', FINa5: 'happy', FINb2: 'sad', FINb7: 'shout', FINb8: 'determined' };
  var origFor = P.Story.forLine;
  P.Story.forLine = function (id) {
    if (String(id).indexOf('FIN') !== 0) return origFor(id);
    var B = P.Dialogue.beat(id), who;
    if (!B || B.spk === 'spk.cap') return null;
    who = SPK[B.spk];
    if (!who) return null;
    return { who: who, side: who === 'arda' ? 'l' : 'r', mood: MOOD[id] || 'neutral', important: false };
  };

  // Comic pages. Panel: {bg (scene key), tone (wash), ch: [who, mood, x 0..1, flip, scale], it: items, zoom}.
  // Items: ['c', id] caption · ['t'|'b'|'s', id] thought, speech, shout · ['x', sfx, x, y, rot, colour] · ['l', [ids]] letter · ['p', n] signal bars.
  P.Story.pages['fin_arrive_a'] = { tag: 'cm.tag.arrival', panels: [
    { bg: 'fin_street', tone: 'warm', ch: [], it: [['c', 'FINa1']] },
    { bg: 'fin_balcony', tone: 'night', ch: [['arda', 'sad', 0.3, false, 0.6]], it: [['c', 'FINa2'], ['t', 'FINa3']] },
    { bg: 'fin_phone', tone: 'night', ch: [['arda', 'scared', 0.28, false, 0.6]],
      it: [['p', 4], ['b', 'FINa4'], ['b', 'FINa5']] }
  ] };
  P.Story.pages['fin_arrive_b'] = { tag: 'cm.tag.arrival', panels: [
    { bg: 'fin_flat', tone: 'warm', ch: [],
      it: [['c', 'FINb1'], ['p', 3], ['b', 'FINb2'], ['l', ['FINb3', 'FINb4', 'FINb5']]] },
    { bg: 'fin_door', tone: 'night', zoom: true, ch: [['arda', 'scared', 0.28, false, 0.62], ['mila', 'determined', 0.72, true, 0.62]],
      it: [['c', 'FINb6'], ['x', 'tak', 0.5, 0.9, -6, 'red'], ['s', 'FINb7'], ['b', 'FINb8'], ['c', 'FINb9']] }
  ] };
  P.Finale = P.Finale || {};
  P.Finale.PAGES = ['fin_arrive_a', 'fin_arrive_b'];
})();
