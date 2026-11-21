// Reuse the existing effect/attribution regression fixture and export its actual hit outcomes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.join(__dirname,'test-gamer-route.js');let source=fs.readFileSync(file,'utf8');
const anchor="  const used = s.evolutionUse[item];";if(source.split(anchor).length!==2)throw Error('Effect fixture anchor changed');
const records=[];global.experienceEffectRecord=row=>records.push(row);
source=source.replace(anchor,anchor+`\n global.experienceEffectRecord({item,recipe,condition:'Supplied rank-five prerequisite; nine stationary high-HP targets, seven seconds; real weapon/zone simulation',
  targets:[...new Set(s.events.filter(e=>e.type==='hit'&&e.weaponVariant===item).map(e=>e.id))],use:used,
  signatureEvents:[...new Set(s.events.filter(e=>e.variant===item||e.weaponVariant===item).map(e=>e.type))]});`);
const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(__dirname);mod._compile(source,file);
fs.writeFileSync('reviews/telemetry/experiential/evolution-fixtures.json',JSON.stringify(records,null,2)+'\n');
console.log('Recorded',records.length,'real evolved-effect fixtures');delete global.experienceEffectRecord;
