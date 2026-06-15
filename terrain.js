// ============================================================
//  戰場地形 — 新加坡島（依實際海岸線描繪）、柔佛海峽、長堤、
//  內陸水庫、外島與丘陵
//  座標：x 向東(+E)、z 向南(+S)，單位 ≈ 公里。
// ============================================================
import * as THREE from 'three';

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const smooth = (a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const gauss = (x,z,cx,cz,amp,sig)=>amp*Math.exp(-(((x-cx)**2)+((z-cz)**2))/(2*sig*sig));

// ---------- 海岸線多邊形（描繪新加坡本島輪廓）----------
const SINGAPORE = [
  [-20.0, 1.0],[-19.0,-2.0],[-17.2,-5.0],[-16.5,-8.0],[-15.0,-10.0],
  [-12.0,-11.0],[-9.0,-11.5],[-6.0,-11.6],[-3.0,-12.2],[-0.5,-12.6],
  [1.5,-12.3],[3.5,-11.8],[5.0,-11.5],[6.5,-11.0],[9.0,-10.0],
  [11.0,-9.5],[13.5,-9.0],[16.0,-7.0],[18.0,-5.0],[19.5,-3.0],
  [19.0,-1.0],[17.5,1.0],[15.0,3.0],[13.0,4.5],[10.0,5.5],
  [7.0,6.2],[4.5,7.0],[3.0,7.3],[1.0,7.0],[-1.0,6.3],
  [-3.0,5.6],[-5.5,5.0],[-8.0,4.3],[-11.0,3.5],[-14.0,2.5],
  [-17.0,1.8],[-19.0,1.3],
];
// 柔佛（馬來半島南端，海岸線朝海峽）
const JOHOR = [
  [-28,-14.2],[-22,-14.6],[-16,-15.0],[-11,-14.4],[-6,-14.8],
  [-2,-14.2],[0,-14.0],[2,-14.5],[6,-14.1],[11,-14.7],
  [16,-15.0],[22,-15.4],[28,-15.0],[34,-40],[-34,-40],
];
// 長堤（連接本島與柔佛）
const CAUSEWAY = [[-0.8,-12.5],[0.8,-12.5],[0.8,-14.2],[-0.8,-14.2]];
// 外島
const SENTOSA = [[-0.2,8.0],[1.8,8.1],[3.0,8.6],[1.5,9.0],[-0.3,8.7]];      // 聖淘沙（1942：實叻門島）
const UBIN    = [[12.5,-11.6],[15,-11.8],[16,-11.0],[14,-10.6],[12.6,-10.9]]; // 烏敏島
const TEKONG  = [[17,-10.6],[19.5,-10.9],[20.6,-9.6],[18.5,-9.2],[17,-9.8]];  // 德光島

const LAND_POLYS = [SINGAPORE, JOHOR, CAUSEWAY, SENTOSA, UBIN, TEKONG];

// 供其他模組描繪海岸線
export const COASTLINES = [SINGAPORE, JOHOR, SENTOSA, UBIN, TEKONG];

// 內陸水庫（1942 已存在：中央集水區/麥里芝、實里達）
const RES_CENTRAL = [[-1.5,-2.5],[0,-3.1],[1.6,-2.2],[1.9,-0.8],[0.8,0.3],[-0.9,0.1],[-1.9,-1.2]];
const RES_SELETAR = [[2.0,-7.6],[3.6,-7.8],[4.3,-6.8],[3.4,-6.0],[2.1,-6.4]];
const WATER_POLYS = [RES_CENTRAL, RES_SELETAR];

// ---------- 幾何工具 ----------
function pip(x,z,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i][0],zi=poly[i][1],xj=poly[j][0],zj=poly[j][1];
    if(((zi>z)!==(zj>z)) && (x < (xj-xi)*(z-zi)/(zj-zi)+xi)) inside=!inside;
  }
  return inside;
}
function distSeg(px,pz,ax,az,bx,bz){
  const dx=bx-ax,dz=bz-az, l2=dx*dx+dz*dz;
  let t = l2? ((px-ax)*dx+(pz-az)*dz)/l2 : 0; t=clamp(t,0,1);
  return Math.hypot(px-(ax+t*dx), pz-(az+t*dz));
}
function distPoly(x,z,poly){
  let m=Infinity;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++)
    m=Math.min(m, distSeg(x,z,poly[i][0],poly[i][1],poly[j][0],poly[j][1]));
  return m;
}
function anyPip(x,z,polys){ for(const p of polys) if(pip(x,z,p)) return true; return false; }
function minDist(x,z,polys){ let m=Infinity; for(const p of polys) m=Math.min(m,distPoly(x,z,p)); return m; }

