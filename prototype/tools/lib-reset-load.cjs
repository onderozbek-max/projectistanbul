// Run exactly the declared immutable runtime while retaining existing diagnostic code.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(process.env.ISTANBUL_SIM_ROOT||path.join(__dirname,'..'));
function indexScripts(){return[...fs.readFileSync(path.join(ROOT,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);}
module.exports={ROOT,indexScripts};
