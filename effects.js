// ============================================================
//  特效 — 槍炮（曳光彈/砲擊/爆炸）與天氣（雨/雷/霧）
// ============================================================
import * as THREE from 'three';

// ---------------- 曳光彈 + 槍口火光 ----------------
export class FireFX {
  constructor(scene){
    this.scene = scene;
    this.tracers = [];   // {line, t, life}
    this.flashes = [];   // {sprite, t, life}
    this.shells = [];     // {mesh, from, to, t, life, trail}
    this.explosions = []; // {points, t, life, vel}
    this.enabled = true;

    const cv=document.createElement('canvas'); cv.width=cv.height=64;
    const g=cv.getContext('2d');
    const grd=g.createRadialGradient(32,32,0,32,32,32);
    grd.addColorStop(0,'rgba(255,250,210,1)');
    grd.addColorStop(.3,'rgba(255,190,90,.9)');
    grd.addColorStop(1,'rgba(255,120,40,0)');
    g.fillStyle=grd; g.fillRect(0,0,64,64);
    this.flashTex=new THREE.CanvasTexture(cv);
  }

  // 兩單位之間的對射
  fireBetween(a, b){
    if(!this.enabled) return;
    const from = a.clone(); from.y += 0.6;
    const to = b.clone(); to.y += 0.6;
    // 曳光彈
    const geo=new THREE.BufferGeometry().setFromPoints([from,to]);
    const mat=new THREE.LineBasicMaterial({color:0xffd27a,transparent:true,opacity:0.9});
    const line=new THREE.Line(geo,mat);
    this.scene.add(line);
    this.tracers.push({line,t:0,life:0.18});
    // 槍口火光
    this._flash(from);
    if(Math.random()<0.5) this._flash(to);
  }
  _flash(p){
    const m=new THREE.SpriteMaterial({map:this.flashTex,transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false});
    const s=new THREE.Sprite(m); s.scale.setScalar(1.2);
    s.position.copy(p); this.scene.add(s);
    this.flashes.push({sprite:s,t:0,life:0.12});
  }

  // 砲擊：拋物線砲彈 + 落點爆炸
  cannon(from, to){
    if(!this.enabled) return;
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,8),
      new THREE.MeshBasicMaterial({color:0x222222}));
    this.scene.add(m);
    this.shells.push({mesh:m,from:from.clone(),to:to.clone(),t:0,life:0.9});
    this._flash(from.clone().setY(from.y+0.5));
  }

  explode(p, scale=1, color=0xff7a30){
    const N=60; const arr=new Float32Array(N*3); const vel=[];
    for(let i=0;i<N;i++){
      arr[i*3]=p.x; arr[i*3+1]=p.y+0.2; arr[i*3+2]=p.z;
      const a=Math.random()*Math.PI*2, e=Math.random()*Math.PI*0.5;
      const sp=(0.6+Math.random()*1.6)*scale;
      vel.push(new THREE.Vector3(Math.cos(a)*Math.cos(e)*sp, Math.sin(e)*sp*1.5+0.6, Math.sin(a)*Math.cos(e)*sp));
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const mat=new THREE.PointsMaterial({color,size:0.5*scale,transparent:true,
      blending:THREE.AdditiveBlending,depthWrite:false});
    const pts=new THREE.Points(geo,mat); this.scene.add(pts);
    this.explosions.push({points:pts,t:0,life:1.0,vel});
    // 閃光
    this._flash(p.clone().setY(p.y+0.4));
  }

  update(dt){
    // tracers
    for(let i=this.tracers.length-1;i>=0;i--){
      const o=this.tracers[i]; o.t+=dt;
      o.line.material.opacity = Math.max(0,0.9*(1-o.t/o.life));
      if(o.t>=o.life){ this.scene.remove(o.line); o.line.geometry.dispose();
        o.line.material.dispose(); this.tracers.splice(i,1); }
    }
    for(let i=this.flashes.length-1;i>=0;i--){
      const o=this.flashes[i]; o.t+=dt;
      const k=o.t/o.life; o.sprite.scale.setScalar(1.2+k*1.4);
      o.sprite.material.opacity=Math.max(0,1-k);
      if(o.t>=o.life){ this.scene.remove(o.sprite); o.sprite.material.dispose(); this.flashes.splice(i,1); }
    }
    for(let i=this.shells.length-1;i>=0;i--){
      const o=this.shells[i]; o.t+=dt; const k=o.t/o.life;
      if(k>=1){ this.scene.remove(o.mesh); o.mesh.geometry.dispose(); o.mesh.material.dispose();
        this.explode(o.to,1.4); this.shells.splice(i,1); continue; }
      o.mesh.position.lerpVectors(o.from,o.to,k);
      o.mesh.position.y += Math.sin(k*Math.PI)*4.5; // 拋物線
    }
    for(let i=this.explosions.length-1;i>=0;i--){
      const o=this.explosions[i]; o.t+=dt; const k=o.t/o.life;
      const p=o.points.geometry.attributes.position;
      for(let j=0;j<o.vel.length;j++){
        o.vel[j].y -= dt*2.2;
        p.setXYZ(j, p.getX(j)+o.vel[j].x*dt, Math.max(0,p.getY(j)+o.vel[j].y*dt), p.getZ(j)+o.vel[j].z*dt);
      }
      p.needsUpdate=true;
      o.points.material.opacity=Math.max(0,1-k);
      o.points.material.size=0.5*(1+k);
      if(k>=1){ this.scene.remove(o.points); o.points.geometry.dispose();
        o.points.material.dispose(); this.explosions.splice(i,1); }
    }
  }
}

// ---------------- 天氣：雨 + 閃電 ----------------
export class WeatherFX {
  constructor(scene){
    this.scene=scene; this.enabled=true;
    const N=7000; this.N=N;
    const arr=new Float32Array(N*3); this.vel=new Float32Array(N);
    for(let i=0;i<N;i++){
      arr[i*3]=(Math.random()-0.5)*120;
      arr[i*3+1]=Math.random()*40;
      arr[i*3+2]=(Math.random()-0.5)*90;
      this.vel[i]=18+Math.random()*22;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const mat=new THREE.PointsMaterial({color:0x9fc0e0,size:0.16,transparent:true,opacity:0.5,depthWrite:false});
    this.rain=new THREE.Points(geo,mat);
    this.scene.add(this.rain);
    this.flash=0;
    this.nextBolt=2+Math.random()*4;
  }
  setEnabled(v){ this.enabled=v; this.rain.visible=v; }
  update(dt, center, lights){
    if(!this.enabled){ this.flash=0; return; }
    const p=this.rain.geometry.attributes.position;
    for(let i=0;i<this.N;i++){
      let y=p.getY(i)-this.vel[i]*dt;
      if(y<0){ y=38+Math.random()*6;
        p.setX(i, center.x+(Math.random()-0.5)*120);
        p.setZ(i, center.z+(Math.random()-0.5)*90); }
      p.setY(i,y);
    }
    this.rain.position.x = center.x; this.rain.position.z = center.z;
    p.needsUpdate=true;
    // 閃電
    this.nextBolt-=dt;
    if(this.nextBolt<=0){ this.flash=1.0; this.nextBolt=3+Math.random()*6; }
    if(this.flash>0){ this.flash=Math.max(0,this.flash-dt*4);
      if(lights) lights.hemi.intensity = 0.5 + this.flash*2.2; }
    else if(lights) lights.hemi.intensity = 0.5;
  }
}
