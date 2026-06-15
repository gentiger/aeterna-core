// ============================================================
//  地圖要素 — 海岸線、機場跑道、城鎮市區、主要道路
// ============================================================
import * as THREE from 'three';
import { landHeight } from './terrain.js';

const gy = (x,z)=> Math.max(landHeight(x,z), 0.02);
const rad = THREE.MathUtils.degToRad;

// ---------- 海岸線描邊 ----------
export function buildCoastlines(polys){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color:0xeef3f8, roughness:0.55, emissive:0x2a4258, emissiveIntensity:0.25 });
  for(const poly of polys){
    const pts = poly.map(([x,z])=> new THREE.Vector3(x, gy(x,z)+0.07, z));
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    const tube = new THREE.TubeGeometry(curve, poly.length*8, 0.12, 6, true);
    g.add(new THREE.Mesh(tube, mat));
  }
  return g;
}

// ---------- 機場跑道 ----------
const RUNWAYS = [
  { x:-9.0, z:-6.6, a:30,  len:3.2, w:0.34 },   // 登加機場 主跑道
  { x:-9.0, z:-6.6, a:120, len:2.2, w:0.32 },   // 登加機場 副跑道
  { x:3.2,  z:-8.9, a:65,  len:2.4, w:0.32 },   // 實里達機場
  { x:5.3,  z:-10.6,a:100, len:2.0, w:0.30 },   // 三巴旺機場
  { x:7.0,  z:5.7,  a:55,  len:2.6, w:0.32 },   // 加冷機場
];
export function buildRunways(){
  const g = new THREE.Group();
  const asphalt = new THREE.MeshStandardMaterial({ color:0x26282c, roughness:0.95 });
  const paint   = new THREE.MeshStandardMaterial({ color:0xd2d6db, roughness:0.6 });
  for(const r of RUNWAYS){
    const grp = new THREE.Group();
    grp.position.set(r.x, gy(r.x,r.z)+0.04, r.z);
    grp.rotation.y = rad(r.a);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(r.len, r.w), asphalt);
    strip.rotation.x = -Math.PI/2; grp.add(strip);
    // 中線虛線
    const n = Math.max(4, Math.floor(r.len/0.38));
    for(let i=0;i<n;i++){
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.035), paint);
      d.rotation.x = -Math.PI/2;
      d.position.set((i/(n-1)-0.5)*r.len*0.9, 0.012, 0);
      grp.add(d);
    }
    // 兩端門檻
    for(const s of [-1,1]){
      const t = new THREE.Mesh(new THREE.PlaneGeometry(0.12, r.w*0.8), paint);
      t.rotation.x = -Math.PI/2;
      t.position.set(s*r.len*0.46, 0.012, 0);
      grp.add(t);
    }
    g.add(grp);
  }
  return g;
}

// ---------- 城鎮 / 市區建築群 ----------
const URBAN = [
  { x:3.6,  z:6.6,  rx:2.7, rz:1.7, n:120, hmax:1.5, patch:0x6c655a }, // 新加坡市區
  { x:7.2,  z:5.4,  rx:1.3, rz:1.0, n:30,  hmax:0.8, patch:0x67615a }, // 加冷／芽籠
  { x:-12.0,z:-1.2, rx:1.2, rz:1.2, n:18,  hmax:0.7 },                  // 裕廊村
  { x:-5.5, z:4.4,  rx:1.1, rz:0.8, n:16,  hmax:0.7 },                  // 巴西班讓村
  { x:-0.5, z:-15.8,rx:3.2, rz:1.1, n:55,  hmax:1.0, patch:0x655f56 },  // 柔佛巴魯
];
export function buildUrban(){
  const g = new THREE.Group();
  const palette = [0x9a958c,0xb3ab9c,0x8a8278,0xc2b2a0,0x7d7a74,0xa89c88];
  const col = new THREE.Color(), dummy = new THREE.Object3D();
  for(const c of URBAN){
    // 市區地坪
    if(c.patch){
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(1,40),
        new THREE.MeshStandardMaterial({ color:c.patch, roughness:1.0,
          transparent:true, opacity:0.9 }));
      patch.rotation.x = -Math.PI/2;
      patch.scale.set(c.rx*1.15, c.rz*1.15, 1);
      patch.position.set(c.x, gy(c.x,c.z)+0.03, c.z);
      g.add(patch);
    }
    const inst = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshStandardMaterial({ roughness:0.85 }), c.n);
    let k=0;
    for(let i=0;i<c.n;i++){
      const ang = Math.random()*Math.PI*2, rr = Math.sqrt(Math.random());
      const x = c.x + Math.cos(ang)*rr*c.rx;
      const z = c.z + Math.sin(ang)*rr*c.rz;
      const yg = gy(x,z);
      if(yg < 0.07) continue;                      // 落在水上則跳過
      const w = 0.16+Math.random()*0.26, d = 0.16+Math.random()*0.26;
      const h = 0.22+Math.random()*c.hmax;
      dummy.position.set(x, yg+h/2, z);
      dummy.rotation.y = Math.random()*Math.PI;
      dummy.scale.set(w,h,d); dummy.updateMatrix();
      inst.setMatrixAt(k, dummy.matrix);
      inst.setColorAt(k, col.setHex(palette[(Math.random()*palette.length)|0]));
      k++;
    }
    inst.count = k;
    inst.instanceMatrix.needsUpdate = true;
    if(inst.instanceColor) inst.instanceColor.needsUpdate = true;
    g.add(inst);
  }
  return g;
}

// ---------- 主要道路 ----------
const ROADS = [
  // 武吉知馬路（日軍主攻軸線：市區 → 武吉知馬 → 武吉班讓 → 長堤）
  [[3,6.2],[1.6,4],[-0.4,1],[-1.8,-1.2],[-2.5,-3],[-3.4,-5],[-4.6,-6.4],[-4.2,-9],[-1.5,-11.5],[-0.5,-12.6]],
  // 長堤道路
  [[-0.5,-12.6],[0,-14.1]],
  // 東海岸路
  [[4,6.7],[8,5.9],[12,4.3],[15,2.3],[17.3,-1.2]],
  // 裕廊路（西部）
  [[3,6.0],[-2,4],[-7,2.5],[-11,0],[-13,-2]],
];
export function buildRoads(){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0x47433d, roughness:0.95 });
  for(const r of ROADS){
    const pts = r.map(([x,z])=> new THREE.Vector3(x, gy(x,z)+0.05, z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const tube = new THREE.TubeGeometry(curve, r.length*10, 0.09, 5, false);
    g.add(new THREE.Mesh(tube, mat));
  }
  return g;
}

export function buildFeatures(coastlines){
  const g = new THREE.Group();
  g.add(buildRoads());
  g.add(buildRunways());
  g.add(buildUrban());
  g.add(buildCoastlines(coastlines));
  return g;
}
