# Forest and FPV presentation QA — 3 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 31 tests and the production build passed. Existing bundle advisory remains: approximately 601kB / 165kB gzip.
- Replaced solid tree/bush silhouettes with instanced branch cards and original alpha-masked atlases. Retained the original tree and thicket gameplay cover volumes. Added original bark, leaf-litter, road wear, geometric grass, cloudy sky and sagging camouflage nets.
- Added an FPV-only render pass capped at 1280×720 (85% viewport resolution below that cap), subtle colour bleed, desaturation, vignette and luminance-scaled grain. HUD/reticle render separately. Recon renders directly; thermal keeps the foliage alpha masks. Reduced motion freezes grain.
- Isolated Chromium at 1280×720: selected Officer hunt, confirmed no initial marks, aimed using arrows/zoom and identified with left click. Normal/thermal and pause/resume worked. Pause froze the timer and patrol. Physically flew an FPV into the officer; one sortie, 4,195 points, automatic unpaused recon return. N opened the next board.
- 800×600: selected convoy/cache cards, started, opened Pause, launched via its button, climbed above 12m, switched thermal, returned to recon and reopened Missions. Pause controls fit.
- Final foliage build: flew from base into the south-west hideout at approximately 2m altitude, toggled normal/thermal, zoomed, enabled reduced motion, resized to 800×600, flew through the soft thicket and climbed out with 100% hull. Launched again and flew into solid base cover: FPV LOST followed by automatic unpaused recon return.
- At 1440×900, verified the fixed recon orbit resisted movement input, found the cache with zoom, confirmed E did not mark and left-click did, inspected normal/thermal, then physically flew into the cache. Awarded 750 points, one destroyed cache, active fire and automatic unpaused recon return. Inspected visual-cache-spotted-normal.png, visual-cache-spotted-thermal.png and visual-cache-burning-recon.png. The old unzoomed camera-steering script missed its aim tolerance; the precise zoomed run passed.
- Final browser console: zero errors and warnings.
- A 90-frame requestAnimationFrame sample while hovering inside the thicket at 1280×720 recorded median 16.7ms and p95 16.8ms on this machine. This is a short local sample, not a device-wide performance guarantee.
- Screenshot review caught grass-card striping from above and excessive grain in dark thermal views. Replaced the grass cards with bent blade geometry and reduced grain in dark pixels. Inspected forest-confirmed.png, forest-fpv.png, forest-low-normal.png, forest-low-thermal.png and forest-low-small.png. Artifacts are ignored under output/playwright/.

## Limits
Original procedural assets remain visibly stylized at close range, particularly infantry and flat terrain. Coarse vegetation cover can block sight across visible leaf gaps. Full convoy completion and mission failure variants were not replayed in this visual pass. Browser flight steering used read-only diagnostic coordinates; no teleporting, health edits or clock acceleration. Other browsers, mobile and low-end hardware remain untested.

---

# Minimal UI QA — 2 November 2026

## Verified
- npm install completed with zero reported vulnerabilities; 31 tests and the production build passed.
- Removed decorative quest/mode numbering, prototype/uplink copy, repeated launch guidance, duplicate objective/result panels and persistent score/sortie/cache counters. Mission cards show a name and time; the selected brief retains essential clues and failure rules. Scores remain in the result.
- Isolated Chromium at 1280×720: selected Officer hunt, started with no marks, aimed with arrows/zoom and left-clicked to identify. The short objective changed to Strike the officer. Normal/thermal toggles and pause/resume worked; pause froze the patrol and timer.
- Physically flew an FPV into the officer. One sortie, 4,195 points, automatic unpaused recon return. The result replaced the mission block and launch control; N opened the next mission board. No teleporting, health edits or clock acceleration.
- Inspected minimal-briefing.png, minimal-recon.png, minimal-fpv.png, minimal-pause.png and minimal-complete.png.
- At 800×600, selected convoy/cache cards and checked their briefings, started the cache mission, opened Pause, launched through its button, climbed above 12m, toggled thermal, returned to recon and used Missions to reopen the board. Pause controls fit within the viewport; inspected minimal-board-small.png, minimal-fpv-small.png and minimal-pause-small.png.
- Final browser console: zero errors/warnings. Artifacts are ignored under output/playwright/.

