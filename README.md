# Srajdrone

Standalone desktop browser FPV combat prototype with an original fictional forest battlefield.

## Run

Node.js 22+:
```
npm install
npm run dev -- --port 5178
npm test
npm run build
```
Open http://127.0.0.1:5178 and click Begin operation.

## Operation

Recon circles automatically at high altitude. Mouse aiming is independent of flight. WASD and Space/Ctrl temporarily override the aircraft; release movement to resume its high loop. Recon keeps orbiting while you fly an FPV.

Press E to mark a visible enemy and F to launch an FPV from the sheltered friendly forest team. The launch clearing is off the road, beside operators, equipment, a supply van, a timber dugout and camouflage netting. Space climbs through the clear opening.

Hit a vehicle, soldier or pillbox to destroy it. After any FPV impact or shootdown, a brief impact effect switches directly back to recon. There is no sortie return menu, and another drone can launch immediately. Recon health persists; losing recon ends the operation and shows Restart.

Vehicles enter and leave on both roads. A vehicle must see a low drone in its forward viewing area with an unobstructed sightline to react. Trucks accelerate and swerve faster; tanks maneuver more slowly while their machine guns defend them. Soldiers and pillboxes fire on exposed drones. Tracking warnings, tracers and red damage flashes give feedback.

Trees and solid fortifications block sight and fire. Two enemy trench sections have recessed floors, timber walls, duckboards and sandbags. Two pillboxes can be destroyed permanently during the operation; destroyed structures remain as rubble. Patrols walk the trench paths and roadside. Vehicle replacements keep the hunt going.

## Controls

- WASD: recon override / FPV forward, backward and strafe. FPV forward follows the view.
- Mouse: aim; click the view to capture it.
- Space: climb. Ctrl or C: descend.
- Shift: FPV boost. Release FPV movement to brake and hover.
- Arrow keys: alternative aiming.
- E: mark. F: launch FPV / manually switch to recon.
- T: normal / simulated thermal. Wheel: zoom.
- Escape: pause and clickable launch controls. M: mute.

## Prototype boundaries

TypeScript + Three.js + Vite; original procedural assets, no backend or saves. Terrain scars, broken trees, vehicle camouflage and netting provide the first battlefield art pass. Netting is visual; solid timber, earth, trees and concrete provide gameplay cover.

Movement, weapon behavior and detection are fictional arcade abstractions. Targets use generous one-hit collision spheres, including pillboxes. Trenches are recessed but have simple rectangular layouts. Trees use simplified drone collision volumes; solid cover uses swept box collision. Visibility/projectiles use rendered cover geometry. Roads have no vehicle-to-vehicle avoidance. Infantry and pillboxes do not respawn. Marks track surviving targets until they leave the map.

See [docs/QA.md](docs/QA.md) for actual checks and remaining limitations. Temporary browser artifacts are ignored under output/playwright/.

