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