## Limits
This pass changes presentation, not mission rules or flight behavior. Full officer success was replayed; convoy/cache completion and failure paths were not repeated. Flight steering used read-only diagnostic coordinates, so natural search difficulty remains unmeasured. Touch/mobile play, other browsers and low-end hardware remain untested.

---

# Officer hunt QA — 2 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 31 tests and the production build passed; existing bundle advisory: approximately 601kB / 165kB gzip.
- Rule tests cover identification followed by the correct officer hit, wrong soldiers, caches as optional bonuses, premature strike, timeout, terminal-state protection, legacy person-quest links, variant normalization and patrol containment across all three sectors.
- Isolated Chromium at 1280×720: the legacy q=courier link opened Officer hunt and normalized to q=officer. The board and briefing described red shoulder panels, a dark map case and the identify/strike sequence.
- Started the south-east variant with no marked targets. Verified the officer moved before identification. Used ordinary arrow-camera controls, 8× zoom and left-click to identify him; the HUD advanced to stage 2 and the launch card instructed an FPV strike.
- Inspected officer-briefing.png, officer-confirmed.png and officer-thermal.png. Switched normal/thermal and back. Pause froze both mission time and the officer's position.
- Flew an FPV into the identified moving officer using ordinary movement keys. Completed with one sortie, 4,195 points and zero destroyed caches. The camera returned automatically to unpaused recon; the completion report appeared without a sortie modal. Inspected officer-complete.png.
- Pressing N opened a fresh unstarted officer quest board with the next variant.
- A separate flight struck the officer without identification. The mission failed with “Officer struck before identity was confirmed,” zero points and automatic return to recon. The failure report appeared correctly.
- Screenshot review found that the failure launch panel still said Operation complete. Corrected it to Operation failed, fixed singular drone-count wording and repeated the premature-strike flight to verify both labels.
- Final browser console check reported zero errors/warnings. All QA scripts and screenshots are under ignored output/playwright/.

## Limits
Flight checks used read-only diagnostic coordinates to steer ordinary controls; there were no teleports, health edits or accelerated clocks. They validate the flow, not human search difficulty. The south-east sector received success/failure browser runs; all three patrols have containment tests. Cache and convoy full missions were not replayed in this officer-focused pass; their rule tests passed and earlier browser findings remain below. The officer uses a short fixed patrol and existing arcade defenses. Shoulder clues are small at recon altitude and need zoom; natural discovery difficulty, balance, other browsers and low-end hardware need player testing.

---

# Quest board, cache search and courier trail QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 30 tests passed; production build passed. Existing bundle advisory: approximately 602kB / 166kB gzip.
- New tests cover the correct cache versus bonus caches, no convoy dependency in search quests, courier identity/progression, premature courier/cache loss, timeout, terminal-state protection, variant normalization and reserved walking corridors.
- Chromium at 1280×720: selected different quest cards before launch, checked distinct briefings/timers and no pre-marked targets, then started the selected quest. Inspected quest-board.png and quest-board-final.png; selected-card state and briefing agree after the selection animation settles.
- Hidden arsenal, west variant: physically flew an FPV into the designated cache. Completed at 8.55 simulated seconds with 4,710 points and one sortie; the cache burned, recon returned automatically without a pause/modal, and the completion report offered the quest board.
- Pressing N returned to the board with the next variant. Selected Courier trail without a stale convoy mission or target state.
- Courier trail, south-east variant: used arrow camera controls and zoom to acquire the courier and left-click to confirm him. Tested normal/thermal views, tracked his movement, paused/resumed and verified the quest clock stayed frozen while paused. At the end of the route the search sector shrank, the courier remained alive and the only marked target was the courier; the stash was not automatically tagged.
- Physically flew an FPV into the revealed stash. Courier quest completed at 41.11 simulated seconds with 4,845 points, one sortie and a burning cache. Automatic recon return and the completion report worked.
- Replayed Convoy intercept from the new board: all three kills in 53.89 simulated seconds, three sorties, 4,470 points. All impacts returned automatically to recon and no sortie result modal appeared.
- Screenshot review found stale launch-card guidance after the courier reached his destination. Corrected stage guidance and replayed identification/follow through arrival; the card now instructs the player to search the smaller sector and destroy the cache.
- Pause > Abandon / Quest board returned to a fresh unstarted mission board. Selecting Hidden arsenal updated its pressed state and briefing correctly.
- A separate manual camera/left-click pass on the west cache displayed PRIMARY CACHE CONFIRMED; inspecting it did not complete the quest.
- Final browser console check reported zero errors/warnings. Temporary scripts/screenshots remain under ignored output/playwright/.

