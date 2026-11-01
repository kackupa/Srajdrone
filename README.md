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
Stop all three convoy vehicles before any escapes the forest road. A 12-second preparation countdown precedes staggered arrivals. The operation lasts at most 2:35, including preparation. The convoy route, entry/exit and incoming vehicle markers appear on the map. Left-click marks the visible target under the heart reticle. Concealed caches stay off the map until marked.

Each convoy vehicle destroyed earns 1,000 points. Completing the mission adds 10 points per remaining second (rounded up) and 150 for each drone below six used. A vehicle escaping or time expiring fails the operation. FPV loss alone does not.

After each impact, shootdown or exhausted battery, the camera automatically returns to recon. There is no sortie return menu. After a successful hit, recon looks toward the destroyed target so the wreck and smoke remain visible. Mission success/failure appears as a compact report in recon; press N for the next intercept. Three encounter presets vary arrival gaps, speed and road direction. Escape also offers restart. Recon now remains safely above the enemy fire ceiling.

Three low-profile ammo caches are optional bonus targets worth 750 points each. Search the foliage with the orbiting camera, zoom and thermal: crates and tarps blend into the terrain, while a small warm equipment box offers a thermal clue. Foliage still occludes thermal; it does not reveal caches through cover. Caches do not count toward the three convoy kills or prolong a completed mission.

Convoy wrecks remain for the operation. Vehicles do not respawn. Infantry and pillboxes are optional supporting targets and do not count toward convoy completion.

## Flight and combat
Recon follows a fixed 155m-high, 175m-radius orbit. Movement keys cannot change its path or altitude. Mouse/arrows aim the camera, wheel zooms and T switches sensors. Recon keeps circling during FPV flight. F launches from the friendly off-road forest clearing.

FPV acceleration and braking remain responsive. The camera has a wider base view, gentle sideways banking and a smooth boost field-of-view increase, plus synthesized wind/rotor audio. V toggles reduced motion (also in Pause), initially respecting the system preference. Reduced motion removes banking and the speed-dependent FOV expansion; zoom still works.

Each FPV starts with 60 seconds of normal-power battery. Moving with Shift held drains 1.8× faster. Low/critical warnings appear at 15/7 seconds of normal-power capacity. Pause stops the battery and mission clock. Depletion briefly cuts the feed and restores recon. Recon has no battery countdown.

The heart reticle's centre dot is the exact aim point. Normal and simulated thermal views support zoom. Vehicle crews need an unobstructed forward view of a nearby low drone to react; trucks evade faster than tanks. Soldiers move along their local defensive paths when alerted, crouch at their destination, then return to patrol after the threat clears. Aim labels report enemy reactions.

Hits produce target-dependent bursts with fire, fragments, a dust ring and smoke. Vehicle/fortification wrecks emit smoke for 40 seconds and flames briefly. Ammo caches have larger bursts and leave flames and smoke burning for three minutes of active time, including the recon review after the mission. Pausing freezes the fire. Cosmetic effects never block aiming or collision rays and have a 240-particle cap. Original synthesized explosions include a low-frequency impact.

Our own team is identified in cyan in both sensors: squad chevrons, launch-pad paint and a labelled BASE ring on the minimap. Friendly soldiers show warm bodies in thermal. A permanent OUR TEAM / BASE card gives distance and camera-relative direction even when the camp is off-screen. Friendly world labels avoid HUD panels. Aiming at a friendly turns the heart cyan; clicking identifies the friendly instead of adding an enemy mark. These known-location markers are game aids and can show through cover.

## Models and scenery
The convoy now uses original T-72-family and Ural-4320-inspired vehicle models. The tank has a low rounded turret, exterior armour tiles, six main road wheels per track, segmented treads, rear stowage and a detailed barrel. The transport has a long bonnet, vertical grille, round headlights, six treaded tyres, intake, mirrors and a squared fabric canopy. Both use smooth shading, painted camouflage, wear and fabric textures; wheels rotate with travel. Small static details are batched by material to keep draw calls bounded.

Paint/fabric maps are temporarily suppressed in thermal so camouflage does not hide the warm vehicle signature, and restored in normal vision. Existing target marking, collision spheres, damage and automatic recon handoff remain. These are visual interpretations with fictional faction names, not exact replicas or real equipment simulations. Infantry and friendly operators retain helmets, vests, pouches, packs, boots and cyan friendly identification.

The forest still uses the preceding stylized mixed conifer/broadleaf trees, procedural ground/road textures, dirt shoulders and soft directional shadows. This pass improves vehicle realism; it does not make the entire scene photorealistic. All meshes/textures are authored locally in code with no downloaded model/texture assets. See docs/VISUAL_REFERENCES.md for appearance references.

## Controls
- WASD: FPV forward, backward and strafe only. Recon flight cannot be overridden.
- Mouse or arrow keys: look/aim. Left-click: mark the visible target under the heart; also captures the mouse when needed.
- Space: climb. Ctrl or C: descend.
- Either Shift: FPV boost. Release movement to brake and hover.
- F: launch FPV / manually switch to recon. E no longer marks.
- T: normal / thermal. Wheel: zoom.
- Escape: pause and clickable controls. M: mute. V: reduce flight motion.
- N: next intercept after mission completion.

## Prototype boundaries
TypeScript + Three.js + Vite; original procedural assets, no backend or saves. Original map, not extracted Google Maps data. Timber, earth, trees and concrete block sight/fire; camouflage netting is decorative. Dense shrubs, low foliage and four open-centred thickets provide new hiding spaces. Brush breaks enemy sightlines but is soft to fly through; already-fired bullets can pass through it. Logs and earth banks are solid obstacles that stop fire and collide with FPVs.

Movement, detection and weapons are fictional arcade abstractions. Targets use generous one-hit collision spheres. Infantry cover behavior follows local paths rather than general navigation. Vehicles do not avoid other vehicles or wrecks; smoke is cosmetic. No structural destruction simulation. Audio levels, cache-discovery difficulty, mission balance, other browsers and low-end hardware need broader human playtesting.

See [docs/QA.md](docs/QA.md) for actual checks and [docs/VISUAL_REFERENCES.md](docs/VISUAL_REFERENCES.md) for prior visual research limits. Temporary browser artifacts live under ignored output/playwright/.

