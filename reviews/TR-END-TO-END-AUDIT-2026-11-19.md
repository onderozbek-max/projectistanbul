# Turkish narrative, comics and reading audio — end-to-end audit

## Verdict and scope

The strongest material is the ordinary human need beneath the outbreak: getting home, answering a parent, accepting a stranger's help, and waiting with someone who has lost a person. That is the game's narrative advantage to build on. The current first-30 story is more coherent after this pass, but the full outlined saga is **not ready for an “exceptional / zero logical flaws” sign-off**. Specific later-story contradictions and missing payoffs remain below. Tests cannot establish laughter, attachment or retention.

Reviewed the complete authored Turkish store: **1,202 variants across 583 shared beats**, including **869 bark/item-flavour variants**, plus all Chapter 1 comic/call ordering, the current ending and the Chapters 2–3 plan. Checked speaker knowledge, motive, geography within the authored route, event timing, repeated motifs, emotional continuity, comedy, player agency, art and reading sound. Later authored text was read as a draft, not treated as a verified playable campaign.

Implemented **158 Turkish text revisions** (16 story + 142 bark/flavour), one joke-metadata correction, three new ImageGen assets, comic staging and reading cadence corrections. Two English wedding lines were independently adjusted to match the shared new artwork. Other English voice text is unchanged. Production edits stay in shared content and L1–30. No new blocking page, branch, simulation/balance value, dependency, Godot work or post-L30 production was added. Existing Audit9 and D-119 work is preserved. Proposed D-121 records the changes for owner review.

## The story now, as a player follows it

| Sequence | Motive and information | Reason to care about what comes next |
|---|---|---|
| Restaurant → İstiklal | An ordinary dinner is interrupted. Arda reacts to a threatening person, escapes with Usta's knife and tries to contact his mother. Transport has failed. | A specific family and an ordinary promise, rather than an unexplained hero mission. The initial danger keeps narrative priority over ambient jokes. |
| L5 | Mom says the family has left. Arda must collect his **scooter and Dad's marked map** at home; the map photo will not send. Sarıyer is the onward destination. | The long homeward journey has a practical purpose. Returning to an empty flat is an emotional prospect, not a false surprise. |
| Galata → Karaköy | Wedding music and light suggest survivors. Inside, music continues but the people are gone and meals are unfinished. | Hope leads to an unsettling absence. Arda hopes people escaped instead of stopping to joke about stealing cake. |
| Paşa → bridge | The cat is introduced, seen and addressed. A stranger with a fish threatens Arda; Arda answers the bite question immediately. Names and plans follow survival. | Companionship is earned. Kaan needs help finding Nuri before he can accompany Arda. |
| Eminönü | Kaan calls to the figure on the boat. No answer. The Captain's defeat leads to Kaan's first-day memory and Arda's offer to wait. | The encounter changes a relationship. Nuri was a person before he was a boss. Keep the absence of a punchline. |
| Sirkeci → L30 | The two help their way through the station. Mom establishes that Dad returned from the highway before Arda asks what he saw. | A concrete question about Dad joins the practical home mission. The route is still clear even though the larger answer is not. |

The strongest existing exchange stays intact:

> Kaan: “İlk gün balığı bile kesemedim. Kaptan önlüğü verdi. ‘Yarın yine gel,’ dedi.”
>
> Arda: “İstersen biraz oturalım, Kaan. Beklerim.”
>
> Kaan: “Yok abi. Burada kalamam. Seninle geleceğim.”

Do not bury this under more exposition. It gives the player a reason to value Kaan that a companion tutorial cannot provide.

## Logic and voice corrections

The earlier map-only detour was too thin: Mom could describe a broad route by phone. The existing scooter canon now supplies a material reason to reach home. L15 keeps the family's location stable. L30 no longer makes Arda forget that a route map was already discussed. The Galata musician does not receive an unexplained name in Arda's narration. Kaan's trust develops after his threat; the Captain receives an actual unanswered call.

Gameplay lines were checked against triggers. Acquiring an upgrade does not prove it hit anything. A barricade blocks the route; it is not friendly cover. A stampede is fleeing civilians. A simit tray is not a bag. Reconnecting a signal does not mean Mom answered. Foam can discharge without extinguishing a fire. Warnings no longer claim a hit, stun, opened road or safe escape that may not have happened. Several practical statements were then revised again to keep Arda's voice instead of sounding like interface instructions.

