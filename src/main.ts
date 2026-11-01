
import * as T from 'three';
import {FLIGHT,steer,contact} from './flight';
import './style.css';
const $=(id:string)=>document.getElementById(id)!;
$('app').innerHTML=`
<canvas id="view"></canvas><div class="hud">
<div class="top"><div><div class="brand">SRAJ<span>DRONE</span></div><div class="small">FOREST OPERATION / PROTOTYPE 01</div></div><div class="top-right small"><span class="live"></span>UPLINK ACTIVE<br><span id="sensor">EO · NORMAL VISION</span><br><span id="sorties">SORTIE 00</span></div></div>
<div class="compass">W · · N · · E<strong id="heading">000°</strong></div>
<div class="mission"><div class="small" id="mode">01 / RECONNAISSANCE</div><h2 id="objective">Find. Mark. Launch.</h2><div class="small" id="score">0 / 9 TARGETS DESTROYED</div></div>
<div class="launch-card"><div class="eyebrow" id="launch-title">FPV DRONE READY</div><p id="launch-copy">Press F to switch from recon to your ground drone.</p><button id="launch" class="primary"><kbd>F</kbd> LAUNCH FPV DRONE →</button><div class="launch-hint" id="launch-hint">Press Esc for clickable controls.</div></div><div class="telemetry">ALTITUDE<strong><span id="alt">160</span><small> m</small></strong>SPEED<strong><span id="speed">0</span><small> m/s</small></strong><span id="zoom">OPTICAL 1.0×</span></div>
<div id="cross" class="cross"></div><div id="aim" class="aim-label"></div><div id="markers"></div>
<div class="toast" id="toast"></div><div id="pointer">CLICK THE VIEW TO CAPTURE MOUSE · ESC TO RELEASE / PAUSE</div>
<div class="bottom"><div><div class="actions"><button id="tag"><kbd>E</kbd>MARK</button><button id="thermal"><kbd>T</kbd>THERMAL</button><button id="pause">PAUSE</button></div><div class="help" id="help"></div></div><div class="map-wrap"><div class="map-head"><span>SECTOR / BIRCH</span><span>N ↑</span></div><canvas id="map" width="356" height="356"></canvas><div class="small" style="font-size:8px">△ YOU &nbsp; ◇ MARKED &nbsp; + LAUNCH</div></div></div></div>
<div class="flash" id="flash"></div>
<div class="modal" id="intro"><div class="panel"><div class="eyebrow">SINGLE PLAYER / FOREST OPERATION</div><h1>Eyes above.<br>Action below.</h1><p>Scan the forest from your recon UAV. Press E to mark a visible enemy. Then press F to launch a waiting FPV drone and switch to its camera.</p><div class="steps"><div><b>01 / OBSERVE</b>Zoom + thermal</div><div><b>02 / MARK</b>Press E on a target</div><div><b>03 / LAUNCH</b>Press F, then fly</div></div><button class="primary" id="start">BEGIN OPERATION →</button><footer>KEYBOARD + MOUSE · ARCADE FLIGHT · ORIGINAL FICTIONAL MAP</footer></div></div>
<div class="modal" id="pauseModal" hidden><div class="panel"><div class="eyebrow">OPERATION PAUSED</div><h1>Take a breath.</h1><p>WASD flies. Mouse aims. Space climbs, Ctrl descends. Shift boosts. Release movement to brake. Arrow keys also aim. Scroll to zoom.</p><button class="primary" id="pauseLaunch">LAUNCH FPV DRONE →</button><button id="resume">RESUME OPERATION</button></div></div>
<div class="modal" id="result" hidden><div class="panel"><div class="eyebrow" id="resultLabel">SORTIE COMPLETE</div><h1 id="resultTitle">Target destroyed.</h1><p id="resultText"></p><button class="primary" id="continue">RETURN TO RECON →</button></div></div>`;
const canvas=$('view') as HTMLCanvasElement;
const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;
const scene=new T.Scene();scene.background=new T.Color('#a5b7b1');scene.fog=new T.FogExp2('#a5b7b1',.0018);
const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.12,1100);camera.rotation.order='YXZ';
scene.add(new T.HemisphereLight(0xdbe9ff,0x5b6041,2.2));const sun=new T.DirectionalLight(0xffe4b4,2.6);sun.position.set(-120,220,100);scene.add(sun);
const mats:{m:T.MeshStandardMaterial;color:T.Color;hot:boolean}[]=[];
function mat(color:number,hot=false){const m=new T.MeshStandardMaterial({color,roughness:.93,flatShading:true});mats.push({m,color:m.color.clone(),hot});return m}
const ground=mat(0x687251),road=mat(0x696962),dirt=mat(0x8b8870),trunk=mat(0x514a38),leafs=[mat(0x344f3e),mat(0x455d40),mat(0x576e47)],armor=mat(0x665f43,true),dark=mat(0x262d28,true),uniform=mat(0x796b4c,true),friend=mat(0x496e64),stripe=mat(0xdfb774,true);
function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent:T.Object3D=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o}
function box(w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,p:T.Object3D=scene){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p)}
box(1800,1,1800,ground,0,-.5,0);box(14,.1,470,road,0,.05,0);box(420,.11,10,road,0,.06,-55);box(32,.12,35,dirt,0,.07,140);
for(let z=-220;z<230;z+=15)box(.3,.13,5,dirt,0,.08,z);
let seed=7351;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
type Collider={p:T.Vector3;r:number};const treeColliders:Collider[]=[];
const trunks:T.Matrix4[]=[],crowns:T.Matrix4[][]=[[],[],[]];const dummy=new T.Object3D();
for(let i=0;i<1150;i++){const x=(random()-.5)*470,z=(random()-.5)*470;if(Math.abs(x)<17||Math.abs(z+55)<13||Math.hypot(x-13,z-137)<24)continue;const h=9+random()*14,r=2.5+random()*3;
dummy.position.set(x,h*.28,z);dummy.scale.set(.55,h*.56,.55);dummy.updateMatrix();trunks.push(dummy.matrix.clone());
for(let j=0;j<2;j++){dummy.position.set(x,h*(.52+j*.2),z);dummy.scale.set(r*(1-j*.2),h*.56,r*(1-j*.2));dummy.updateMatrix();crowns[i%3].push(dummy.matrix.clone())}
treeColliders.push({p:new T.Vector3(x,h*.52,z),r:r*.85});treeColliders.push({p:new T.Vector3(x,h*.23,z),r:1.1});}
function instances(g:T.BufferGeometry,m:T.Material,list:T.Matrix4[]){const o=new T.InstancedMesh(g,m,list.length);list.forEach((v,i)=>o.setMatrixAt(i,v));scene.add(o)}
instances(new T.CylinderGeometry(1,1,1,5),trunk,trunks);crowns.forEach((c,i)=>instances(new T.ConeGeometry(1,1,6),leafs[i],c));
for(let i=0;i<55;i++){const x=(random()-.5)*450,z=(random()-.5)*450;if(Math.abs(x)<18||Math.abs(z+55)<14)continue;mesh(new T.DodecahedronGeometry(1+random()*2),dirt,x,.5,z);}
type Target={id:number;name:string;group:T.Group;p:T.Vector3;r:number;alive:boolean;marked:boolean};
const targets:Target[]=[];
function target(name:string,x:number,z:number,kind:'tank'|'truck'|'soldier'){
 const g=new T.Group();scene.add(g);g.position.set(x,0,z);const id=targets.length+1;g.userData.target=id;
 if(kind==='tank'){box(4.1,1.4,6.6,armor,0,1.15,0,g);box(4.7,.85,6.8,dark,0,.55,0,g);box(2.5,1,3,armor,0,2.3,-.3,g);box(.25,.25,4.6,armor,0,2.4,-3,g);box(.7,.15,1,stripe,0,2.85,0,g);}
 else if(kind==='truck'){box(3,1,6,dark,0,.7,0,g);box(3,2.2,2.2,armor,0,2,-2,g);box(3,2.3,3.6,armor,0,2,.9,g);box(2.5,.7,.05,dark,0,2.45,-3.13,g);for(const a of [-1.6,1.6])for(const b of [-2,1.8]){const w=mesh(new T.CylinderGeometry(.7,.7,.35,10),dark,a,.7,b,g);w.rotation.z=Math.PI/2}}
 else {box(.8,1,.55,uniform,0,1.25,0,g);mesh(new T.SphereGeometry(.3,8,6),uniform,0,2,0,g);for(const x of [-.24,.24])box(.25,.8,.3,dark,x,.4,0,g);box(1.3,.25,.25,uniform,0,1.3,-.3,g);}
 targets.push({id,name,group:g,p:new T.Vector3(x,kind==='soldier'?1:1.5,z),r:kind==='soldier'?1:3.7,alive:true,marked:false});
}
target('ARMOR 01',0,40,'tank');target('TRANSPORT 02',0,-20,'truck');target('ARMOR 03',-60,-55,'tank');target('TRANSPORT 04',75,-55,'truck');target('ARMOR 05',0,-125,'tank');target('PATROL 06',9,15,'soldier');target('PATROL 07',-9,-12,'soldier');target('PATROL 08',50,-47,'soldier');target('PATROL 09',-40,-64,'soldier');
box(6,.25,6,friend,0,.2,140);for(let i=0;i<3;i++){box(1,1,.6,friend,12+i*2,1,139);mesh(new T.SphereGeometry(.3,8,6),friend,12+i*2,1.85,139);}

