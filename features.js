// ============================================================
//  地圖要素 — 海岸線、道路/鐵路、河流、跑道、低層市鎮、種植園、
//  叢林樹冠、海岸炮台、北岸碉堡線、等高線
// ============================================================
import * as THREE from 'three';
import { landHeight, isForest, nearAirfield } from './terrain.js';

const gy = (x,z)=> Math.max(landHeight(x,z), 0.02);
const rad = THREE.MathUtils.degToRad;

// ---------- 共用：貼地扁平帶（道路/河流/鐵路）----------
function ribbon(path, width, mat, lift=0.05, seg=12){
  const pts = path.map(([x,z])=> new THREE.Vector3(x,0,z));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
  const N = Math.max(2, (path.length-1)*seg);
  const position=[], index=[];
  const up = new THREE.Vector3(0,1,0), side = new THREE.Vector3(), tan = new THREE.Vector3();
  for(let i=0;i<=N;i++){
    const t=i/N, p=curve.getPoint(t);
    curve.getTangent(t,tan); tan.y=0; tan.normalize();
    side.crossVectors(up,tan).normalize().multiplyScalar(width/2);
    const lx=p.x-side.x, lz=p.z-side.z, rx=p.x+side.x, rz=p.z+side.z;
    position.push(lx, gy(lx,lz)+lift, lz,  rx, gy(rx,rz)+lift, rz);
    if(i<N){ const a=i*2; index.push(a,a+1,a+2, a+1,a+3,a+2); }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(position,3));
  geo.setIndex(index); geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}
function flatMat(color, opts={}){
  return new THREE.MeshStandardMaterial(Object.assign({
    color, roughness:0.95, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2
  }, opts));
}

// ---------- 海岸線描邊 ----------
export function buildCoastlines(polys){
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color:0xeef3f8, roughness:0.55, emissive:0x2a4258, emissiveIntensity:0.25 });
  for(const poly of polys){
    const pts = poly.map(([x,z])=> new THREE.Vector3(x, gy(x,z)+0.07, z));
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    const tube = new THREE.TubeGeometry(curve, poly.length*8, 0.07, 6, true);
    g.add(new THREE.Mesh(tube, mat));
  }
  return g;
}

// ---------- 道路（貼地）----------
const ROADS = [
  [[3,6.2],[1.6,4],[-0.4,1],[-1.8,-1.2],[-2.5,-3],[-3.4,-5],[-4.6,-6.4],[-4.2,-9],[-1.5,-11.5],[-0.5,-12.6]], // Bukit Timah Rd
  [[4,6.7],[8,5.9],[12,4.3],[15,2.3],[17.3,-1.2]],           // East Coast Rd
  [[3,6.0],[-2,4],[-7,2.5],[-11,0],[-13,-2]],                // Jurong Rd
  [[0,-14.2],[-3,-15.6],[-7,-16.4],[-11,-16.8]],             // Johor: to Skudai
  [[0,-14.2],[4,-15.4],[8,-15.9],[12,-16.3]],                // Johor: to Tebrau
];
export function buildRoads(){
  const g=new THREE.Group(), mat=flatMat(0x9b8a6b,{roughness:0.9});
  for(const r of ROADS) g.add(ribbon(r, 0.36, mat, 0.085));
  return g;
}

// ---------- 鐵路（KTM 線：沿武吉知馬西側 → 丹戎巴葛）----------
const RAIL = [[-0.5,-12.5],[-1.8,-9.8],[-3.4,-7.4],[-4.7,-4.8],[-5.1,-2.2],
  [-4.4,0.6],[-2.6,3.0],[-0.9,5.0],[0.6,6.4],[1.6,7.2]];
export function buildRailway(){
  const g=new THREE.Group();
  g.add(ribbon(RAIL, 0.16, flatMat(0x6b6256), 0.055));        // 路基
  // 枕木
  const pts=RAIL.map(([x,z])=>new THREE.Vector3(x,0,z));
  const curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',0.4);
  const tieMat=new THREE.MeshStandardMaterial({color:0x2c2620,roughness:1,
    polygonOffset:true,polygonOffsetFactor:-3});
  const M=120;
  for(let i=0;i<=M;i++){
    const t=i/M, p=curve.getPoint(t), tan=curve.getTangent(t); tan.y=0; tan.normalize();
    const tie=new THREE.Mesh(new THREE.PlaneGeometry(0.34,0.07), tieMat);
    tie.rotation.x=-Math.PI/2; tie.rotation.z=Math.atan2(tan.x,tan.z);
    tie.position.set(p.x, gy(p.x,p.z)+0.06, p.z); g.add(tie);
  }
  return g;
}

