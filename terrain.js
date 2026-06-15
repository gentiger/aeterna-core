// ============================================================
//  戰場地形 — 新加坡島、柔佛大陸、長堤、丘陵與海峽
// ============================================================
import * as THREE from 'three';

const gauss = (x,z,cx,cz,amp,sig)=>
  amp*Math.exp(-(((x-cx)**2)+((z-cz)**2))/(2*sig*sig));

// 陸地形狀（>0 為陸地）
function islandVal(x,z){
  const ex=(x-0)/21, ez=(z+1)/11.5;
  let v = 1.0-(ex*ex+ez*ez);
  const ang=Math.atan2(z+1,x);
  v += 0.12*Math.sin(ang*4+1.0)+0.06*Math.sin(ang*7+3.0)+0.04*Math.sin(ang*11);
  return v;
}
function johorVal(x,z){
  const ex=(x+6)/30, ez=(z+24)/11;
  let v = 1.0-(ex*ex+ez*ez);
  const ang=Math.atan2(z+24,x+6);
  v += 0.08*Math.sin(ang*5+2.0);
  return v;
}
function causewayVal(x,z){
  if(z>-15.6 && z<-12.8){ return 0.6-Math.abs(x-0)/1.1; }
  return -2;
}

export function landHeight(x,z){
  const L = Math.max(islandVal(x,z), johorVal(x,z), causewayVal(x,z));
  if(L>0){
    let h = 0.28 + Math.min(L,0.6)*0.6;
    h += gauss(x,z,-2.5,-3, 3.4, 3.2);   // 武吉知馬高地
    h += gauss(x,z,-4.5,-6, 1.8, 2.0);   // 武吉班讓
    h += gauss(x,z,-5.5,4,  1.3, 1.6);   // 巴西班讓嶺（鴉片山）
    h += gauss(x,z, 5,-11,  0.9, 1.2);   // 三巴旺
    h += gauss(x,z,-10,-20, 2.2, 6);     // 柔佛內陸隆起
    return h;
  }
  return -1.4 + Math.max(L,-0.6)*0.4;    // 海床
}

function terrainColor(h){
  const c = new THREE.Color();
  if(h < 0.05)        c.setHex(0xd9c79a);          // 沙灘
  else if(h < 0.6)    c.setHex(0x4f7a3a);          // 低地草原
  else if(h < 1.6)    c.setHex(0x3c6630);          // 叢林
  else if(h < 2.8)    c.setHex(0x5a6b3a);          // 高地
  else                c.setHex(0x7a6a4a);          // 山頂裸岩
  c.offsetHSL(0,0,(Math.random()-0.5)*0.04);
  return c;
}

export function buildTerrain(){
  const group = new THREE.Group();
  const Wd=110, Dp=72, segW=240, segD=156;
  const geo = new THREE.PlaneGeometry(Wd,Dp,segW,segD);
  geo.rotateX(-Math.PI/2);
  const pos = geo.attributes.position;
  const colors = [];
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), z=pos.getZ(i);
    let h=landHeight(x,z);
    pos.setY(i,h);
    const col = terrainColor(h);
    colors.push(col.r,col.g,col.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    vertexColors:true, roughness:0.95, metalness:0.0, flatShading:false });
  const land = new THREE.Mesh(geo,mat);
  land.receiveShadow = true;
  group.add(land);

  // ---- 海洋 ----
  const wGeo = new THREE.PlaneGeometry(220,150,120,80);
  wGeo.rotateX(-Math.PI/2);
  const wMat = new THREE.MeshStandardMaterial({
    color:0x1b4a6b, transparent:true, opacity:0.86,
    roughness:0.25, metalness:0.5 });
  const water = new THREE.Mesh(wGeo, wMat);
  water.position.y = -0.02;
  water.userData.base = wGeo.attributes.position.array.slice();
  group.add(water);
  group.userData.water = water;

  return group;
}

// 海浪動畫
export function animateWater(water, t){
  const p = water.geometry.attributes.position;
  const base = water.userData.base;
  for(let i=0;i<p.count;i++){
    const x=base[i*3], z=base[i*3+2];
    p.setY(i, Math.sin(x*0.3+t*1.4)*0.06 + Math.cos(z*0.4+t*1.1)*0.05);
  }
  p.needsUpdate = true;
}
