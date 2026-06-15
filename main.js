// ============================================================
//  新加坡保衛戰 1942 — 3D 戰史運鏡  主程式
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { PLACES, UNITS, PHASES, JP, UK } from './data.js';
import { buildTerrain, animateWater, landHeight, COASTLINES } from './terrain.js';
import { buildFeatures, BATTERIES, buildDefenseLines } from './features.js';
import { makeFlagTexture } from './emblems.js';
import { FireFX, WeatherFX } from './effects.js';

// ---------------- 基礎場景 ----------------
const root = document.getElementById('scene-root');
const isMobile = matchMedia('(max-width: 820px)').matches ||
  (('ontouchstart' in window) && Math.min(window.innerWidth, window.innerHeight) < 820);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x12233f, 60, 165);

const camera = new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.5, 600);
camera.position.set(0, 72, 48);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
root.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(innerWidth, innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('label-layer').appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI*0.49;
controls.minDistance = 8;
controls.maxDistance = 160;
controls.target.set(-1, 0, -2);
const compassRing = document.querySelector('#compass .cmp-ring');

// ---------------- 燈光 ----------------
const lights = {};
lights.hemi = new THREE.HemisphereLight(0xbcd0ee, 0x33402c, 0.5);
scene.add(lights.hemi);
lights.dir = new THREE.DirectionalLight(0xfff0d6, 1.0);
lights.dir.position.set(-40, 60, -10);
scene.add(lights.dir);
scene.add(new THREE.AmbientLight(0x404a5a, 0.4));

// ---------------- 天空 ----------------
const skyA = new THREE.Color(0x0b1526);  // 夜
const skyB = new THREE.Color(0x8aa0bb);  // 晝（陰）
scene.background = skyA.clone();

// ---------------- 地形 ----------------
const terrain = buildTerrain(isMobile);
scene.add(terrain);
const water = terrain.userData.water;

// 地圖要素：海岸線、跑道、市區、道路
scene.add(buildFeatures(COASTLINES));
const groundY = (x,z)=> Math.max(landHeight(x,z), 0.02);
const worldPos = (x,z,lift=0.06)=> new THREE.Vector3(x, groundY(x,z)+lift, z);

// ---------------- 地名標籤 ----------------
const placeLabels = [];
for(const p of PLACES){
  const div = document.createElement('div');
  div.className = 'place-label' + (p.major?' major':'');
  div.innerHTML = `${p.name}<span class="sub">${p.sub}</span>`;
  const obj = new CSS2DObject(div);
  obj.position.copy(worldPos(p.x, p.z, p.major?1.4:0.8));
  scene.add(obj);
  placeLabels.push(obj);
}

// 海岸炮台標籤
for(const b of BATTERIES){
  const div = document.createElement('div');
  div.className = 'place-label battery';
  div.innerHTML = `⌖ ${b.name}<span class="sub">${b.sub}</span>`;
  const obj = new CSS2DObject(div);
  obj.position.copy(worldPos(b.x, b.z, 1.0));
  scene.add(obj); placeLabels.push(obj);
}

// 比例尺（10 公里）
(function addScaleBar(){
  const g = new THREE.Group();
  const x0=-10, z0=12.5, len=10;
  g.add(new THREE.Mesh(new THREE.BoxGeometry(len,0.05,0.16),
    new THREE.MeshBasicMaterial({color:0xffffff})).translateX(x0+len/2).translateY(0.12).translateZ(z0));
  for(let i=0;i<len;i+=2){
    const seg=new THREE.Mesh(new THREE.BoxGeometry(1,0.06,0.18),
      new THREE.MeshBasicMaterial({color:0x111111}));
    seg.position.set(x0+i+0.5,0.13,z0); g.add(seg);
  }
  [['0',0],['5',5],['10 km',10]].forEach(([t,d])=>{
    const div=document.createElement('div'); div.className='place-label'; div.textContent=t;
    const o=new CSS2DObject(div); o.position.set(x0+d,0.5,z0+0.7); g.add(o);
  });
  scene.add(g);
})();

// 防線疊圖（與時間軸連動）
const defense = buildDefenseLines();
scene.add(defense);
const jurLine = defense.userData.jurong, perLine = defense.userData.perimeter;
jurLine.visible = perLine.visible = false;
function overlayLabel(text, x, z){
  const div = document.createElement('div');
  div.className = 'place-label line-label';
  div.textContent = text;
  const o = new CSS2DObject(div); o.position.copy(worldPos(x, z, 1.4));
  o.visible = false; scene.add(o); return o;
}
const jurLabel = overlayLabel('Jurong–Kranji Line', -8.5, -3.5);
const perLabel = overlayLabel('Final Perimeter · City', 8.2, 3.0);

// ---------------- 特效 ----------------
const fireFX = new FireFX(scene);
const weatherFX = new WeatherFX(scene, isMobile ? 2500 : 7000);

// ---------------- 軍勢單位（含家紋軍旗）----------------
const POLE_H = 3.7;
function makeArrow(color){
  const mat = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.9, depthWrite:false });
  const grp = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,1,8), mat);
  const head  = new THREE.Mesh(new THREE.ConeGeometry(0.42,1.0,12), mat);
  grp.add(shaft, head); grp.visible = false; scene.add(grp);
  const up = new THREE.Vector3(0,1,0);
  return { grp, update(from, to){
    const dir = to.clone().sub(from); const d = dir.length();
    if(d < 0.8){ grp.visible=false; return; }
    grp.visible = true; dir.normalize();
    grp.position.copy(from); grp.position.y += 0.2;
    grp.quaternion.setFromUnitVectors(up, dir);
    const len = Math.max(0.2, d-1.0);
    shaft.scale.y = len; shaft.position.y = len/2;
    head.position.y = len + 0.5;
  }};
}