// ---------- 河流（貼地）----------
const RIVERS = [
  [[3.2,6.6],[2.6,5.4],[2.2,4.6]], [[7.0,5.6],[6.2,3.8],[5.6,2.2],[5.0,0.6]],
  [[-5.0,-11.2],[-5.2,-9.5],[-4.6,-8.0]], [[-11.0,3.4],[-11.2,1.6],[-10.6,0.0]],
  [[3.0,-9.2],[3.2,-7.8],[3.4,-6.6]], [[-13.0,-9.5],[-12.5,-8.0],[-11.5,-7.0]],
];
export function buildRivers(){
  const g=new THREE.Group(), mat=flatMat(0x2f6f8c,{roughness:0.4,metalness:0.2});
  for(const r of RIVERS) g.add(ribbon(r, 0.3, mat, 0.045));
  return g;
}

// ---------- 機場跑道 ----------
const RUNWAYS = [
  { x:-9.0, z:-6.6, a:30,  len:3.2, w:0.34 },{ x:-9.0, z:-6.6, a:120, len:2.2, w:0.32 },
  { x:3.2,  z:-8.9, a:65,  len:2.4, w:0.32 },{ x:5.3,  z:-10.6,a:100, len:2.0, w:0.30 },
  { x:7.0,  z:5.7,  a:55,  len:2.6, w:0.32 },
];
export function buildRunways(){
  const g=new THREE.Group();
  const asphalt=new THREE.MeshStandardMaterial({color:0x26282c,roughness:0.95});
  const paint=new THREE.MeshStandardMaterial({color:0xd2d6db,roughness:0.6});
  for(const r of RUNWAYS){
    const grp=new THREE.Group();
    grp.position.set(r.x, gy(r.x,r.z)+0.04, r.z); grp.rotation.y=rad(r.a);
    const strip=new THREE.Mesh(new THREE.PlaneGeometry(r.len,r.w),asphalt);
    strip.rotation.x=-Math.PI/2; grp.add(strip);
    const n=Math.max(4,Math.floor(r.len/0.38));
    for(let i=0;i<n;i++){
      const d=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.035),paint);
      d.rotation.x=-Math.PI/2; d.position.set((i/(n-1)-0.5)*r.len*0.9,0.012,0); grp.add(d);
    }
    g.add(grp);
  }
  return g;
}

