// The thief's inland pigeon diagnostic is not the natural first30 gull.
// Match the actual earliest thief district; keep other bounded role observers unchanged.
'use strict';const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
let code=fs.readFileSync(path.join(__dirname,'capture-first30-feedback.cjs'),'utf8');
const anchor="replace(\"async function health(b){\",`async function health(b){`);";
if(!code.includes(anchor))throw Error('Feedback wrapper changed');
code=code.replace(anchor,anchor+"\nreplace('await start(b);await quiet(b);\\n  await b.evaluate(`(()=>{const s=P.debug.sim;window.auditActor=', 'await start(b,role===\\\"marti\\\"?22:3);await quiet(b);\\n  await b.evaluate(`(()=>{const s=P.debug.sim;window.auditActor=');");
const m=new Module(path.join(__dirname,'reset-natural-roles-runtime.cjs'),module);m.filename=path.join(__dirname,'reset-natural-roles-runtime.cjs');m.paths=module.paths;m._compile(code,m.filename);