const units = [];
for(const u of UNITS){
  const army = u.army==='JP' ? JP : UK;
  const grp = new THREE.Group();

  // 地面圓盤 + 外環
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 32),
    new THREE.MeshBasicMaterial({ color:army, transparent:true, opacity:0.55, depthWrite:false }));
  disc.rotation.x = -Math.PI/2; disc.position.y = 0.05; grp.add(disc);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.32, 32),
    new THREE.MeshBasicMaterial({ color:army, transparent:true, opacity:0.9, side:THREE.DoubleSide, depthWrite:false }));
  ring.rotation.x = -Math.PI/2; ring.position.y = 0.06; grp.add(ring);

  // 光柱
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05,0.05,2.6,8),
    new THREE.MeshBasicMaterial({ color:army, transparent:true, opacity:0.22,
      blending:THREE.AdditiveBlending, depthWrite:false }));
  beam.position.y = 1.3; grp.add(beam);

  // 旗桿
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06,0.06,POLE_H,8),
    new THREE.MeshStandardMaterial({ color:0x4a3b2a, roughness:0.8 }));
  pole.position.y = POLE_H/2; grp.add(pole);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12,10,10),
    new THREE.MeshStandardMaterial({ color:0xe8c270, metalness:0.6, roughness:0.3 }));
  finial.position.y = POLE_H; grp.add(finial);

  // 軍旗（家紋）— 可飄揚
  const fw = 2.3, fh = 1.45;
  const flagGeo = new THREE.PlaneGeometry(fw, fh, 14, 8);
  const flagMat = new THREE.MeshStandardMaterial({
    map: makeFlagTexture(u.emblem, u.army==='JP'?'#e23b32':'#3b78d8'),
    side: THREE.DoubleSide, roughness:0.85, metalness:0.0 });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(fw/2 + 0.06, POLE_H - 0.85, 0);
  grp.add(flag);
  const flagBase = flagGeo.attributes.position.array.slice();

  // 標籤
  const ldiv = document.createElement('div');
  ldiv.className = 'unit-label ' + (u.army==='JP'?'red':'blue');
  ldiv.innerHTML = `<div class="nm">${u.name}</div><div class="cmd">${u.cmd}</div><div class="str">⚔ ${u.strength}</div>`;
  const label = new CSS2DObject(ldiv);
  label.position.set(0, POLE_H + 1.5, 0);
  grp.add(label);

  scene.add(grp);
  units.push({ data:u, grp, flag, flagGeo, flagBase, fw, label,
               arrow: makeArrow(army), curPos:new THREE.Vector3() });
}