// ---------- 低層市鎮（1942：店屋、低矮殖民建築，無高樓）----------
const TOWNS = [
  { x:3.6, z:6.7, rx:2.6, rz:1.7, patch:0x6c655a, civic:true }, // 新加坡市區
  { x:7.0, z:5.4, rx:1.2, rz:0.9, patch:0x67615a },             // 加冷／芽籠
  { x:-12.0,z:-1.2,rx:1.0, rz:1.0 },                             // 裕廊村
  { x:-5.5,z:4.4, rx:1.0, rz:0.7 },                              // 巴西班讓村
  { x:-0.5,z:-15.8,rx:3.0,rz:1.1, patch:0x655f56 },              // 柔佛巴魯
];
export function buildTowns(){
  const g=new THREE.Group();
  const walls=[0xe7ddc8,0xd9c3a0,0xc9a489,0xcf8a6c,0xbfae93,0xd6c7ab];
  const placements=[]; const civic=[];
  for(const t of TOWNS){
    if(t.patch){
      const patch=new THREE.Mesh(new THREE.CircleGeometry(1,40),
        new THREE.MeshStandardMaterial({color:t.patch,roughness:1,transparent:true,opacity:0.9}));
      patch.rotation.x=-Math.PI/2; patch.scale.set(t.rx*1.15,t.rz*1.15,1);
      patch.position.set(t.x,gy(t.x,t.z)+0.03,t.z); g.add(patch);
    }
    // 規則網格排列的店屋
    const step=0.26;
    for(let ix=-t.rx; ix<=t.rx; ix+=step){
      for(let iz=-t.rz; iz<=t.rz; iz+=step){
        if((ix/t.rx)**2+(iz/t.rz)**2 > 1) continue;
        const x=t.x+ix+(Math.random()-0.5)*0.08, z=t.z+iz+(Math.random()-0.5)*0.08;
        const yg=gy(x,z); if(yg<0.07) continue;
        if(Math.random()<0.25) continue;                 // 街巷留白
        placements.push([x,yg,z]);
      }
    }
    if(t.civic){ // 幾棟殖民地標（仍屬低矮）
      for(let i=0;i<6;i++) civic.push([t.x+(Math.random()-0.5)*3, gy(t.x,t.z), t.z+(Math.random()-0.5)*1.6]);
    }
  }
  // 店屋（2–3 層，低矮）+ 紅瓦屋頂
  const N=placements.length;
  const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),
    new THREE.MeshStandardMaterial({roughness:0.9}), N);
  const roofs=new THREE.InstancedMesh(new THREE.ConeGeometry(0.7,1,4),
    new THREE.MeshStandardMaterial({roughness:0.85}), N);
  const d=new THREE.Object3D(), col=new THREE.Color();
  const tiles=[0xb5582f,0xc56a3a,0x9e4a2a,0xa85636];
  placements.forEach(([x,yg,z],i)=>{
    const w=0.16+Math.random()*0.08, dep=0.16+Math.random()*0.08;
    const h=0.10+Math.random()*0.10;                    // 低層
    const rot=(Math.random()<0.5?0:Math.PI/2)+(Math.random()-0.5)*0.2;
    d.position.set(x,yg+h/2,z); d.rotation.y=rot; d.scale.set(w,h,dep);
    d.updateMatrix(); inst.setMatrixAt(i,d.matrix);
    inst.setColorAt(i,col.setHex(walls[(Math.random()*walls.length)|0]));
    d.position.set(x,yg+h+0.035,z); d.rotation.y=rot+Math.PI/4; d.scale.set(w*1.02,0.07,dep*1.02);
    d.updateMatrix(); roofs.setMatrixAt(i,d.matrix);
    roofs.setColorAt(i,col.setHex(tiles[(Math.random()*tiles.length)|0]));
  });
  inst.instanceMatrix.needsUpdate=true; if(inst.instanceColor) inst.instanceColor.needsUpdate=true;
  roofs.instanceMatrix.needsUpdate=true; if(roofs.instanceColor) roofs.instanceColor.needsUpdate=true;
  g.add(inst, roofs);
  // 殖民地標（略高、白色）
  if(civic.length){
    const ci=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),
      new THREE.MeshStandardMaterial({color:0xeae6da,roughness:0.8}), civic.length);
    civic.forEach(([x,yg,z],i)=>{
      const h=0.26+Math.random()*0.12;
      d.position.set(x,yg+h/2,z); d.rotation.y=Math.random()*Math.PI;
      d.scale.set(0.3,h,0.3); d.updateMatrix(); ci.setMatrixAt(i,d.matrix);
    });
    ci.instanceMatrix.needsUpdate=true; g.add(ci);
  }
  return g;
}

// ---------- 橡膠種植園（成排）----------
const PLANTATIONS = [
  { x:-14,z:-2.5, rx:2.6, rz:2.6 }, { x:-7,z:-8, rx:2.2, rz:1.4 },
  { x:10,z:-1, rx:3.0, rz:2.4 },    { x:13,z:2, rx:2.0, rz:1.6 },
];
export function buildPlantations(){
  const spots=[];
  for(const p of PLANTATIONS){
    for(let ix=-p.rx; ix<=p.rx; ix+=0.42){        // 行距
      for(let iz=-p.rz; iz<=p.rz; iz+=0.32){      // 株距
        if((ix/p.rx)**2+(iz/p.rz)**2 > 1) continue;
        const x=p.x+ix+(Math.random()-0.5)*0.05, z=p.z+iz+(Math.random()-0.5)*0.05;
        const h=landHeight(x,z);
        if(h<0.2 || h>0.9 || nearAirfield(x,z) || isForest(x,z)) continue;
        spots.push([x,h,z]);
      }
    }
  }
  const N=spots.length;
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02,0.03,0.2,4),
    new THREE.MeshStandardMaterial({color:0x6b5236,roughness:1}), N);
  const canopy=new THREE.InstancedMesh(new THREE.SphereGeometry(0.12,6,5),
    new THREE.MeshStandardMaterial({color:0x4f7e3a,roughness:0.9}), N);
  const d=new THREE.Object3D();
  spots.forEach(([x,h,z],i)=>{
    d.position.set(x,h+0.1,z); d.scale.setScalar(0.8+Math.random()*0.3); d.updateMatrix();
    trunks.setMatrixAt(i,d.matrix);
    d.position.set(x,h+0.26,z); d.updateMatrix(); canopy.setMatrixAt(i,d.matrix);
  });
  trunks.instanceMatrix.needsUpdate=true; canopy.instanceMatrix.needsUpdate=true;
  const g=new THREE.Group(); g.add(trunks,canopy); return g;
}