## Limits
Browser runs used ordinary inputs with read-only diagnostic coordinates for steering, not teleporting, health edits or accelerated clocks. Their short completion times do not measure human search difficulty. Cache west and courier south-east received full browser runs; other sectors have rule/path tests but were not separately completed in-browser. Failure rules have unit tests rather than a separate browser run for every failure. The courier follows a fixed reserved path after identification and continues if the camera looks away; there is no continuous tracking requirement, advanced navigation, saved quest progression or unlock economy. Clue visibility, natural discovery difficulty, long-session balance, other browsers and low-end hardware need player testing.

---

# Manual convoy spotting QA — 1 November 2026

- npm install completed with zero reported vulnerabilities; 24 tests and the production build passed. Existing bundle advisory: approximately 593kB / 163kB gzip.
- Isolated Chromium at 1280×720: waited for all three convoy vehicles to enter. All were active, the marked-target list was empty and the world marker container had zero tags. Inspected convoy-unmarked.png; no vehicle diamonds were on the minimap.
- Used keyboard camera controls and zoom to acquire the tank. Looking at it alone did not mark it. Left-click then marked only target 2. Captured convoy-manually-marked.png.
- Toggled thermal twice, launched an FPV, climbed above 6m and switched back to recon. Only target 2 remained tagged; the two transports stayed unmarked.
- The first automated click missed after the camera moved beyond the target. Its toast correctly requested a visible target. The centred, zoomed repeat passed without changes to gameplay input.
- The expected route and entry/exit labels remain briefing information; the mission status still reports active vehicles. This update removes automatic position tags, not all mission intelligence.
- Full destruction/automatic return was tested in the preceding vehicle pass and was not rerun for this small spawn-tag change. New gameplay ideas discussed in chat are proposals, not implemented features.

---

# Recognisable vehicle models QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 24 existing flight, collision, battle, mission and effects tests passed. Final production build passed; bundle advisory is approximately 593kB / 163kB gzip.
- Chromium at 1280×720: used actual arrow camera controls and wheel zoom to inspect the convoy at 8×. Left-click marked the tank, T enabled a clear warm thermal silhouette, and a second T restored the painted vehicle appearance. Captures: visual-tank-normal.png, visual-tank-thermal.png, visual-truck-normal.png.
- Completed the full convoy mission with ordinary keyboard FPV flight and read-only diagnostic steering: three sorties, 53.37 simulated seconds, 4,470 points. All three vehicles stayed destroyed and every impact automatically returned to unpaused recon without a sortie modal. No teleporting, health editing or clock acceleration.
- Inspected both original meshes in a temporary close-up review scene using the actual model factory. Captures realistic-tank-review.png and realistic-truck-review.png show the lower rounded turret, armour tiles, tracks, bonnet, grille, round lamps, tyres and painted surfaces. This fixture is a model inspection, separate from the gameplay tests above.
- Close-up review exposed canopy seams intersecting the fabric surface. Adjusted the seam curve and rear flap, rebuilt and inspected the final truck capture. Those final edits affect cosmetic geometry only.
- The temporary review page initially imported a second Three.js instance and requested an absent favicon; both fixture issues were corrected. They were not game runtime faults.
- Wheel groups roll from vehicle travel, static detail meshes are merged by material, and the existing material registration handles thermal switching and wreck recolouring.

## Limits
Vehicle shapes are original interpretations inspired by the T-72 family and Ural-4320, not exact replicas. Textures are procedural camouflage, wear and fabric. The forest and infantry retain the previous stylized assets; the overall game is not photorealistic. Arcade collision spheres, health, detection and mission balance are unchanged. Low-end hardware, extended human play, other browsers, controlled thermal concealment and cache interception were not rechecked in this vehicle-focused pass.

---

