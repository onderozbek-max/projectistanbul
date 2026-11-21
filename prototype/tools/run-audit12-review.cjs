// Existing bounded diagnostics, sequential browsers; original failures remain indexed.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const tag='audit12-integrated7',root='reviews/telemetry/audit12-implementation',media='reviews/media/R1/audit12-implementation/integrated7';
const env={...process.env,ISTANBUL_PREVIEW:'http://127.0.0.1:8843',RESET_BUILD:tag,AUDIT8_BUILD:tag,
 AUDIT8_MANIFEST:'reviews/telemetry/first30-reset/'+tag+'.json',AUDIT9_MANIFEST:'reviews/telemetry/first30-reset/'+tag+'.json',
 ISTANBUL_NATIVE_CANVAS:'1',ISTANBUL_BROWSER_TIMEOUT_MS:'180000',RESET_LEGAL_ROSTER:'1'};
const jobs=[],manifest=JSON.parse(fs.readFileSync(env.AUDIT9_MANIFEST));
function run(id,tool,args=[],extra={}){
 const file=root+'/integrated7-'+id,fd=fs.openSync(file+'.log','wx');
 const command=[tool,...args],start=new Date().toISOString();console.log('START',id,start);
 const result=spawnSync(process.execPath,command,{env:{...env,...extra},stdio:['ignore',fd,fd]});fs.closeSync(fd);
 fs.writeFileSync(file+'.exit',String(result.status)+'\n');jobs.push({id,command,source:manifest.runtime_manifest_sha256,start,end:new Date().toISOString(),exit:result.status});
 fs.writeFileSync(root+'/integrated7-review-jobs.json',JSON.stringify({manifest,jobs},null,2)+'\n');console.log('END',id,result.status);
}
run('before-earned-L1','prototype/tools/walk-audit9.cjs',[],{ISTANBUL_PREVIEW:'http://127.0.0.1:8828',AUDIT9_MANIFEST:'reviews/telemetry/first30-reset/audit11-candidate10.json',AUDIT9_THROUGH:'1',AUDIT9_FRAME_INPUT:'1',AUDIT9_WALK_OUT:media+'-before-earned-L1'});
run('roles','prototype/tools/capture-first30-natural-roles.cjs',['roles'],{AUDIT9_OUT:media+'-roles'});
run('cooperation','prototype/tools/capture-audit12-cooperation.cjs');
run('bosses','prototype/tools/capture-audit8.cjs',['bosses'],{AUDIT9_OUT:media+'-bosses',AUDIT9_PHASES:'1',AUDIT9_BOSS_MS:'18000',RESET_BOSS_HIDE_HUD:'1',RESET_BOSS_NO_PROP_ACTIONS:'1',AUDIT9_BOSS_CLEAN:'1'});
run('advanced','prototype/tools/run-first30-advanced.cjs',[tag]);
run('scenes','prototype/tools/check-audit9-scenes.cjs',[],{AUDIT9_SCENE_OUT:media+'-scenes'});
run('interface','prototype/tools/check-first30-reset-ui.cjs',[],{AUDIT9_UI_TAG:tag});
run('comics','prototype/tools/inspect-first30-comics.cjs');
run('interactions','prototype/tools/check-first30-interactions.cjs',[],{RESET_CHECK_OUT:media+'-interactions'});
run('transactions','prototype/tools/check-first30-transactions.cjs',[],{RESET_CHECK_OUT:media+'-transactions'});
run('reward-ownership','prototype/tools/check-first30-reward-ownership.cjs',[],{RESET_CHECK_OUT:media+'-reward-ownership'});
run('touch-art','prototype/tools/check-first30-touch-art.cjs',[],{RESET_CHECK_OUT:media+'-touch-art',RESET_EXTENDED_ART:'1'});
run('canvas-transition','prototype/tools/check-first30-canvas-transition.cjs',[tag,env.ISTANBUL_PREVIEW,env.AUDIT9_MANIFEST]);
run('health','prototype/tools/capture-first30-feedback.cjs',['health'],{AUDIT9_OUT:media+'-health',RESET_HIDE_HUD:'1',AUDIT8_ACCESSIBLE:'1'});
process.exitCode=jobs.some(r=>r.exit!==0)?1:0;