// ---------- 叢林樹冠 ----------
export function buildTrees(){
  const spots=[];
  for(let x=-20;x<=20;x+=0.5) for(let z=-13;z<=8;z+=0.5){
    const jx=x+(Math.random()-0.5)*0.45, jz=z+(Math.random()-0.5)*0.45;
    const h=landHeight(jx,jz);
    if(h<0.25 || nearAirfield(jx,jz)) continue;
    const forest=isForest(jx,jz);
    if(!(forest || h>0.95)) continue;
    if(!forest && Math.random()<0.45) continue;
    spots.push([jx,h,jz]);
  }
  // Johor mainland — jungle & plantation cover
  for(let x=-26;x<=32;x+=0.7) for(let z=-21;z<=-14.3;z+=0.7){
    const jx=x+(Math.random()-0.5)*0.6, jz=z+(Math.random()-0.5)*0.6;
    const h=landHeight(jx,jz);
    if(h<0.22) continue;
    if(!isForest(jx,jz) && Math.random()<0.55) continue;
    spots.push([jx,h,jz]);
  }
  const N=spots.length;
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03,0.045,0.26,5),
    new THREE.MeshStandardMaterial({color:0x5b3f28,roughness:1}), N);
  const canopies=new THREE.InstancedMesh(new THREE.ConeGeometry(0.17,0.55,6),
    new THREE.MeshStandardMaterial({roughness:0.9}), N);
  const d=new THREE.Object3D(), col=new THREE.Color();
  const greens=[0x2f5526,0x356129,0x274a20,0x3d6b2e];
  spots.forEach(([x,h,z],i)=>{
    const s=0.7+Math.random()*0.9; d.rotation.y=Math.random()*6.28;
    d.position.set(x,h+0.13*s,z); d.scale.set(s,s,s); d.updateMatrix(); trunks.setMatrixAt(i,d.matrix);
    d.position.set(x,h+0.48*s,z); d.updateMatrix(); canopies.setMatrixAt(i,d.matrix);
    canopies.setColorAt(i,col.setHex(greens[(Math.random()*greens.length)|0]));
  });
  trunks.instanceMatrix.needsUpdate=true; canopies.instanceMatrix.needsUpdate=true;
  if(canopies.instanceColor) canopies.instanceColor.needsUpdate=true;
  const g=new THREE.Group(); g.add(trunks,canopies); return g;
}

// ---------- 海岸炮台（朝南）----------
export const BATTERIES = [
  { x:18.0, z:-3.2, name:'Changi Battery',   sub:'15-inch guns' },
  { x:1.5,  z:8.6,  name:'Blakang Mati Bty.', sub:'Sentosa' },
  { x:-2.6, z:6.3,  name:'Labrador Battery',  sub:'Mount Faber' },
  { x:-19.0,z:0.6,  name:'Tuas Battery',      sub:'West' },
];
export function buildBatteries(){
  const g=new THREE.Group();
  const baseM=new THREE.MeshStandardMaterial({color:0x3a3a3a,roughness:0.9});
  const gunM=new THREE.MeshStandardMaterial({color:0x20242a,roughness:0.5,metalness:0.5});
  for(const b of BATTERIES){
    const y=gy(b.x,b.z);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.55,0.2,6),baseM);
    base.position.set(b.x,y+0.1,b.z); g.add(base);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,1.0,8),gunM);
    barrel.rotation.x=Math.PI/2; barrel.position.set(b.x,y+0.28,b.z+0.4); g.add(barrel);
  }
  return g;
}

// ---------- 北岸碉堡線 ----------
const PILLBOXES = [[-14,-9.5],[-11,-10.3],[-8,-10.7],[-5,-10.8],[-2,-11.4],[1,-11.4],
  [3,-11],[5,-10.6],[7,-10.2],[9.5,-9.4],[11.5,-8.9],[14,-8.4]];
export function buildPillboxes(){
  const g=new THREE.Group();
  const m=new THREE.MeshStandardMaterial({color:0x8a8478,roughness:0.95});
  for(const [x,z] of PILLBOXES){
    const yg=gy(x,z); if(yg<0.06) continue;
    const box=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.18,0.16,6),m);
    box.position.set(x,yg+0.08,z); box.rotation.y=Math.random(); g.add(box);
  }
  return g;
}

