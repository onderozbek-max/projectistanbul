// Wait for the final9 earned browser to close before reusing that task-owned profile.
'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const d='reviews/telemetry/audit11-implementation',m='reviews/media/R1/audit11-implementation';
(async()=>{
 while(!fs.existsSync(d+'/candidate9-earned-journey.exit'))await new Promise(r=>setTimeout(r,15000));
 const log=fs.openSync(d+'/candidate9-earned-boundary.log','wx');
 const r=spawnSync(process.execPath,['prototype/tools/check-first30-earned-boundary.cjs'],{env:{...process.env,RESET_BUILD:'audit11-candidate9',RESET_EARNED_JOURNEY:m+'/candidate9-earned-journey',RESET_BOUNDARY_OUT:m+'/candidate9-earned-boundary'},stdio:['ignore',log,log]});
 fs.closeSync(log);fs.writeFileSync(d+'/candidate9-earned-boundary.exit',String(r.status)+'\n');console.log('Earned final9 boundary',r.status);
})().catch(e=>{console.error(e);process.exitCode=1});
