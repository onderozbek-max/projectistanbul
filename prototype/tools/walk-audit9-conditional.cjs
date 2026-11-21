// Declared earned-state continuation, separate from the fresh ordinary-input walkthrough.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),crypto=require('node:crypto');
const data='reviews/telemetry/audit9-implementation/',file=data+'integrated12-earned-cover.jsonl';
const row=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse).find(r=>r.level===23&&r.result==='win');
if(!row||row.saveBefore.flags?.kaanMarketCover)throw Error('Pre23 save must not invent help already earned in23');
const out='reviews/media/R1/audit9-implementation/conditional-earned23';fs.mkdirSync(out,{recursive:true});
const resume=!!process.env.AUDIT9_CONDITIONAL_RESUME;
const origin=file+' L23 seed'+row.seed+' actual pre-first-clear Meta state, earned by the declared cover campaign';
if(!resume)fs.writeFileSync(path.join(out,'import-provenance.json'),JSON.stringify({origin,sourceRuntime:JSON.parse(fs.readFileSync(data+'integrated12.json')).runtime_manifest_sha256,
 importedMetaSha256:crypto.createHash('sha256').update(JSON.stringify(row.saveBefore)).digest('hex'),supplied:true,
 boundary:'Imported actual earned permanent state through22. Not a fresh save, ordinary-main-campaign continuation or uncoached human. No world actor, HP, invulnerability, help flag, offer, reward or result injected. Real inputs/choices settle23–25.'},null,2)+'\n');
process.env.ISTANBUL_PREVIEW='http://127.0.0.1:8801';process.env.AUDIT9_MANIFEST=data+'integrated12.json';
process.env.AUDIT9_WALK_OUT=out;process.env.AUDIT9_FRAME_INPUT='1';process.env.AUDIT9_THROUGH='25';
if(resume){process.env.AUDIT9_RESUME='1';process.env.AUDIT9_PROFILE=JSON.parse(fs.readFileSync(path.join(out,'profile.json'))).dir;}
else delete process.env.AUDIT9_RESUME;
let source=fs.readFileSync(path.join(__dirname,'walk-audit9.cjs'),'utf8');
function replace(a,b){if(!source.includes(a))throw Error('Walk harness changed: '+a);source=source.replace(a,b);}
replace("if(!resume){assert.equal(await b.evaluate('P.Meta.unlockedLevel()'),1);assert.equal(await b.evaluate('Object.keys(P.Meta.state().stars).length'),0);}",
 "if(!resume){await b.evaluate("+JSON.stringify('(()=>{Object.assign(P.Meta.state(),'+JSON.stringify(row.saveBefore)+');P.Meta.Save.write(P.Meta.state());})()')+");assert.equal(await b.evaluate('P.Meta.unlockedLevel()'),23);}");
replace("const first=resume?await b.evaluate('P.Meta.unlockedLevel()'):1;","const first=resume?await b.evaluate('P.Meta.unlockedLevel()'):23;if(!resume){await tap(b,'#btn-start');await b.sleep(700);}");
replace("function focus(level){return ","function focus(level){if(level===24)return 'speargun';return ");
replace("const row={id,level,attempt,sourceManifest:","const row={id,level,attempt,fixture:true,importedEarnedMeta:true,sourceOrigin:"+JSON.stringify(origin)+",sourceManifest:");
replace("No grants, stepping, forced outcomes, save import or revives.","Imported earned permanent Meta through22; no actor/power/outcome injection, stepping or revives.");
replace("noPowerOrSaveSupply:true","noWorldOrOutcomeSupply:true,importedEarnedMeta:true");
source=source.replace("fixture:false,method:'Actual earned map/attribute/perk/gear/skill/archive controls; no grants or imported save.","fixture:true,importedEarnedMeta:true,method:'Actual rendered controls after the declared earned pre23 Meta import; no world/help/outcome injection.");
const old="Agent-supervised rendered journey; automated navigation reads diagnostic world state and sends normal pointer/keyboard events through the ordinary handlers (frame-cadence DOM generation when enabled), with CDP menu gestures. Actual visible card/mod/chest/menu controls, fresh profile, earned persistent state. This is assisted browser verification, not an uncoached human run, physical phone or headless campaign.";
replace(old,"Supplied actual earned pre23 Meta state from the final12 cover campaign. Real rendered23–25 continuation with normal pointer/key/menu handlers and actual offers, help, settlement and native scenes. This is a supplied earned-state conditional replay, NOT a fresh ordinary campaign or human/phone evidence. No help flag, outcome, actor or run power was injected.");
fs.writeFileSync(path.join(out,resume?'executed-harness-resume.cjs':'executed-harness.cjs'),source);
if(resume)fs.writeFileSync(path.join(out,'resume-provenance.json'),JSON.stringify({at:new Date().toISOString(),profile:process.env.AUDIT9_PROFILE,reason:'Keep actual23 help and eight failed24 melee attempts. Resume same saved profile with actual offered ranged choices; no reimport or outcome/power injection.'},null,2));
const mod=new Module(path.join(__dirname,'walk-audit9-conditional-runtime.cjs'),module);mod.filename=path.join(__dirname,'walk-audit9-conditional-runtime.cjs');mod.paths=module.paths;mod._compile(source,mod.filename);