// ---------------- 時間軸狀態 ----------------
const LAST = PHASES.length - 1;
let phaseTime = 0;
let playing = false;
let speed = 1;
let displayPhase = -1;
let fireTimer = 0, cannonTimer = 0;
let cinema = true, fireOn = true, weatherOn = true, labelsOn = true;

const ease = t => t*t*(3-2*t);
const clamp = (v,a,b)=> Math.max(a,Math.min(b,v));

function unitPosAt(u, pt){
  const i = clamp(Math.floor(pt),0,LAST), j = Math.min(i+1,LAST);
  const f = ease(clamp(pt-i,0,1));
  const a = u.pos[i], b = u.pos[j];
  return [ a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f ];
}

// ---------------- 事件標籤 ----------------
let eventObjs = [];
function setEventMarkers(i){
  eventObjs.forEach(o=>scene.remove(o)); eventObjs = [];
  for(const ev of PHASES[i].events){
    const d = document.createElement('div');
    d.className = 'event-label'; d.textContent = ev.text;
    const o = new CSS2DObject(d);
    o.position.copy(worldPos(ev.x, ev.z, 2.2));
    scene.add(o); eventObjs.push(o);
    if(ev.type==='fire') fireFX.explode(worldPos(ev.x,ev.z,0.2), 1.6);
  }
}

// ---------------- 面板 ----------------
const $ = id => document.getElementById(id);
function updatePanel(i){
  const p = PHASES[i];
  $('hud-date').textContent = p.date;
  $('ip-phase').textContent = p.phase;
  $('ip-title').textContent = p.title;
  $('ip-desc').textContent = p.desc;
  $('ip-events').innerHTML = p.events.map(e=>
    `<div class="ev-item ${e.type}">${e.text}</div>`).join('');
  const jpMax=36000, ukMax=85000;
  $('jp-num').textContent = p.jp.toLocaleString();
  $('uk-num').textContent = p.uk.toLocaleString();
  $('jp-bar').style.width = (p.jp/jpMax*100)+'%';
  $('uk-bar').style.width = (p.uk/ukMax*100)+'%';
  // 時間軸刻度
  [...document.querySelectorAll('#tl-marks span')].forEach((s,k)=>
    s.classList.toggle('cur', k===i));
}

// 時間軸刻度建立
const marks = $('tl-marks');
PHASES.forEach((p,i)=>{
  const s = document.createElement('span');
  s.textContent = p.date.split('·').pop().trim().replace('2 月 ','2/').replace(' 日','');
  s.textContent = ['2/8','2/9','2/10','2/11','2/13','2/14','2/15'][i];
  s.onclick = ()=> jumpTo(i);
  marks.appendChild(s);
});

// ---------------- 鏡頭預設 ----------------
const CAMS = {
  overview:{ pos:new THREE.Vector3(0,72,48),   tgt:new THREE.Vector3(-1,0,-2) },
  landing: { pos:new THREE.Vector3(-34,17,-2), tgt:new THREE.Vector3(-13,1,-10) },
  bukit:   { pos:new THREE.Vector3(-2,12,17),  tgt:new THREE.Vector3(-2.5,2.5,-3) },
  city:    { pos:new THREE.Vector3(14,15,27),  tgt:new THREE.Vector3(3.5,0,7) },
};
let camTween = null;
function setCam(name){
  document.querySelectorAll('.cam-btn').forEach(b=>b.classList.toggle('active', b.dataset.cam===name));
  if(name==='free'){ camTween=null; controls.autoRotate=false; return; }
  const c = CAMS[name];
  camTween = { pos:c.pos.clone(), tgt:c.tgt.clone(), k:0 };
  controls.autoRotate = false;
}
document.querySelectorAll('.cam-btn').forEach(b=> b.onclick=()=>setCam(b.dataset.cam));
controls.addEventListener('start', ()=>{ camTween=null;
  document.querySelectorAll('.cam-btn').forEach(x=>x.classList.remove('active')); });