# Models and scenery QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities; all 24 tests passed and the final production build passed. Existing bundle advisory: approximately 582kB / 159kB gzip.
- Isolated Chromium at 1440×900: inspected the mixed conifer/broadleaf forest, textured ground, road shoulders and directional shadows from recon, then the friendly operator from the launch pad in normal and thermal views. Cyan armbands/chevron and the warm body remain visible.
- Actual keyboard camera aiming and wheel zoom reached 8× on the moving convoy. Left-click marked the tank. Inspected visual-tank-normal.png, visual-tank-thermal.png and visual-truck-normal.png for tracks, turret, stowage, cab, wheels and ribbed canvas body.
- Completed all three convoy kills using ordinary keyboard FPV flight with read-only diagnostic steering: 52.98 simulated seconds, three sorties and 4,480 points. Each hit returned automatically to recon without an unexpected pause or result modal. Inspected convoy-success.png for the wreck, fire and smoke.
- New vehicle/infantry meshes use the existing thermal material registration, wreck replacement and animated leg paths. Tree placement and collision spheres retain their deterministic layout; rendered crown geometry now supplies the revised sightlines.
- Close-up review found shadow/depth striping on thin road layers. They now receive shadows without casting them, and use separate depth offsets from the terrain.
- Browser console inspection after the vehicle checks reported zero errors and warnings. QA captures and scripts remain under ignored output/playwright/.

## Limits
This is a stylized procedural art pass, not photorealism. No external assets or real-world imagery were imported. Target hit spheres remain generous arcade approximations. Full convoy flight and vehicle sensor/marking were rechecked; cache interception and controlled foliage concealment were not replayed this pass. Friendly thermal appearance was inspected, but the friendly-click capture in this run moved the camera off the operator, so it does not independently revalidate the previous friendly-click assertion. Low-end GPU performance, other browsers and long-session balance remain untested.

---

# Friendly-team visibility QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities; all 24 tests and the production build passed. Existing bundle advisory: ~576kB / 157kB gzip.
- In an isolated Chromium browser at 1280×720, launched an FPV, aimed at a friendly operator and left-clicked. The aim label identified OUR TEAM · FRIENDLY, the reticle turned cyan and no hostile mark was added.
- Inspected friendly-team-normal-720.png and friendly-team-thermal-720.png: normal green uniform with cyan identification, warm body/head/legs in thermal, persistent cyan squad chevron and visible launch-pad paint.
- Climbed above 20m without the new camp decoration obstructing takeoff, then returned to recon.
- Verified the base marker in recon normal and thermal at approximately 2.4× zoom. Inspected friendly-base-recon-thermal-final.png; warm operators and the friendly support vehicle heat patch were visible among the camp structures.
- Turned away until the projected base marker left the view. The home reference stayed visible with a 207m distance and a direction arrow. Minimap showed the cyan BASE ring and friendly squad points.
- Adjusted world-marker visibility to keep labels out of HUD areas after an initial screenshot showed overlap near the bottom controls. Final atomic bounds check placed the projected base label in the centre of the view, separate from the lower-left home card.
- Final browser console: zero errors/warnings. The hidden QA browser was closed; the active player session was not controlled.

## Limits
Cyan paint/markers are fictional identification aids, not a physical thermal model. The known friendly-location overlay can remain visible through scenery; the rendered soldiers and their heat still obey scene occlusion. No friendly combat or damage system was added. Other resolutions/browsers were not rechecked this update.

---

# Click targeting, fixed recon and forest caches QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 24 tests and the production build passed. Existing bundle-size advisory: ~573kB / 156kB gzip.
- New tests check exact recon orbit height/radius, once-only cache bonus scoring, persistent cache fire/pause/cleanup, reserved cache sites and foliage sight occlusion separate from solid cover. The tested thicket ray intersects foliage at low height while clearing its solid bank; launch and hideout centres remain outside solid collision boxes.
- Chromium at 1440×900: held WASD/descent/boost and then climb during recon. Height stayed exactly 155m and position matched the fixed 175m-radius orbit schedule; manual remained false.
- Aimed at cache 1 with actual camera controls. It was initially absent from the map; E did not mark it, and left-click did. Normal and thermal/zoom views rendered correctly. Inspected cache-spotted-normal.png and cache-spotted-thermal.png.
- Flew an FPV from the launch clearing into cache 1 using ordinary movement keys. It became persistent rubble, earned exactly 750 bonus points, left the convoy objective unchanged and started a cache fire. Automatic recon return stayed unpaused with no result menu. Inspected cache-burning-recon.png.
- An additional automated cache-search loop did not acquire the cache from its changing orbit angle; visibility is obstructed by scenery, not guaranteed from every position. Human discovery difficulty remains unmeasured.
- The visible QA window became actively used during testing; remaining checks moved to a separate headless session. No further commands were sent to the active play session.
- In the isolated browser, completed all three convoy kills in 53.71 simulated seconds, using three FPVs and scoring 4,470 points. All three impacts returned automatically to recon without a pause or result menu. No health edits, teleporting or clock acceleration were used.
- At 1280×720, physically flew into a hideout at approximately (-76.6, 2.88, 124.3), then through its foliage and climbed out to 12m. FPV stayed alive at 100 health throughout. Inspected forest-hideout-720.png for low-flight scenery and readable controls.
- Final isolated browser console: zero errors and warnings. Only the hidden QA session was closed.

