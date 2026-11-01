# Srajdrone

Standalone desktop browser FPV combat game with an original fictional forest battlefield.

## Run
Node.js 22+:
```
npm install
npm run dev -- --port 5178
npm test
npm run build
```
Open http://127.0.0.1:5178 and click Begin operation.

## Convoy Intercept
Stop all three convoy vehicles before any escapes the forest road. A 12-second preparation countdown precedes staggered arrivals. The operation lasts at most 2:35, including preparation. The convoy route, entry/exit and incoming vehicle markers appear on the map. E still marks other visible enemies.

Each convoy vehicle destroyed earns 1,000 points. Completing the mission adds 10 points per remaining second (rounded up) and 150 for each drone below six used. A vehicle escaping, time expiring or losing recon fails the operation. FPV loss alone does not.

After each impact, shootdown or exhausted battery, the camera automatically returns to recon. There is no sortie return menu. After a successful hit, recon looks toward the destroyed target so the wreck and smoke remain visible. Mission success/failure appears as a compact report in recon; press N for the next intercept. Three encounter presets vary arrival gaps, speed and road direction. Escape also offers restart. Recon loss retains the terminal restart screen.

Convoy wrecks remain for the operation. Vehicles do not respawn. Infantry and pillboxes are optional supporting targets and do not count toward convoy completion.

## Flight and combat
Recon circles high automatically. Mouse aims independently of flight; WASD and Space/Ctrl temporarily override the orbit. Recon keeps circling during FPV flight. F launches from the friendly off-road forest clearing.

FPV acceleration and braking remain responsive. The camera has a wider base view, gentle sideways banking and a smooth boost field-of-view increase, plus synthesized wind/rotor audio. V toggles reduced motion (also in Pause), initially respecting the system preference. Reduced motion removes banking and the speed-dependent FOV expansion; zoom still works.

Each FPV starts with 60 seconds of normal-power battery. Moving with Shift held drains 1.8× faster. Low/critical warnings appear at 15/7 seconds of normal-power capacity. Pause stops the battery and mission clock. Depletion briefly cuts the feed and restores recon. Recon has no battery countdown.

The heart reticle's centre dot is the exact aim point. Normal and simulated thermal views support zoom. Vehicle crews need an unobstructed forward view of a nearby low drone to react; trucks evade faster than tanks. Soldiers move along their local defensive paths when alerted, crouch at their destination, then return to patrol after the threat clears. Aim labels report enemy reactions.

Hits produce target-dependent bursts with fire, fragments, a dust ring and smoke. Vehicle/fortification wrecks emit smoke for 40 seconds and flames briefly. Cosmetic effects never block aiming or collision rays and have a 240-particle cap. Original synthesized explosions include a low-frequency impact.

## Controls
- WASD: recon override / FPV forward, backward and strafe.
- Mouse or arrow keys: aim. Click view to capture mouse.
- Space: climb. Ctrl or C: descend.
- Either Shift: FPV boost. Release movement to brake and hover.
- E: mark. F: launch FPV / manually switch to recon.
- T: normal / thermal. Wheel: zoom.
- Escape: pause and clickable controls. M: mute. V: reduce flight motion.
- N: next intercept after mission completion.

## Prototype boundaries
TypeScript + Three.js + Vite; original procedural assets, no backend or saves. Original map, not extracted Google Maps data. Timber, earth, trees and concrete block sight/fire; camouflage netting is decorative.

Movement, detection and weapons are fictional arcade abstractions. Targets use generous one-hit collision spheres. Infantry cover behavior follows local paths rather than general navigation. Vehicles do not avoid other vehicles or wrecks; smoke is cosmetic. No structural destruction simulation. Audio levels, mission balance, other browsers and low-end hardware need broader human playtesting.

See [docs/QA.md](docs/QA.md) for actual checks and [docs/VISUAL_REFERENCES.md](docs/VISUAL_REFERENCES.md) for prior visual research limits. Temporary browser artifacts live under ignored output/playwright/.