// ---------------- 播放控制 ----------------
function setPlaying(v){ playing=v; $('btn-play').textContent = v?'⏸':'▶'; }
function jumpTo(i){ phaseTime = i; $('scrub').value = i; }
$('btn-play').onclick = ()=> setPlaying(!playing);
$('btn-prev').onclick = ()=> jumpTo(clamp(Math.round(phaseTime)-1,0,LAST));
$('btn-next').onclick = ()=> jumpTo(clamp(Math.round(phaseTime)+1,0,LAST));
$('scrub').oninput = e=>{ phaseTime = parseFloat(e.target.value); };
$('speed').oninput = e=>{ speed = parseFloat(e.target.value); };

function toggle(btn, set){
  const el = $(btn); el.onclick = ()=>{ const on = !el.classList.contains('on');
    el.classList.toggle('on', on); set(on); };
}
toggle('tog-weather', v=>{ weatherOn=v; weatherFX.setEnabled(v); });
toggle('tog-fire',    v=>{ fireOn=v; fireFX.enabled=v; });
toggle('tog-cinema',  v=>{ cinema=v; });
toggle('tog-labels',  v=>{ labelsOn=v; placeLabels.forEach(o=>o.visible=v); });
toggle('tog-legend',  v=>{ $('legend').classList.toggle('hidden', !v); });

// ---------------- 開場 ----------------
$('start-btn').onclick = ()=>{
  $('intro').classList.add('gone');
  ['topbar','info-panel','cam-panel','timeline','compass','legend'].forEach(id=> $(id).classList.remove('hidden'));
  if(isMobile){ // 行動裝置：預設收合資訊面板、關閉圖例以省空間
    $('info-panel').classList.add('collapsed');
    $('legend').classList.add('hidden');
    $('tog-legend').classList.remove('on');
  }
  setCam('overview');
  setPlaying(true);
};
$('ip-toggle').onclick = ()=> $('info-panel').classList.toggle('collapsed');