## Limits
Cache 1 received a complete mark/impact/fire playtest; caches 2/3 share the same implementation but were not separately flown into. Persistent fire longevity/cleanup and sight-versus-projectile occlusion have automated checks; the browser cover flight verifies passage rather than a controlled comparison of enemy detection. Bushes use stylized low-poly foliage volumes; no terrain deformation, spreading fire or blast damage to neighbouring targets. Discoverability, audio balance, other browsers and low-end hardware need human playtesting. Earlier recon-override and E-marking QA below is historical and superseded.

---

# Convoy Intercept QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. npm test: 20 tests passed. npm run build passed; existing bundle-size advisory is ~570kB / 155kB gzip.
- Mission tests cover warning/arrival timing, three distinct kills, duplicate-hit exclusion, terminal outcomes, scoring, escape/time/recon failure and encounter variations.
- Effect test creates multiple bursts: the 240-particle cap holds, aim rays ignore cosmetic meshes, and all transient particles are removed after their lifetime.
- Chromium at 1440×900: actual Space/D/Shift inputs produced ~58m/s, a -0.074-radian bank and ~78.2-degree FOV. Reduced motion settled the bank to zero. Escape froze the mission time during a 0.9-second check.
- Completed the entire mission twice with real keyboard flights and read-only diagnostic steering; no entity teleporting, health edits or accelerated clocks. The final run stopped all three vehicles in 52.38 simulated seconds using three FPVs, scoring 4,480 points. The first two kills left the mission active; the third completed it.
- Every successful sortie automatically returned to recon, with no result modal or unexpected pause. Final version pointed recon at the destroyed vehicle. Wrecks, fragments, dust ring, flame and smoke were visible in convoy-success.png. Active effect counts remained bounded (52/68/87 sampled after the three hits).
- The flight test exposed browser text selection from Ctrl+A during descent/strafe. Movement shortcuts now suppress default document actions and the HUD is nonselectable; the final playthrough had no selection artifacts.
- N replay opened preset 1 and vehicles entered from the opposite road end. A physical FPV flight near defenders triggered MOVING TO COVER, gunfire and FPV SHOT DOWN, followed by automatic recon return. Subsequent state showed infantry back on patrol. The initial test expected the intercept phase too early: the shootdown happened during the preparation countdown; subsequent observation confirmed the convoy entered normally.
- Inspected convoy-defenders-720.png at 1280×720: readable reaction/aim label, heart reticle, battery, mission objective and minimap with no overlapping panels.

- In preset 1, a vehicle escaped at 140.27 simulated seconds while the player was flying an FPV. The game returned to recon automatically, displayed failure without a modal, kept the mission clock fixed, and N opened preset 2. Inspected convoy-failed-720.png.

- Actual arrow-key aiming and E marked a pillbox; thermal and 1.3× zoom remained readable. Releasing low manual recon flight let autopilot recover safely; holding manual descent exposed recon to fire, reduced health to zero and set mission failure to Recon UAV lost. Restart restored 100 health, preparation phase and time zero.

- Final focused browser console: zero errors and warnings. Early unfocused automation produced pointer-lock errors; bringing the test page to the foreground resolved those. All subsequent full playthroughs retained pointer lock and automatic return.

## Limitations
The mission is an initial arcade balance pass. Full human balance and subjective sound levels, alternative browsers, mobile and low-end GPUs remain untested. Infantry reactions use local paths, not general cover navigation. Smoke is cosmetic; vehicles do not avoid wrecks or each other. Preset 0 received complete success playthroughs; preset 1 received escape/reaction playtesting; preset 2 received marking/recon-loss/restart checks. Earlier sections below describe historical builds.

