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
