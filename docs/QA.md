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
