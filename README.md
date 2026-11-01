# Srajdrone

Standalone desktop browser FPV combat game prototype. Original fictional forest map and procedural artwork.

## Run

Node.js 22+:
```
npm install
npm run dev -- --port 5178
npm test
npm run build
```
Open http://127.0.0.1:5178. Click Begin operation.

## The hunt

The recon UAV circles continuously at high altitude. Mouse aiming is independent of flight and its view stabilizes on the ground during the automatic orbit. WASD and Space/Ctrl temporarily override the aircraft; releasing movement resumes its high loop. The recon keeps orbiting while you fly an FPV.

Aim at a visible vehicle or patrol and press E to mark it. Press F to launch a fresh FPV beside the friendly squad, or press Escape and click Launch FPV drone. Fly into a target to destroy it. Vehicle traffic enters and leaves along both roads; destroyed/exited vehicles are replaced after a delay. Patrols walk the shoulders. This is an ongoing hunt scored by targets destroyed, rather than a finite nine-target mission.

Rifle patrols and tank machine guns spot low, exposed drones before firing visible projectiles. Tanks stop to engage. Trees block both sight and projectiles; breaking sight drains enemy tracking. High altitude keeps you outside the deliberately limited arcade defense envelope. Incoming hits show a red flash and reduce health. FPV losses are recoverable; recon health persists and its destruction ends the operation. Restart resets the entire operation.

## Controls

- WASD: recon manual override / FPV forward, backward and strafe. FPV forward follows the view.
- Mouse: aim; click the view to capture the mouse.
- Space: climb. Ctrl or C: descend.
- Shift: FPV boost. Release FPV movement to brake and hover.
- Arrow keys: alternative aiming.
- E: mark the target under the reticle.
- F: launch FPV / return to recon.
- T: normal / simulated thermal vision.
- Wheel: zoom (recon up to 8×, FPV up to 3×).
- Escape: pause and clickable launch menu. M: mute.

## Prototype boundaries

TypeScript + Three.js + Vite, one original forest sector, no backend or saves. Original simple rifle and turret shapes, synthesized rotor/impact/gunfire audio, instanced trees and debris effects. No Google Maps or real military assets.

Movement, weapon behavior and hitboxes are fictional arcade abstractions. Trees use simplified drone collision volumes, while visibility/projectile checks use their rendered geometry. Targets have generous one-hit collision spheres. Marks track surviving enemies until they leave the map. Transports do not shoot; patrols do not respawn. Traffic uses fixed road lanes without vehicle-to-vehicle avoidance. Infantry routes and combat behavior are intentionally simple.

## Validation

See [docs/QA.md](docs/QA.md) for actual test results and remaining limitations. Temporary browser captures are ignored under output/playwright/.