const debris:{mesh:T.Mesh;v:T.Vector3;age:number}[]=[];
let audio:AudioContext|undefined,rotor:OscillatorNode|undefined,volume:GainNode|undefined,muted=false;
function audioStart(){if(audio){void audio.resume();return}audio=new AudioContext();rotor=audio.createOscillator();rotor.type='sawtooth';volume=audio.createGain();volume.gain.value=0;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;rotor.connect(filter);filter.connect(volume);volume.connect(audio.destination);rotor.start();}
function boom(){if(!audio||muted)return;const n=audio.sampleRate*.6,buffer=audio.createBuffer(1,n,audio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const source=audio.createBufferSource();source.buffer=buffer;const gain=audio.createGain();gain.gain.value=.25;source.connect(gain);gain.connect(audio.destination);source.start();}
function explode(p:T.Vector3){boom();for(let i=0;i<40;i++){const m=mesh(new T.IcosahedronGeometry(.3+random()*.7,0),new T.MeshBasicMaterial({color:i%3?0xffa33d:0x535955,transparent:true}),p.x,p.y,p.z);debris.push({mesh:m,v:new T.Vector3((random()-.5)*18,random()*16,(random()-.5)*18),age:0});}}
const spawn=new T.Vector3(0,1.2,140),recon=new T.Vector3(0,155,175);
let mode:'recon'|'fpv'='recon',started=false,paused=false,ended=false,thermal=false,yaw=0,pitch=-.85,zoom=1,sorties=0,kills=0,elapsed=0;
const velocity=new T.Vector3(),position=recon.clone(),keys=new Set<string>(),ray=new T.Raycaster();let aimed:Target|undefined;let toastUntil=0;
function toast(s:string){$('toast').textContent=s;$('toast').classList.add('show');toastUntil=elapsed+2.6}
function sensor(){thermal=!thermal;document.body.classList.toggle('thermal',thermal);mats.forEach(({m,color,hot})=>{m.color.copy(thermal?new T.Color(hot?0xffe5ac:0x252c31):color);m.emissive.setHex(thermal&&hot?0xffb95c:0);m.emissiveIntensity=thermal&&hot?.8:0});scene.background=new T.Color(thermal?'#151d24':'#a5b7b1');scene.fog=new T.FogExp2(thermal?'#151d24':'#a5b7b1',thermal?.0025:.0018);$('sensor').textContent=thermal?'IR · WHITE HOT':'EO · NORMAL VISION';$('thermal').innerHTML='<kbd>T</kbd>'+(thermal?'NORMAL':'THERMAL')}
function updateMode(){
 const isRecon=mode==='recon';
 $('launch-title').textContent=isRecon?'FPV DRONE READY':'YOU ARE CONTROLLING THE FPV DRONE';
 $('launch-copy').textContent=isRecon?'Press F to switch from recon to your ground drone.':'Hold Space to take off. Use W to fly forward and the mouse to aim.';
 $('launch-hint').textContent=isRecon?'No target mark required. Esc opens clickable controls.':'Release movement to brake. Press F to return to recon.';
 $('pauseLaunch').hidden=!isRecon;
 $('mode').textContent=mode==='recon'?'01 / RECONNAISSANCE':'02 / FPV STRIKE';$('objective').textContent=mode==='recon'?'Press E to mark · Press F to launch':'Fly into a target. Make it count.';$('launch').innerHTML='<kbd>F</kbd>'+(mode==='recon'?' LAUNCH FPV DRONE →':' RETURN TO RECON');$('help').innerHTML='<kbd>W A S D</kbd> '+(mode==='recon'?'MOVE UAV':'FLY')+' &nbsp; <kbd>SPACE / CTRL</kbd> UP / DOWN<br><kbd>MOUSE / ARROWS</kbd> AIM &nbsp; <kbd>SCROLL</kbd> ZOOM &nbsp; <kbd>SHIFT</kbd> BOOST &nbsp; <kbd>M</kbd> MUTE';}
function switchMode(){if(!started||paused||ended)return;keys.clear();velocity.set(0,0,0);mode=mode==='recon'?'fpv':'recon';position.copy(mode==='fpv'?spawn:recon);yaw=0;pitch=mode==='fpv'?0:-.85;zoom=1;if(mode==='fpv'){sorties++;toast('FPV READY · SPACE TO CLIMB · W TO FLY');}updateMode();}
function mark(){if(!started||paused||ended)return;if(aimed){aimed.marked=true;toast(aimed.name+' MARKED · PRESS F TO LAUNCH FPV');if(mode==='recon')$('launch-copy').textContent=aimed.name+' marked. Press F now to launch your FPV drone.'}else toast('Aim directly at a visible target to mark')}
function pause(value:boolean){if(!started||ended)return;paused=value;keys.clear();velocity.set(0,0,0);$('pauseModal').hidden=!value;if(value)document.exitPointerLock();}
function finish(hit?:Target){ended=true;keys.clear();velocity.set(0,0,0);document.exitPointerLock();explode(hit?hit.p:position);if(hit){hit.alive=false;kills++;hit.group.traverse(o=>{if(o instanceof T.Mesh)o.material=new T.MeshStandardMaterial({color:0x242624,roughness:1})});hit.group.scale.y=.45;}
$('flash').classList.add('on');setTimeout(()=>$('flash').classList.remove('on'),120);
$('resultLabel').textContent=kills===targets.length?'SECTOR CLEARED':'SORTIE '+String(sorties).padStart(2,'0')+' COMPLETE';
$('resultTitle').textContent=hit?'Target destroyed.':'Drone lost.';
$('resultText').textContent=hit?hit.name+' eliminated. '+kills+' of '+targets.length+' targets destroyed.': 'You hit the terrain or a tree. A fresh drone is ready. Release movement to brake, and use Space to gain height.';
$('continue').textContent=kills===targets.length?'RESTART OPERATION →':'RETURN TO RECON →';setTimeout(()=>$('result').hidden=false,850);}
$('start').onclick=()=>{audioStart();started=true;$('intro').hidden=true;canvas.requestPointerLock();toast('SCAN WITH MOUSE · E TO MARK · F TO LAUNCH')};
$('pauseLaunch').onclick=()=>{pause(false);switchMode();canvas.requestPointerLock()};
$('resume').onclick=()=>{pause(false);canvas.requestPointerLock()};
$('pause').onclick=()=>pause(true);$('thermal').onclick=()=>{if(!paused&&!ended)sensor()};$('tag').onclick=mark;$('launch').onclick=switchMode;
$('continue').onclick=()=>{if(kills===targets.length){location.reload();return}ended=false;$('result').hidden=true;mode='fpv';switchMode();canvas.requestPointerLock()};
canvas.onclick=()=>{if(started&&!paused&&!ended)canvas.requestPointerLock()};
document.addEventListener('pointerlockchange',()=>{$('pointer').style.display=document.pointerLockElement?'none':'block';if(!document.pointerLockElement&&started&&!ended&&!paused)pause(true)});
document.addEventListener('mousemove',e=>{if(started&&!paused&&!ended&&document.pointerLockElement){yaw-=e.movementX*.0022/zoom;pitch=T.MathUtils.clamp(pitch-e.movementY*.0022/zoom,-1.5,1.35)}});
addEventListener('keydown',e=>{if(['Space','ControlLeft','ControlRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();if(e.code==='Escape'){pause(!paused);return}if(!started||paused||ended)return;keys.add(e.code);if(!e.repeat){if(e.code==='KeyM'){muted=!muted;toast(muted?'AUDIO MUTED':'AUDIO ON')}if(e.code==='KeyT')sensor();if(e.code==='KeyE')mark();if(e.code==='KeyF')switchMode();}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>pause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true)});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(!paused&&!ended)zoom=T.MathUtils.clamp(zoom*(e.deltaY>0?.8:1.25),1,mode==='recon'?8:3)},{passive:false});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const map=($('map') as HTMLCanvasElement).getContext('2d')!;
function mapDraw(){const s=356/500,to=(v:number)=>(v+250)*s;map.fillStyle='#1b2c29';map.fillRect(0,0,356,356);map.strokeStyle='#607267';map.lineWidth=8;map.beginPath();map.moveTo(to(0),to(-235));map.lineTo(to(0),to(235));map.moveTo(to(-210),to(-55));map.lineTo(to(210),to(-55));map.stroke();map.strokeStyle='#c7eaa744';map.lineWidth=1;for(let i=0;i<356;i+=71){map.beginPath();map.moveTo(i,0);map.lineTo(i,356);map.moveTo(0,i);map.lineTo(356,i);map.stroke()}map.fillStyle='#cfff95';map.font='18px monospace';map.fillText('+',to(spawn.x)-5,to(spawn.z)+5);for(const t of targets)if(t.marked){map.fillStyle=t.alive?'#ffb57e':'#65746c';map.fillText(t.alive?'◇':'×',to(t.p.x)-6,to(t.p.z)+6)}map.save();map.translate(to(position.x),to(position.z));map.rotate(-yaw);map.fillStyle='#e0ffc1';map.beginPath();map.moveTo(0,-8);map.lineTo(-5,6);map.lineTo(5,6);map.closePath();map.fill();map.restore();}
function frame(dt:number){
 elapsed+=dt;
 if(volume&&audio&&rotor){volume.gain.setTargetAtTime(!muted&&started&&!paused&&!ended&&mode==='fpv'?.025:0,audio.currentTime,.07);rotor.frequency.setTargetAtTime(95+velocity.length()*3,audio.currentTime,.05);}
 for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.age+=dt;d.v.y-=12*dt;d.mesh.position.addScaledVector(d.v,dt);d.mesh.rotation.x+=dt*3;(d.mesh.material as T.MeshBasicMaterial).opacity=Math.max(0,1-d.age/2);if(d.age>2){scene.remove(d.mesh);d.mesh.geometry.dispose();(d.mesh.material as T.Material).dispose();debris.splice(i,1);}}
 if(toastUntil<elapsed)$('toast').classList.remove('show');
 if(started&&!paused&&!ended){
 yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.35/zoom;pitch=T.MathUtils.clamp(pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt/zoom,-1.5,1.35);
 const f=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),s=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),u=(keys.has('Space')?1:0)-((keys.has('ControlLeft')||keys.has('ControlRight')||keys.has('KeyC'))?1:0);
 const forward=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));if(mode==='fpv')forward.set(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
 const desired=forward.multiplyScalar(f).add(new T.Vector3(Math.cos(yaw)*s,u,-Math.sin(yaw)*s));if(desired.length()>1)desired.normalize();desired.multiplyScalar(mode==='recon'?55:keys.has('ShiftLeft')?FLIGHT.boost:FLIGHT.speed);
 velocity.copy(steer(velocity,desired,dt));const next=position.clone().addScaledVector(velocity,dt);
 if(mode==='fpv'){
 let earliest=Infinity,victim:Target|undefined;for(const t of targets)if(t.alive){const c=contact(position,next,t.p,t.r+FLIGHT.radius);if(c!==null&&c<earliest){earliest=c;victim=t}}
 for(const c of treeColliders){const n=contact(position,next,c.p,c.r+FLIGHT.radius);if(n!==null&&n<earliest){earliest=n;victim=undefined}}
 if(next.y<.45&&velocity.y<0){const n=(position.y-.45)/(position.y-next.y);if(n<earliest){earliest=n;victim=undefined}}
 if(earliest!==Infinity){position.lerp(next,earliest);finish(victim)}else position.copy(next);
 }else position.copy(next);
 position.x=T.MathUtils.clamp(position.x,-FLIGHT.limit,FLIGHT.limit);position.z=T.MathUtils.clamp(position.z,-FLIGHT.limit,FLIGHT.limit);position.y=T.MathUtils.clamp(position.y,mode==='recon'?65:.45,mode==='recon'?220:130);
 }
 camera.position.copy(position);camera.rotation.set(pitch,yaw,0,'YXZ');camera.fov=65/zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 aimed=undefined;ray.setFromCamera(new T.Vector2(0,0),camera);const hits=ray.intersectObjects(scene.children,true);if(hits.length){let o:T.Object3D|null=hits[0].object;while(o&&!o.userData.target)o=o.parent;if(o)aimed=targets.find(t=>t.id===o!.userData.target&&t.alive);}
 $('cross').classList.toggle('ready',!!aimed);$('aim').textContent=aimed?aimed.name+' · E TO MARK':'';$('alt').textContent=Math.round(position.y).toString();$('speed').textContent=Math.round(velocity.length()).toString();$('heading').textContent=String(Math.round(((-yaw*180/Math.PI)%360+360)%360)).padStart(3,'0')+'°';$('zoom').textContent='OPTICAL '+zoom.toFixed(1)+'×';$('sorties').textContent='SORTIE '+String(sorties).padStart(2,'0');$('score').textContent=kills+' / '+targets.length+' TARGETS DESTROYED';
 let html='';for(const t of targets)if(t.marked&&t.alive){const p=t.p.clone().project(camera);if(p.z>-1&&p.z<1&&Math.abs(p.x)<.94&&Math.abs(p.y)<.85)html+='<div class="tag" style="left:'+((p.x+1)*50)+'%;top:'+((-p.y+1)*50)+'%">'+t.name+' · '+Math.round(position.distanceTo(t.p))+'m</div>'}$('markers').innerHTML=html;mapDraw();renderer.render(scene,camera);
}
updateMode();let last=performance.now();function animate(now:number){const dt=Math.min((now-last)/1000,.05);last=now;frame(dt);requestAnimationFrame(animate)}requestAnimationFrame(animate);
// Read-only state for browser QA; no teleporting or test-only gameplay controls.
Object.defineProperty(window,'gameState',{get:()=>({mode,started,paused,ended,thermal,zoom,kills,sorties,position:{x:position.x,y:position.y,z:position.z},velocity:velocity.length(),aimed:aimed?.id,marked:targets.filter(t=>t.marked).map(t=>t.id),remaining:targets.filter(t=>t.alive).map(t=>t.id)})});