// ---------- 高程 ----------
function elevation(x,z){
  const inside = anyPip(x,z,LAND_POLYS);
  const d = minDist(x,z,LAND_POLYS);
  const sd = inside ? d : -d;             // 帶符號海岸距離（內陸為正）

  let h;
  if(sd < 0){
    // 海床：近岸淺、遠岸深
    h = -0.05 - smooth(0,-3.0,sd)*1.7;
  } else {
    // 陸地：海灘 → 內陸緩升（較窄的海灘帶 → 海岸更銳利）
    h = 0.06 + smooth(0,0.22,sd)*0.16 + Math.max(0,sd-0.22)*0.05;
    const land = smooth(0,0.6,sd);        // 海岸淡入丘陵
    h += gauss(x,z,-2.5,-3.0, 3.3, 2.2)*land;   // 武吉知馬高地 163m
    h += gauss(x,z,-4.6,-6.0, 1.7, 1.6)*land;   // 武吉班讓
    h += gauss(x,z,-6.5,-5.0, 1.2, 1.5)*land;   // 武吉甘柏
    h += gauss(x,z, 0.5,-6.0, 1.1, 3.0)*land;   // 中央集水區山脊
    h += gauss(x,z,-5.5, 4.2, 1.3, 1.3)*land;   // 巴西班讓嶺（鴉片山）
    h += gauss(x,z,-1.0, 6.3, 1.0, 1.0)*land;   // 花柏山 Mount Faber
    h += gauss(x,z,17.0,-3.0, 0.8, 1.6)*land;   // 樟宜高地
  }

  let reservoir=false;
  if(inside && anyPip(x,z,WATER_POLYS)){ reservoir=true; h=0.10; }
  return { h, sd, reservoir };
}
export function landHeight(x,z){ return elevation(x,z).h; }

function terrainColor(h, sd, reservoir){
  const c=new THREE.Color();
  if(reservoir){ return c.setHex(0x2c6f8c); }
  if(sd < 0){                                   // 海床深度漸層
    const t=clamp(-sd/3.0,0,1);
    return c.setHex(0x2f8bb0).lerp(new THREE.Color(0x09233c), t);
  }
  if(h < 0.18)      c.setHex(0xcdbd8e);          // 沙灘
  else if(h < 0.8)  c.setHex(0x4f7a3a);          // 低地
  else if(h < 1.8)  c.setHex(0x3c6630);          // 叢林
  else if(h < 2.8)  c.setHex(0x5d6a3a);          // 高地
  else              c.setHex(0x7c6f54);          // 山頂
  c.offsetHSL(0,0,(Math.random()-0.5)*0.035);
  return c;
}

export function buildTerrain(){
  const group = new THREE.Group();
  const Wd=120, Dp=80, segW=384, segD=256;
  const geo = new THREE.PlaneGeometry(Wd,Dp,segW,segD);
  geo.rotateX(-Math.PI/2);
  const pos = geo.attributes.position;
  const colors=[];
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), z=pos.getZ(i);
    const e=elevation(x,z);
    pos.setY(i,e.h);
    const col=terrainColor(e.h,e.sd,e.reservoir);
    colors.push(col.r,col.g,col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const land=new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors:true, roughness:0.95, metalness:0.0 }));
  land.receiveShadow=true;
  group.add(land);

  // ---- 海洋 ----
  const wGeo=new THREE.PlaneGeometry(240,160,120,80);
  wGeo.rotateX(-Math.PI/2);
  const water=new THREE.Mesh(wGeo, new THREE.MeshStandardMaterial({
    color:0x1b4a6b, transparent:true, opacity:0.80, roughness:0.22, metalness:0.55 }));
  water.position.y=-0.02;
  water.userData.base=wGeo.attributes.position.array.slice();
  group.add(water);
  group.userData.water=water;

  return group;
}

export function animateWater(water,t){
  const p=water.geometry.attributes.position, base=water.userData.base;
  for(let i=0;i<p.count;i++){
    const x=base[i*3], z=base[i*3+2];
    p.setY(i, Math.sin(x*0.3+t*1.4)*0.06 + Math.cos(z*0.4+t*1.1)*0.05);
  }
  p.needsUpdate=true;
}
