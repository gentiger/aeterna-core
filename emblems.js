// ============================================================
//  軍旗家紋 / Emblems — 以 Canvas 程序繪製，回傳 CanvasTexture
//  日軍使用家紋風格徽記，英聯邦使用各部隊紋章。
// ============================================================
import * as THREE from 'three';

const W = 256, H = 180;

function base(armyColor){
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  // 旗面（含布料漸層）
  const grad = g.createLinearGradient(0,0,W,H);
  grad.addColorStop(0, armyColor);
  grad.addColorStop(1, shade(armyColor,-0.28));
  g.fillStyle = grad; g.fillRect(0,0,W,H);
  // 旗桿側深色綁帶
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0,0,12,H);
  // 邊框
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3;
  g.strokeRect(4,4,W-8,H-8);
  return { c, g };
}
function shade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r=(n>>16)&255, gg=(n>>8)&255, b=n&255;
  r=Math.max(0,Math.min(255,r+amt*255));
  gg=Math.max(0,Math.min(255,gg+amt*255));
  b=Math.max(0,Math.min(255,b+amt*255));
  return `rgb(${r|0},${gg|0},${b|0})`;
}
function disc(g, cx, cy, r, fill='#fff'){
  g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.fillStyle=fill; g.fill();
  g.lineWidth=2.5; g.strokeStyle='rgba(0,0,0,.25)'; g.stroke();
}