---

# Battery and heart reticle QA — 1 November 2026

## Verified
- npm install completed with zero reported vulnerabilities. All 16 tests and production build passed.
- New tests check normal/boost power budgets across 20, 60 and 144 simulation steps per second, depletion clamping, warning thresholds and countdown formatting.
- Chromium at 1440×900: actual F launch and Space climb above 85m; battery visibly drained. Escape pause held battery exactly constant during a 1.2-second check; resume continued the sortie.
- ShiftRight + Space consumed approximately 1.784 seconds of battery per simulated second over a short interval including key transitions, consistent with the configured 1.8× rate.
- Let the active sortie run naturally to low battery, then critical battery and zero. No state mutations, clock acceleration or teleporting were used.
- At zero, last outcome was FPV BATTERY DEPLETED; camera returned to recon automatically, result modal stayed hidden, gameOver was false, kills stayed zero and the game remained unpaused.
- Immediate F relaunch produced a fresh FPV with 59.9833 seconds remaining on the sampled frame.
- Visually inspected battery-heart.png and battery-critical-thermal-720.png. Heart/dot remained centred and readable; thermal + 1.3× zoom worked; battery, launch card and map did not overlap at 1280×720. Low-warning screenshot also captured.
- Final browser console: zero errors and warnings.

## Limits
60 seconds is initial arcade balance, not real hardware endurance; extended human tuning remains open. Sound alerts are implemented but subjective loudness was not auditioned. Other browsers, mobile and low-end performance were not tested this update. X clips could not be played; research access limits are recorded in VISUAL_REFERENCES.md. Existing build chunk-size advisory remains (~562kB, 152kB gzip). Earlier QA below is historical.

---

# Battlefield and automatic return QA — 1 November 2026

## Verified
- npm install, npm test (14 tests) and npm run build passed. Existing bundle advisory: approximately 559kB / 151kB gzip.
- New unit checks cover front/rear vehicle perception on both roads, faster truck evasion, road bounds and lane recovery, off-road launch reservation, recessed trench floors, and swept collision with thin fortification walls.
- Chromium at 1440×900: FPV spawned in the friendly clearing at x=-100, climbed above 10m without a blocked takeoff, then crashed into the ground. Within the automatic handoff it returned to recon with no result menu; immediate second launch worked.
- Actual keyboard flight brought recon into the forward view of a transport and separately a tank. Both entered evasion and changed lateral position. Unit checks verify the speed difference and rear exclusion.
- A guided browser flight used ordinary keyboard controls from the new launch site to strike pillbox 1. The kill count rose to one, the pillbox stayed dead/visible as rubble, awareness dropped to zero, and the camera automatically returned to recon with the result menu hidden.
- Another actual flight hovered in enemy fire. FPV health reached zero, last outcome was FPV SHOT DOWN, recon appeared automatically, no menu opened, and a fresh FPV launched.
- Recon was then deliberately flown low into fire. Game over persisted rather than handing off, Restart remained available, and restart restored health and the intro state.
- Inspected battlefield-overview.png, forest-launch-final.png and friendly-shelter.png: original recessed trench geometry, camouflage shelter, equipment and a visible allied operator; takeoff opening is clear.
- Final browser console: zero errors.
- Browser navigation scripts read diagnostic state for assertions and steering, without teleporting entities or modifying health.

## Limits
This is the first low-poly battlefield pass. Netting is decorative; solid structures and trees provide game cover. Pillboxes use one-hit arcade destruction, not structural simulation. Vehicle avoidance does not include other vehicles. Extended human balance tests, alternative browsers, mobile/gamepad input, subjective audio and low-end GPU performance remain open. Detailed trench-floor flying was not separately browser-tested beyond the geometry/collision checks. Earlier QA sections are historical; their static-target and return-menu descriptions have been superseded.

---

# Moving battle QA — 1 November 2026

Current implementation and limits are described in README.md. The original prototype results below are historical and superseded where mechanics changed.

