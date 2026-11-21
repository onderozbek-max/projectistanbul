"""Apply the same verified-success-only frame pruning to Audit11 exports; never remove failed evidence."""
from pathlib import Path
p=Path(__file__).with_name('prune-reset-capture-frames.py')
s=p.read_text().replace("media=root/'reviews/media/R1/first30-reset'", "media=root/'reviews/media/R1/audit11-implementation'")
s=s.replace("root/'reviews/telemetry/first30-reset'/('successful-frame-prune-'", "root/'reviews/telemetry/audit11-implementation'/('successful-frame-prune-'")
exec(compile(s,str(p),'exec'))