// ---------------- 主迴圈 ----------------
const clock = new THREE.Clock();
function frontLineCenter(){
  // 取交火單位的平均位置作為運鏡焦點
  const c = new THREE.Vector3(); let n=0;
  const fl = PHASES[clamp(Math.round(phaseTime),0,LAST)].fireLines;
  for(const [a,b] of fl){
    const ua=units.find(x=>x.data.id===a), ub=units.find(x=>x.data.id===b);
    if(ua){ c.add(ua.curPos); n++; } if(ub){ c.add(ub.curPos); n++; }
  }
  if(n===0) return new THREE.Vector3(-1,0,-2);
  return c.multiplyScalar(1/n);
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // 推進時間軸
  if(playing){
    phaseTime += dt * 0.16 * speed;
    if(phaseTime >= LAST){ phaseTime = LAST; setPlaying(false); }
    $('scrub').value = phaseTime;
  }

  // 切幕事件
  const di = clamp(Math.round(phaseTime),0,LAST);
  if(di !== displayPhase){ displayPhase = di; updatePanel(di); setEventMarkers(di); }

  // 防線疊圖：裕廊線(第2–3幕)、最後防線(第5幕起)
  const showJur = phaseTime>0.5 && phaseTime<2.7;
  const showPer = phaseTime>=3.4;
  jurLine.visible = showJur; jurLabel.visible = showJur && labelsOn;
  perLine.visible = showPer; perLabel.visible = showPer && labelsOn;

  // 天空 / 日照（依時間軸由夜入晝）
  const dayK = clamp(phaseTime/LAST, 0, 1);
  const wK = weatherOn ? 0.45 : 1.0;
  const sky = skyA.clone().lerp(skyB, dayK*0.85);
  sky.multiplyScalar(wK);
  scene.background.copy(sky);
  scene.fog.color.copy(sky);
  lights.dir.intensity = (0.5 + dayK*0.7) * wK;

  // 更新單位位置 / 軍旗飄揚 / 移動箭頭
  for(const U of units){
    const u = U.data;
    const visible = phaseTime >= u.appear - 0.5;
    U.grp.visible = visible; U.label.visible = visible && labelsOn;
    if(!visible){ U.arrow.grp.visible=false; continue; }
    const [x,z] = unitPosAt(u, phaseTime);
    const wp = worldPos(x, z, 0);
    U.grp.position.copy(wp);
    U.curPos.copy(wp);
    // 移動箭頭：由本幕起點指向現位置
    const i = clamp(Math.floor(phaseTime),0,LAST);
    const fp = worldPos(u.pos[i][0], u.pos[i][1], 0);
    U.arrow.update(fp, wp);
    // 軍旗飄揚
    const p = U.flagGeo.attributes.position, base = U.flagBase;
    for(let k=0;k<p.count;k++){
      const bx=base[k*3], by=base[k*3+1];
      const xn=(bx + U.fw/2)/U.fw;       // 0(旗桿) → 1(旗端)
      const wave = Math.sin(bx*2.2 - t*6 + by) * 0.22 * xn;
      p.setZ(k, wave);
      p.setY(k, by + Math.sin(bx*1.5 - t*5)*0.05*xn);
    }
    p.needsUpdate = true;
  }

  // 槍炮特效
  if(fireOn && playing){
    fireTimer -= dt; cannonTimer -= dt;
    const fl = PHASES[di].fireLines;
    if(fireTimer<=0 && fl.length){
      fireTimer = 0.09 + Math.random()*0.07;
      const [a,b] = fl[(Math.random()*fl.length)|0];
      const ua=units.find(x=>x.data.id===a), ub=units.find(x=>x.data.id===b);
      if(ua?.grp.visible && ub?.grp.visible){
        // 雙向對射
        fireFX.fireBetween(ua.curPos, ub.curPos);
        if(Math.random()<0.5) fireFX.fireBetween(ub.curPos, ua.curPos);
      }
    }
    if(cannonTimer<=0 && fl.length){
      cannonTimer = 1.4 + Math.random()*1.8;
      const [a,b] = fl[(Math.random()*fl.length)|0];
      const ua=units.find(x=>x.data.id===a), ub=units.find(x=>x.data.id===b);
      if(ua?.grp.visible && ub?.grp.visible){
        const from = (ua.data.army==='JP'?ua:ub).curPos;
        const to   = (ua.data.army==='JP'?ub:ua).curPos.clone()
                       .add(new THREE.Vector3((Math.random()-0.5)*2,0,(Math.random()-0.5)*2));
        fireFX.cannon(from, to);
      }
    }
  }
  fireFX.update(dt);

  // 天氣
  weatherFX.update(dt, controls.target, lights);

  // 海浪
  animateWater(water, t);

  // 電影運鏡
  controls.autoRotate = cinema && playing && !camTween;
  controls.autoRotateSpeed = 0.35;
  if(cinema && playing && !camTween){
    controls.target.lerp(frontLineCenter().setY(0.5), 0.012);
  }
  // 鏡頭過場
  if(camTween){
    camTween.k = Math.min(1, camTween.k + dt*1.6);
    const e = ease(camTween.k);
    camera.position.lerp(camTween.pos, 0.08);
    controls.target.lerp(camTween.tgt, 0.08);
    if(camTween.k>=1 && camera.position.distanceTo(camTween.pos)<0.6) camTween=null;
  }

  controls.update();
  // 指南針：依鏡頭方位旋轉
  if(compassRing) compassRing.style.transform = `rotate(${-controls.getAzimuthalAngle()}rad)`;
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

// 初始顯示第一幕
updatePanel(0); setEventMarkers(0); displayPhase = 0;
units.forEach(U=>{ const [x,z]=unitPosAt(U.data,0); U.curPos.copy(worldPos(x,z,0)); });
$('loading').classList.add('gone');
animate();

// ---------------- 視窗縮放 ----------------
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});