## Current checks
- npm install completed; npm audit reported zero vulnerabilities.
- npm test: 10 checks passed, including multiple recon circuits, return to orbit after a low manual offset, cover draining awareness, high-altitude exclusion, bidirectional traffic exits, responsiveness, high-speed collision and a moving vehicle crossing a stationary drone.
- npm run build passed. The existing bundle advisory is now approximately 528kB / 141kB gzip.
- Chromium, 1440×900: automatic recon displacement with full health; manual descent below 120m; release and automatic recovery above 140m; pause froze simulation time and traffic positions.
- Actual control flight lowered recon into enemy fire, reached recon health zero, displayed Operation lost, and restart restored full health and the opening state.
- FPV climbed above 80m without taking further damage. A subsequent low exposed pass drew fire, reduced FPV health to zero and allowed return to recon with the operation still active.
- A browser flight using keyboard steering from a high approach hit a moving, defending vehicle and increased the kill count. The test steered using read-only game state; it did not teleport the drone or mutate health/targets.
- Continued safe recon flight through a vehicle exit and replacement entry. At least one live enemy had a new serial; recon remained at full health.
- Low recon pass into the forest at approximately (72, 2, 72): one projectile was blocked by rendered tree geometry and recon remained at 100 health during the sampled interval. Some enemies still tracked it; this was evidence of projectile cover, not complete concealment from every enemy.
- Final browser console check: zero errors.
- Screenshots inspected: battle-recon-orbit.png and battle-under-fire.png. Additional captures include recon loss, moving-target hit and traffic cycle under output/playwright/.

## Remaining limitations
Long human play sessions, low-end hardware, other browsers, mobile controls and subjective audio/difficulty balance remain untested. No claim of realistic military behavior. Traffic has no vehicle-to-vehicle avoidance, and the four walking patrols are finite. Recon destruction is the terminal condition; ongoing traffic replaces the old nine-target victory. The visual models and projectile/collision tuning are original arcade abstractions.

---

# Prototype QA — 1 November 2026

## Passed
- npm install: 27 packages installed, audit reported zero vulnerabilities.
- npm test: four tests covering response/braking, frame-rate independence, high-speed swept collision and embedded/stationary contacts.
- npm run build: TypeScript and production Vite build pass.
- Chromium actual keyboard interaction: recon E marking, T thermal, wheel zoom, F launch; Space climb above 8m; release braking below 1m/s; Ctrl descent into terrain; crash result and return to recon; fresh launch; W acceleration above 30m/s; braking; direct vehicle strike with kill count exactly one; return and relaunch.
- Isolated browser assertions verified pointer-lock loss pauses and clears controls; movement stays stopped while paused; resume starts without stuck keys.
- Escape initially depended on the browser's pointer-lock default; changed to explicitly pause. Follow-up browser check passed Escape and Resume.
- FPV thermal and zoom, arrow-key aiming and right strafe checked at 1280×720. Visual captures inspected at 1440×900 and 1280×720.
- Final browser console: zero errors and zero warnings. Initial missing favicon was fixed.
- Target hit remains destroyed on subsequent sorties within the same session.

## Limits
- Static targets, original low-poly art, simplified tree/target collision shapes and arcade flight. No moving AI, enemy attacks, real map import, military authenticity, campaign, saves, controller support or touch controls.
- Mouse capture is exercised by browser interactions; long human play sessions and mouse sensitivity preference tuning remain open.
- Audio creation/mute is implemented, but subjective listening and volume balance remain unverified.
- Full nine-target completion and replay, long sessions, other browsers, mobile and low-end GPU performance remain untested.
- Vite reports a 516kB JavaScript chunk warning (137kB gzip).
- One headed automation run timed out during a pause check; the isolated repeat passed the entire sequence, and explicit Escape behavior was then separately fixed and tested.

Temporary screenshots and tool logs are ignored under output/playwright/. Early CLI metadata also exists in ignored .playwright-cli/.


## Launch clarity follow-up
- npm install, npm test (4 passed), and npm run build passed after the UI change.
- Chromium at 1280×720: marked the initial target, verified the persistent Press F now prompt, pressed F, verified FPV mode, and climbed above 5m with Space.
- Returned to recon, opened Escape menu, clicked Launch FPV drone, verified unpaused FPV mode and sortie increment, then accelerated above 25m/s using W.
- Inspected recon and pause-menu screenshots; launch text and the F key are legible and unobstructed. Captures: output/playwright/launch-recon.png and launch-pause-menu.png.