Elite and attack warnings now require an unambiguous living source of the appropriate kind at the event location, within the existing 7 m encounter radius. The queued/live line stays bound to that actor and is discarded if it dies, becomes dormant, leaves range or is removed/replaced. The shared lob event no longer gives a tea-throwing enemy an acid-spit description. This is proximity/source validation, not a new line-of-sight simulation or a guarantee that every camera/occlusion case has been observed.

The Turkish direction is **Leyla ile Mecnun / Gibi**, as requested this turn: ordinary reasoning that becomes absurd under pressure, social awkwardness and distinct reactions. No copied lines, characters or staged imitation. Examples from the revised store:

- “Boncuğa da güvendim. Çevrem iyice genişledi.”
- “Sapan da var. Çocukluğum benden daha hazırlıklıymış.”
- “Yeri dövüyor. Yer bir şey yapmadı abi.”
- “Taktım. Artan vida yoksa başarılı sayıyorum.”

These belong to specific objects or actions. They are not a substitute for danger, grief or a necessary answer. The existing joke cooldown and quiet-scene protection remain. Changed lines lose their former `ok: 1` approval; new drafts are not automatically owner-approved.

Detailed review tables, including the current English and placement:

- [Story edits and causal readthrough](TR-STORY-EDITOR-2026-11-19.md).
- [Bark audit and full before/after inventory](TR-BARK-EDITOR-2026-11-19.md).
- [Bark TR / current EN / trigger comparison](TR-BARK-CHANGES-2026-11-19.md).

## Comic artwork and direction

Inspected the actual source atlases. The earlier backgrounds looked like undisturbed tourist scenes, and Arda/Mom's neutral, sad or determined direction could silently select smiling portraits. A worried expression could become a scream. Paşa was introduced in dialogue but absent from the comic art. The active İstiklal illustration contained flags prohibited by the current art rules.

Implemented three versioned project assets with the built-in ImageGen tool:

| Asset | Change and use |
|---|---|
| `cast-listening-v1.webp` | Restrained Arda and Mom expressions for neutral/listening, sad, worried and determined direction. Explicit happy/shout expressions remain distinct. Mom's source facing is accounted for in mirroring. Kaan's authored grief/steady portraits are preserved. |
| `scenes-a-story-v2.webp` | Removes flags and adds small evidence of interrupted life. The wedding café has abandoned place settings and a partly cut cake; the fish stall is shuttered. The retired atlas is no longer loaded by ordinary comic/opening presentation. |
| `pasa-street-v1.webp` | Orange tabby cut-in in the existing Karaköy introduction and L15 departure. The illustration has a reserved art area; no bust covers the cat. |

The L10 closing panel stays in the street where Arda sees light, instead of placing him inside the café early. L15 begins at the wedding café, then follows Paşa, then reaches the bridge. It no longer starts at the Eminönü quay before that journey. L30's distance caption loses a dramatic zoom that had no reveal to support it.

[Exact generation prompts and source outputs](../art/commission/generated/2026-11-19-tr-narrative/PROMPTS.txt). Source PNGs and runtime WebPs are retained in the project; no remote-only dependency or new service. These assets are source-inspected and wired, **not a phone/rendered-page artistic sign-off**. Remaining art limitations include the bridge comic's fish/action visibility and several generic establishing scenes; these are documented in the [art/audio audit](TR-COMIC-ART-AUDIO-2026-11-19.md).

## Reading audio

There is no newer imported comic-page or dialogue recording hidden in the current audio bank. Page turn, panel reveal and speech textures remain synthesized. D-119 already separated actual page turns from panel reveals and silenced thoughts/narration/quiet scenes.

The residual issue was density: character-driven speech could request a new 100 ms syllable roughly every 55–60 ms. The controller now accents word beginnings **at least 150 ms apart**, with **160 ms clause / 280 ms sentence** breathing room. Bracketed static directions are silent. Finishing text by tapping does not play a backlog of skipped cues. Text speed, sound recipes and mix are unchanged. This addresses repetition and overlap without claiming an unheard replacement is better.

Actual listening on a phone speaker and headphones remains required. Neither sample analysis nor successful scheduling tests certify that the timbre is pleasant for a long reading session.

## Later-story blockers and additional creative findings