// ---------- 等高線（武吉知馬，貼合實際山坡，避開水庫）----------
export function buildContours(){
  const g=new THREE.Group();
  const cx=-2.5, cz=-3.0;
  const mat=new THREE.LineBasicMaterial({color:0xe8c270,transparent:true,opacity:0.55});
  const STEPS=140;
  for(const lvl of [0.8,1.3,1.8,2.3,2.8]){
    // 沿各方位向外行進，找到高度降到該等高線的半徑（貼合真實地形）
    const ring=[];
    for(let a=0;a<=STEPS;a++){
      const t=a/STEPS*Math.PI*2, c=Math.cos(t), s=Math.sin(t);
      let found=null;
      for(let r=0.2;r<=5.5;r+=0.12){
        if(landHeight(cx+c*r, cz+s*r) <= lvl){ found=r; break; }
      }
      ring.push(found ? new THREE.Vector3(cx+c*found, lvl+0.03, cz+s*found) : null);
    }
    const pos=[];
    for(let i=0;i<ring.length-1;i++){
      const A=ring[i], B=ring[i+1];
      if(A && B && A.distanceTo(B) < 1.2) pos.push(A.x,A.y,A.z, B.x,B.y,B.z);
    }
    if(pos.length){
      const geo=new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
      g.add(new THREE.LineSegments(geo, mat));
    }
  }
  return g;
}

// ---------- 防線疊圖（與時間軸連動）----------
const JURONG_LINE = [[-5.5,-10.2],[-6.0,-7.5],[-6.8,-5.0],[-8.0,-2.5],[-9.5,-0.5],[-11.0,1.5]];
const PERIMETER   = [[-5.0,4.8],[-3.2,2.5],[-1.5,0.0],[0.5,-1.2],[3.0,-1.0],[5.5,0.2],[7.5,2.0],[8.8,4.0],[8.4,5.6]];
export function buildDefenseLines(){
  const lineMat = ()=> flatMat(0x73a9ff, { transparent:true, opacity:0.8,
    emissive:0x1d4f8c, emissiveIntensity:0.5 });
  const jurong = new THREE.Group();    jurong.add(ribbon(JURONG_LINE, 0.26, lineMat(), 0.11));
  const perimeter = new THREE.Group(); perimeter.add(ribbon(PERIMETER, 0.26, lineMat(), 0.11));
  const g = new THREE.Group(); g.add(jurong, perimeter);
  g.userData = { jurong, perimeter };
  return g;
}

// ---------- The Causeway (raised road+rail embankment over the strait) ----------
export function buildCauseway(){
  const g=new THREE.Group();
  const z0=-12.4, z1=-14.3, len=Math.abs(z1-z0), midz=(z0+z1)/2;
  // stone embankment
  const deck=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.34,len),
    new THREE.MeshStandardMaterial({color:0x8c8378,roughness:0.95}));
  deck.position.set(0,0.12,midz); g.add(deck);
  // road carriageway
  const road=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.05,len),
    new THREE.MeshStandardMaterial({color:0x403c36,roughness:0.95}));
  road.position.set(-0.22,0.30,midz); g.add(road);
  // centreline
  const cl=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.02,len*0.9),
    new THREE.MeshStandardMaterial({color:0xd6cba0}));
  cl.position.set(-0.22,0.33,midz); g.add(cl);
  // railway
  const rail=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.05,len),
    new THREE.MeshStandardMaterial({color:0x6b6256,roughness:0.9}));
  rail.position.set(0.26,0.30,midz); g.add(rail);
  for(const rx of [0.19,0.33]){
    const r=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.03,len),
      new THREE.MeshStandardMaterial({color:0x2a2620,metalness:0.4,roughness:0.5}));
    r.position.set(rx,0.34,midz); g.add(r);
  }
  // parapets
  for(const sx of [-0.52,0.52]){
    const par=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.13,len),
      new THREE.MeshStandardMaterial({color:0xb8b0a2,roughness:0.9}));
    par.position.set(sx,0.34,midz); g.add(par);
  }
  // lamp posts
  const postM=new THREE.MeshStandardMaterial({color:0x3a3632});
  const lampM=new THREE.MeshStandardMaterial({color:0xffe9a8,emissive:0xffcf6a,emissiveIntensity:0.9});
  for(let i=0;i<=6;i++){
    const z=z0+(z1-z0)*(i/6);
    for(const sx of [-0.44,0.44]){
      const post=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.42,6),postM);
      post.position.set(sx,0.50,z); g.add(post);
      const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),lampM);
      lamp.position.set(sx,0.71,z); g.add(lamp);
    }
  }
  return g;
}

export function buildFeatures(coastlines){
  const g=new THREE.Group();
  g.add(buildCauseway());
  g.add(buildRoads());
  g.add(buildRailway());
  g.add(buildRivers());
  g.add(buildRunways());
  g.add(buildPlantations());
  g.add(buildTrees());
  g.add(buildTowns());
  g.add(buildPillboxes());
  g.add(buildBatteries());
  g.add(buildContours());
  g.add(buildCoastlines(coastlines));
  return g;
}
