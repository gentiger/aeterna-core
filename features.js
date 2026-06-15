// ============================================================
//  地圖要素 — 海岸線、機場跑道、城鎮市區、主要道路
// ============================================================
import * as THREE from 'three';
import { landHeight, isForest, nearAirfield } from './terrain.js';

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

// ---------- 河流 ----------
const RIVERS = [
  [[3.2,6.6],[2.6,5.4],[2.2,4.6]],                  // 新加坡河
  [[7.0,5.6],[6.2,3.8],[5.6,2.2],[5.0,0.6]],        // 加冷河
  [[-5.0,-11.2],[-5.2,-9.5],[-4.6,-8.0]],           // 克蘭芝河
  [[-11.0,3.4],[-11.2,1.6],[-10.6,0.0]],            // 裕廊河
  [[3.0,-9.2],[3.2,-7.8],[3.4,-6.6]],               // 實里達河
  [[-13.0,-9.5],[-12.5,-8.0],[-11.5,-7.0]],         // 雙溪布洛
];
export function buildRivers(){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0x2f6f8c, roughness:0.4, metalness:0.2 });
  for(const r of RIVERS){
    const pts = r.map(([x,z])=> new THREE.Vector3(x, gy(x,z)+0.045, z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    const tube = new THREE.TubeGeometry(curve, r.length*10, 0.13, 5, false);
    g.add(new THREE.Mesh(tube, mat));
  }
  return g;
}

// ---------- 叢林樹冠 ----------
export function buildTrees(){
  const spots = [];
  for(let x=-20;x<=20;x+=0.5){
    for(let z=-13;z<=8;z+=0.5){
      const jx=x+(Math.random()-0.5)*0.45, jz=z+(Math.random()-0.5)*0.45;
      const h=landHeight(jx,jz);
      if(h<0.25 || nearAirfield(jx,jz)) continue;
      const forest=isForest(jx,jz);
      if(!(forest || h>0.95)) continue;
      if(!forest && Math.random()<0.45) continue;     // 山坡較疏
      spots.push([jx,h,jz]);
    }
  }
  const N=spots.length;
  const trunks   = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03,0.045,0.26,5),
    new THREE.MeshStandardMaterial({ color:0x5b3f28, roughness:1 }), N);
  const canopies = new THREE.InstancedMesh(new THREE.ConeGeometry(0.17,0.55,6),
    new THREE.MeshStandardMaterial({ roughness:0.9 }), N);
  const d=new THREE.Object3D(), col=new THREE.Color();
  const greens=[0x2f5526,0x356129,0x274a20,0x3d6b2e];
  spots.forEach(([x,h,z],i)=>{
    const s=0.7+Math.random()*0.9;
    d.rotation.y=Math.random()*6.28;
    d.position.set(x,h+0.13*s,z); d.scale.set(s,s,s); d.updateMatrix();
    trunks.setMatrixAt(i,d.matrix);
    d.position.set(x,h+0.48*s,z); d.updateMatrix();
    canopies.setMatrixAt(i,d.matrix);
    canopies.setColorAt(i,col.setHex(greens[(Math.random()*greens.length)|0]));
  });
  trunks.instanceMatrix.needsUpdate=true; canopies.instanceMatrix.needsUpdate=true;
  if(canopies.instanceColor) canopies.instanceColor.needsUpdate=true;
  const g=new THREE.Group(); g.add(trunks,canopies); return g;
}

// ---------- 海岸炮台（朝南——著名的「炮口錯向」）----------
export const BATTERIES = [
  { x:18.0, z:-3.2, name:'樟宜炮台',   sub:'CHANGI · 15in 巨炮' },
  { x:1.5,  z:8.6,  name:'實叻門炮台', sub:'BLAKANG MATI' },
  { x:-2.6, z:6.3,  name:'拉柏多炮台', sub:'LABRADOR / 花柏山' },
  { x:-19.0,z:0.6,  name:'西部炮台',   sub:'TUAS' },
];
export function buildBatteries(){
  const g = new THREE.Group();
  const baseM = new THREE.MeshStandardMaterial({ color:0x3a3a3a, roughness:0.9 });
  const gunM  = new THREE.MeshStandardMaterial({ color:0x20242a, roughness:0.5, metalness:0.5 });
  for(const b of BATTERIES){
    const y=gy(b.x,b.z);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,0.2,6), baseM);
    base.position.set(b.x,y+0.1,b.z); g.add(base);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,1.0,8), gunM);
    barrel.rotation.x=Math.PI/2;            // 朝南（+z）
    barrel.position.set(b.x,y+0.28,b.z+0.4); g.add(barrel);
  }
  return g;
}

export function buildFeatures(coastlines){
  const g = new THREE.Group();
  g.add(buildRoads());
  g.add(buildRivers());
  g.add(buildRunways());
  g.add(buildUrban());
  g.add(buildTrees());
  g.add(buildBatteries());
  g.add(buildCoastlines(coastlines));
  return g;
}