These are identified, not silently declared resolved. They concern locked/unimplemented content and do not authorize expansion beyond the first 30 levels.

| Priority | Finding | Required writing decision before production |
|---|---|---|
| High | The finale promises home equipment in the bible but currently stages the letter/Mila and says three people will walk. | Show collecting the map, toolkit and scooter, its charge/condition and the next means of travel. The new early motive requires an actual visible payoff. |
| High | Dad repeatedly forbids highways; Chapter 2 explicitly puts the group on D-100. | Establish an unavoidable crossing or a conscious exception with a reason and consequence before they enter it. |
| High | Dad warns against the radio's forest refuge, then Letter #2 says the family followed a radio claim to İzmir. | Clarify why that information is more credible or why necessity outweighs his distrust. Otherwise his caution changes to serve the plot. |
| High | L30 raises Dad's knowledge; much of L31–100 repeats local hazards and the same bulletin. | Each later act needs a change in knowledge, relationship or responsibility. Do not extend suspense simply by withholding an answer that a working phone could supply. |
| High | Ahmet Abi is personally established and then fought; arrival quickly moves to the letter and Mila. | Give his loss an unhurried, specific aftermath. The empty bread basket can carry it; avoid explaining the feeling at length. |
| Medium | Several later route detours read as a sightseeing sequence despite family urgency. | Connect each to a visible blockage, resource, person or deliberate choice; audit the complete route once those levels exist. |
| Medium | L67 bark pool still describes a tea garden; L77 still describes conveyors/bales in a pier stage. Other later lines assert counts or completed actions on entry. | Rewrite against finished local scenes/triggers. Exact keys and related sunrise/movement mismatches are in the bark report. |
| Medium | The outline chooses Kaan's romantic interest automatically from the player's highest bond. | Give Kaan an independently seeded attraction; give Mila/Ada desires and choices of their own. A rivalry should grow from people, not appear to punish investment in a meter. |
| Medium | Ada and Dad's eventual connection risks requiring an implausibly long silence. | Track precisely when Ada hears Dad's name/sees his image and why she can or cannot identify him. Seed a credible motive for withholding, rather than relying only on mystery. |
| Medium | The same triple zoom is prescribed repeatedly, including for simple information. | Use a variety of endings: a choice, an image, a changed relationship, a reveal or silence. Reserve heightened visual punctuation for a real turn. |

The corrected Mila exchange remains sound: she asks about the family, Arda says Sarıyer, and only then does she propose traveling together. It does not need another rewrite.

## Verification and acceptance limits

The six-group focused run passes: `scene-art`, `dialogue`, `barks-delivery`, `comic-reading`, `fonts`, `quality` — zero failures. The audio editor's `ui-motion` check also passes (536 checks). Final follow-ups recheck the changed portrait/art-band assertions and enemy-source delivery. `git diff --check` passes for the touched tracked paths. Dialogue coverage is 583 beats, TR 1,202 / EN 1,205 variants, with matching language-independent simulation digest `12d2b67db8`. The [verification record and selected-source hashes](telemetry/tr-end-to-end-2026-11-19/verification.json) describe this audit's scope, not an immutable complete build or a full-suite result.

Checks cover dialogue completeness/length/joke metadata, language-independent simulation, delivery context, comic controller behavior, portrait identity/crops, current asset loading and font coverage. Art-band layout uses stub text metrics; actual bundled-font rendering at default/150% sizes remains a browser/phone check. These tests do not prove every possible live scene combination or audience response. One editor's wrapper included the nonexistent target `story`; its missing-file error was a command-name mistake. The actual requested tests passed; the root six-group run contains no such target.

Browser preview could not be completed in this session: the in-app browser was unavailable, the local server was denied socket binding by the sandbox, and browser policy rejected the local `file:` URL. No alternate automation path was used to bypass that rejection. Source illustrations were inspected directly; current renderer selection and geometry have regression coverage. Rendered default/150% text/reduced-motion pages, phone presentation and critical listening remain open. No new full-suite, full manual campaign, mobile, artistic or retention acceptance claim is made.

For the next human reading check, ask a reader to explain after L5 why Arda is still going home, after L20 why Kaan is coming, and after L30 what changed about Dad. Ask which page they wanted next and which joke sounded like something the character would actually say. Confusion on any of those questions is more actionable than a general “liked it” score.
