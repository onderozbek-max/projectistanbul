# Drop folder for generated or commissioned art

Put files here, then tell me the batch name. Do not rename them after the pattern in `../BRIEF.md` section 2:
`<category>_<subject>_<variant>_<state>.png`, for example `enm_walker_a_walk1.png`, `gnd_istiklal_a.png`, `wpn_knife_t3.png`.

| Folder | Contents |
|---|---|
| `00-style/` | The style-lock frames: `F1.png`, `F2.png`, `F3_run1.png` to `F3_run3.png`, one set per tool you tried (add the tool name as a folder, for example `00-style/midjourney/`). |
| `01-slice/` | Batch 1: hero, 6 enemies, Istiklal and Galata ground and props, 5 weapons. |
| `02-...` onward | Created when a later batch is ordered. |

Raw files are git-ignored. For each file also add one row to `art/PROVENANCE.csv`: asset, tool, model or version, prompt id, date, licence notes, human edits.
