"""Wait for actual final rendered campaigns, then run isolated boundary/performance checks."""
from pathlib import Path
import os, subprocess, time, json
R=Path(__file__).resolve().parents[2]
D=R/'reviews/telemetry/first30-reset'
def wait(name):
 p=D/(name+'.exit')
 while not p.exists(): time.sleep(10)
 code=p.read_text().strip()
 if code!='0': raise RuntimeError(name+' failed; keep its original log and repair before final verification')
def run(name,tool,env):
 with (D/(name+'.log')).open('w') as f:
  q=subprocess.run(['node',str(R/'prototype/tools'/tool)],cwd=R,env={**os.environ,**env},stdout=f,stderr=subprocess.STDOUT)
 (D/(name+'.exit')).write_text(str(q.returncode)+'\n')
 if q.returncode: raise RuntimeError(name+' failed; see retained original log')
try:
 wait('candidate17-journey')
 wait('candidate17-firstclear9-supplement')
 for name in ['candidate17-full-suite','candidate17-interface-retry','candidate17-comics-retry','candidate17-legacy-tails-retry']:wait(name)
 boundary='candidate17-earned-boundary';attempt=0
 while (D/(boundary+'.exit')).exists():
  attempt+=1;boundary='candidate17-earned-boundary-retry'+('' if attempt==1 else str(attempt))
 run(boundary,'check-first30-earned-boundary.cjs',{'RESET_BUILD':'candidate17','RESET_BOUNDARY_OUT':'reviews/media/R1/first30-reset/'+boundary})
 for tag,url,manifest in [('baseline-quiet17','http://127.0.0.1:8801','baseline'),('candidate17-quiet','http://127.0.0.1:8828','candidate17')]:
  run(tag+'-benchmark','capture-experience-benchmark.cjs',{'ISTANBUL_PREVIEW':url,'AUDIT8_MANIFEST':str(D/(manifest+'.json')),'AUDIT8_BENCH':str(D/(tag+'-benchmark.json'))})
 (D/'candidate17-finish.exit').write_text('0\n')
 print('Final earned boundary and both quiet desktop benchmarks passed',flush=True)
except Exception as e:
 (D/'candidate17-finish.exit').write_text('1\n')
 print(str(e),flush=True)
 raise
