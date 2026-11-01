# Srajdrone

Standalone desktop browser FPV combat game prototype. Original fictional forest map and procedural artwork; no imported Google imagery, real geography, or real military assets.

## Run
Node.js 22+:
```
npm install
npm run dev -- --port 5178
npm test
npm run build
```
Open http://127.0.0.1:5178. Click Begin operation, then use the keyboard and mouse.

## Play
Start in a high recon UAV. Aim at a visible vehicle or patrol and press E to mark it on the map. F launches a fresh FPV drone beside a friendly squad. Fly into an enemy target to destroy it. A hit consumes the drone; return to recon and launch again. Clear all nine targets to finish. F can also abandon a sortie and return to recon.

- WASD: forward/backward and strafe. FPV forward follows the view.
- Mouse: aim. Click the view to capture the mouse.
- Space: climb. Ctrl or C: descend.
- Shift: boost. Release movement to brake quickly.
- Arrow keys: alternative aiming.
- E: mark the target directly under the reticle.
- T: normal / simulated thermal vision.
- Mouse wheel: zoom (recon up to 8×, FPV up to 3×).
- Escape: release mouse and pause. M: mute synthesized audio.

Thermal rendering highlights enemies but uses normal depth occlusion. Previously marked positions remain visible as game HUD markers. All enemies are stationary in this first prototype. Targets use generous spherical game hitboxes, with one-hit destruction. Trees use simplified collision volumes. This is arcade movement with automatic hover, not an aircraft simulator.

## Implementation
TypeScript + Three.js + Vite. A single original 500m playable forest sector with two intersecting roads; no backend, accounts, external map service, or persistent save. Instanced trees, simple vehicle/soldier shapes, synthesized rotor/impact audio and original debris effects.

## Validation
See [docs/QA.md](docs/QA.md) for actual test results and limitations. Temporary browser artifacts live under ignored output/playwright/.
