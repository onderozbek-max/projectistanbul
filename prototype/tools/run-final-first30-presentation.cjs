// Exact final snapshot; retained earlier jobs are integration history, never relabelled as this build.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'run-first30-presentation-checks.cjs'),'utf8').replaceAll('candidate7','candidate9').replaceAll('8811','8814');
const m=new Module(path.join(__dirname,'final-first30-presentation-runtime.cjs'),module);m.filename=path.join(__dirname,'final-first30-presentation-runtime.cjs');m.paths=module.paths;m._compile(source,m.filename);