// ---- 各家紋繪製（畫在白底圓盤上，墨色徽記）----
function chrysanthemum(g,cx,cy,r,ink){ // 菊紋（近衛師團・皇室）
  g.fillStyle=ink; g.strokeStyle=ink; g.lineWidth=2;
  for(let layer=0; layer<2; layer++){
    const rr = r*(layer? .7:1), petals=16, off=layer? Math.PI/16:0;
    for(let i=0;i<petals;i++){
      const a=off+i/petals*Math.PI*2;
      g.save(); g.translate(cx,cy); g.rotate(a);
      g.beginPath();
      g.moveTo(0,-rr*.30);
      g.quadraticCurveTo(rr*.20,-rr*.75, 0,-rr);
      g.quadraticCurveTo(-rr*.20,-rr*.75, 0,-rr*.30);
      g.fill(); g.restore();
    }
  }
  disc(g,cx,cy,r*.34,ink);
  disc(g,cx,cy,r*.20,'#fff');
}
function star(g,cx,cy,r,ink){ // 五芒星（陸軍）
  g.fillStyle=ink; g.beginPath();
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5, rr=i%2? r*.42:r;
    const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
    i? g.lineTo(x,y):g.moveTo(x,y);
  }
  g.closePath(); g.fill();
}
function cherry(g,cx,cy,r,ink){ // 櫻花紋
  g.fillStyle=ink;
  for(let i=0;i<5;i++){
    const a=-Math.PI/2+i/5*Math.PI*2;
    g.save(); g.translate(cx,cy); g.rotate(a);
    g.beginPath();
    g.moveTo(0,-r*.2);
    g.quadraticCurveTo(r*.5,-r*.6, 0,-r);
    g.quadraticCurveTo(-r*.5,-r*.6, 0,-r*.2);
    g.fill();
    // 花瓣缺口
    g.fillStyle='#fff'; g.beginPath(); g.arc(0,-r,r*.10,0,Math.PI*2); g.fill();
    g.fillStyle=ink; g.restore();
  }
  disc(g,cx,cy,r*.18,ink);
}
function paulownia(g,cx,cy,r,ink){ // 五七桐（司令・政府紋，簡化）
  g.fillStyle=ink; g.strokeStyle=ink; g.lineWidth=2;
  // 三片葉
  const leaf=(dx,s)=>{
    g.save(); g.translate(cx+dx,cy+r*.25); g.scale(s,1);
    g.beginPath(); g.ellipse(0,0,r*.30,r*.5,0,0,Math.PI*2); g.fill(); g.restore();
  };
  leaf(-r*.45,1); leaf(r*.45,1); leaf(0,1.05);
  // 花穗
  const bloom=(dx,n)=>{
    for(let i=0;i<n;i++){ g.beginPath();
      g.ellipse(cx+dx,cy-r*.4-i*r*.16,r*.05,r*.13,0,0,Math.PI*2); g.fill(); }
  };
  bloom(-r*.45,5); bloom(r*.45,5); bloom(0,7);
}
function unionjack(g,cx,cy,r){ // 英國 — 米字旗
  g.save(); g.beginPath(); g.rect(cx-r,cy-r*.66,r*2,r*1.32); g.clip();
  g.fillStyle='#0a2a6b'; g.fillRect(cx-r,cy-r*.66,r*2,r*1.32);
  g.strokeStyle='#fff'; g.lineWidth=r*.34;
  g.beginPath(); g.moveTo(cx-r,cy-r*.66); g.lineTo(cx+r,cy+r*.66);
  g.moveTo(cx+r,cy-r*.66); g.lineTo(cx-r,cy+r*.66); g.stroke();
  g.strokeStyle='#c8102e'; g.lineWidth=r*.16;
  g.beginPath(); g.moveTo(cx-r,cy-r*.66); g.lineTo(cx+r,cy+r*.66);
  g.moveTo(cx+r,cy-r*.66); g.lineTo(cx-r,cy+r*.66); g.stroke();
  g.strokeStyle='#fff'; g.lineWidth=r*.40;
  g.beginPath(); g.moveTo(cx,cy-r*.66); g.lineTo(cx,cy+r*.66);
  g.moveTo(cx-r,cy); g.lineTo(cx+r,cy); g.stroke();
  g.strokeStyle='#c8102e'; g.lineWidth=r*.22;
  g.beginPath(); g.moveTo(cx,cy-r*.66); g.lineTo(cx,cy+r*.66);
  g.moveTo(cx-r,cy); g.lineTo(cx+r,cy); g.stroke();
  g.restore();
}
function auststar(g,cx,cy,r,ink){ // 澳洲 — 七角聯邦之星
  g.fillStyle=ink; g.beginPath();
  for(let i=0;i<14;i++){
    const a=-Math.PI/2+i*Math.PI/7, rr=i%2? r*.45:r;
    const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
    i? g.lineTo(x,y):g.moveTo(x,y);
  }
  g.closePath(); g.fill();
}
function chakra(g,cx,cy,r,ink){ // 印度 — 法輪（阿育王輪）
  g.strokeStyle=ink; g.lineWidth=r*.10; g.fillStyle=ink;
  g.beginPath(); g.arc(cx,cy,r*.9,0,Math.PI*2); g.stroke();
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2;
    g.beginPath(); g.moveTo(cx,cy);
    g.lineTo(cx+Math.cos(a)*r*.9, cy+Math.sin(a)*r*.9); g.stroke(); }
  disc(g,cx,cy,r*.18,ink);
}
function crown(g,cx,cy,r,ink){ // 英國第18師 — 皇冠
  g.fillStyle=ink;
  g.beginPath();
  g.moveTo(cx-r,cy+r*.5); g.lineTo(cx-r,cy-r*.1);
  g.lineTo(cx-r*.5,cy+r*.25); g.lineTo(cx,cy-r*.5);
  g.lineTo(cx+r*.5,cy+r*.25); g.lineTo(cx+r,cy-r*.1);
  g.lineTo(cx+r,cy+r*.5); g.closePath(); g.fill();
  g.fillRect(cx-r,cy+r*.5,r*2,r*.3);
  for(const dx of [-r,0,r]){ disc(g,cx+dx,cy-r*.3,r*.13,ink); }
}
function crescent(g,cx,cy,r,ink){ // 馬來軍團 — 新月與星
  g.fillStyle=ink;
  g.beginPath(); g.arc(cx-r*.1,cy,r,0,Math.PI*2); g.fill();
  g.fillStyle='#fff';
  g.beginPath(); g.arc(cx+r*.25,cy,r*.85,0,Math.PI*2); g.fill();
  // 星
  g.fillStyle=ink; g.beginPath();
  const sx=cx+r*.55, sy=cy;
  for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, rr=i%2? r*.18:r*.42;
    const x=sx+Math.cos(a)*rr, y=sy+Math.sin(a)*rr; i?g.lineTo(x,y):g.moveTo(x,y); }
  g.closePath(); g.fill();
}

const EMBLEMS = { chrysanthemum, star, cherry, paulownia, unionjack, auststar, chakra, crown, crescent };

export function makeFlagTexture(emblem, armyColor){
  const { c, g } = base(armyColor);
  const cx=W*0.56, cy=H*0.5, r=58;
  if(emblem==='unionjack'){
    unionjack(g,cx,cy,r+6);
  } else {
    disc(g,cx,cy,r,'#fff');
    EMBLEMS[emblem]?.(g,cx,cy,r*0.82, shade(armyColor,-0.18));
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
