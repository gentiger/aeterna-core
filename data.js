// ============================================================
//  新加坡保衛戰 — 戰史資料  (Battle of Singapore data model)
//  座標系統：x 向東 (+E)，z 向南 (+S)，單位 ≈ 公里。
//  北方在 -z 方向（地圖上方）。柔佛海峽分隔北面大陸與新加坡島。
// ============================================================

// ---------- 地名與地形標示 ----------
export const PLACES = [
  { name:'柔佛 (馬來半島)', sub:'JOHOR', x:-14, z:-21, major:true },
  { name:'長堤', sub:'CAUSEWAY', x:0, z:-13.4 },
  { name:'三巴旺軍港', sub:'SEMBAWANG NAVAL BASE', x:5, z:-12, major:true },
  { name:'薩里蒙海灘', sub:'SARIMBUN BEACH', x:-15, z:-11, major:true },
  { name:'林厝港', sub:'LIM CHU KANG', x:-17, z:-8.5 },
  { name:'克蘭芝', sub:'KRANJI', x:-5, z:-11 },
  { name:'實里達', sub:'SELETAR', x:3, z:-9.5 },
  { name:'登加機場', sub:'TENGAH AIRFIELD', x:-9, z:-6.5, major:true },
  { name:'武吉班讓', sub:'BUKIT PANJANG', x:-4.5, z:-6 },
  { name:'武吉知馬高地', sub:'BUKIT TIMAH HILL · 163m', x:-2.5, z:-3, major:true },
  { name:'裕廊', sub:'JURONG', x:-12.5, z:-1.5 },
  { name:'麥里芝水庫', sub:'MACRITCHIE RESERVOIR', x:0.5, z:-1 },
  { name:'巴耶利峇', sub:'PAYA LEBAR', x:7.5, z:0.5 },
  { name:'巴西班讓', sub:'PASIR PANJANG', x:-5.5, z:4, major:true },
  { name:'亞歷山大', sub:'ALEXANDRA', x:-2.5, z:5 },
  { name:'新加坡市區', sub:'SINGAPORE CITY · 福特車廠/福康寧', x:3.5, z:7, major:true },
  { name:'加冷', sub:'KALLANG', x:7, z:6 },
  { name:'勿洛', sub:'BEDOK', x:11.5, z:4.2 },
  { name:'樟宜', sub:'CHANGI', x:17.5, z:-2.5, major:true },
  { name:'柔佛海峽', sub:'JOHOR STRAIT', x:9, z:-13.2 },
  { name:'新加坡海峽', sub:'SINGAPORE STRAIT', x:-2, z:10.5, major:true },
  { name:'聖淘沙島', sub:'SENTOSA · P. BLAKANG MATI', x:1.5, z:8.7 },
  { name:'烏敏島', sub:'PULAU UBIN', x:14, z:-11.4 },
  { name:'中央集水區', sub:'CENTRAL CATCHMENT', x:0.3, z:-4.6 },
  { name:'新加坡河', sub:'SINGAPORE R.', x:2.3, z:5.0 },
  { name:'加冷河', sub:'KALLANG R.', x:5.9, z:2.6 },
  { name:'丹戎巴葛車站', sub:'TANJONG PAGAR · KTM 鐵路終點', x:1.6, z:7.3 },
];

// 軍/陣型 顏色
export const JP = 0xe23b32;   // 日軍 紅
export const UK = 0x3b78d8;   // 英軍 藍

// ---------- 各軍勢（含家紋 emblem 代號）----------
// pos: 每一幕的位置 [x,z]，共 7 幕 (0..6)
export const UNITS = [
  // ===== 日本帝國陸軍 第25軍 =====
  { id:'J_HQ', army:'JP', emblem:'paulownia',
    name:'第25軍 司令部', cmd:'山下奉文 中將「馬來之虎」', strength:'總指揮',
    appear:0, pos:[[-18,-16],[-12,-12],[-10,-8],[-7,-5],[-3,-3],[-3,-2],[-2,-1]] },
  { id:'J_5', army:'JP', emblem:'star',
    name:'第5師團', cmd:'松井太久郎 中將', strength:'約 13,000',
    appear:0, pos:[[-15,-12.5],[-12,-8],[-9,-6],[-3.5,-4],[-2,-1],[-2,1],[-1,2]] },
  { id:'J_18', army:'JP', emblem:'cherry',
    name:'第18師團', cmd:'牟田口廉也 中將', strength:'約 13,000',
    appear:0, pos:[[-17,-11.5],[-14,-7],[-11,-4],[-6,-2],[-4,1],[-5,2.5],[-3,3]] },
  { id:'J_G', army:'JP', emblem:'chrysanthemum',
    name:'近衛師團', cmd:'西村琢磨 中將', strength:'約 13,000',
    appear:1, pos:[[-2,-16],[-5,-11],[-5,-8],[-4,-6],[-1,-3],[0,-1],[1,0]] },

  // ===== 大英國協 馬來亞軍 =====
  { id:'B_HQ', army:'UK', emblem:'unionjack',
    name:'馬來亞軍 司令部', cmd:'帕西瓦爾 中將', strength:'總指揮',
    appear:0, pos:[[3.5,6.5],[3.5,6.5],[3.5,6.5],[3,6],[3,6.5],[3,6.5],[3.5,7]] },
  { id:'B_22', army:'UK', emblem:'auststar',
    name:'澳洲第22旅', cmd:'泰勒 准將', strength:'約 3,000',
    appear:0, pos:[[-13,-9],[-10,-4.5],[-7,-2],[-4,1],[-3,3],[-3.5,4],[-2.5,4.5]] },
  { id:'B_27', army:'UK', emblem:'auststar',
    name:'澳洲第27旅', cmd:'麥斯威爾 准將', strength:'約 3,000',
    appear:0, pos:[[-5,-11.5],[-6,-9],[-5,-7],[-3,-4],[-1.5,0],[-1,2],[-1,3]] },
  { id:'B_AUS', army:'UK', emblem:'auststar',
    name:'澳洲第8師團', cmd:'貝內特 少將', strength:'約 15,000',
    appear:0, pos:[[-8,-5],[-8,-3],[-6,-2],[-3,1],[-2.5,3],[-2,4],[-1.5,5]] },
  { id:'B_III', army:'UK', emblem:'chakra',
    name:'印度第3軍團', cmd:'希思 中將', strength:'約 30,000',
    appear:0, pos:[[2,-8],[2,-6],[1,-4],[3,-3],[4,0],[4.5,2],[4,4]] },
  { id:'B_18', army:'UK', emblem:'crown',
    name:'英國第18師團', cmd:'貝克威斯-史密斯 少將', strength:'約 17,000',
    appear:0, pos:[[5,2],[4,1],[3,0],[2.5,1],[3,3],[3,4],[3,5]] },
  { id:'B_MALAY', army:'UK', emblem:'crescent',
    name:'馬來軍團', cmd:'阿德南 中尉 — 死戰殉國', strength:'約 1,400',
    appear:5, pos:[[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5,4.5]] },
];

// ---------- 時間軸：7 幕 ----------
export const PHASES = [
  {
    date:'1942 · 02 · 08', phase:'第一幕 / FEB 8', title:'日軍夜襲・薩里蒙登陸',
    desc:'入夜後，山下奉文以猛烈砲火轟擊新加坡西北岸，第5、第18師團乘登陸艇強渡柔佛海峽，於薩里蒙海灘登陸。澳洲第22旅在暴雨與探照燈下力戰，防線被撕開缺口。',
    jp:36000, uk:85000,
    events:[
      { text:'日軍砲兵向西北海岸實施飽和射擊', x:-13, z:-12, type:'fire' },
      { text:'第5・第18師團於薩里蒙海灘登陸', x:-14, z:-10.5, type:'flag' },
      { text:'澳洲第22旅死守，海灘陷入混戰', x:-12, z:-8.5, type:'' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_22']],
  },
  {
    date:'1942 · 02 · 09', phase:'第二幕 / FEB 9', title:'近衛師團強渡・退守裕廊線',
    desc:'近衛師團於東側克蘭芝渡海登陸，一度受困於燃燒的油料，仍突破上岸。英軍放棄北岸，向「裕廊—克蘭芝防線」收縮，但部隊間出現缺口。',
    jp:35000, uk:80000,
    events:[
      { text:'近衛師團於克蘭芝渡海', x:-5, z:-11, type:'flag' },
      { text:'澳軍退守裕廊—克蘭芝防線', x:-9, z:-4, type:'' },
    ],
    fireLines:[['J_G','B_27'],['J_5','B_22']],
  },
  {
    date:'1942 · 02 · 10', phase:'第三幕 / FEB 10', title:'登加機場失守・防線崩潰',
    desc:'登加機場落入日軍之手，裕廊防線在一連串誤令與混亂中瓦解。山下抓住戰機，命三個師團向島嶼心臟——武吉知馬——快速突進。',
    jp:34000, uk:74000,
    events:[
      { text:'登加機場陷落', x:-9, z:-6.5, type:'fire' },
      { text:'裕廊防線崩潰，英軍全線後退', x:-10, z:-3, type:'' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_AUS'],['J_G','B_27']],
  },
  {
    date:'1942 · 02 · 11', phase:'第四幕 / FEB 11', title:'武吉知馬高地失守',
    desc:'日軍攻佔全島制高點武吉知馬，奪得龐大的糧彈補給庫。山下奉文發出勸降書要求英軍投降。英軍補給與士氣同時崩落。',
    jp:33000, uk:67000,
    events:[
      { text:'武吉知馬高地與補給庫失守', x:-2.5, z:-3, type:'fire' },
      { text:'山下發出勸降最後通牒', x:-3, z:-4, type:'flag' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_AUS'],['J_G','B_27']],
  },
  {
    date:'1942 · 02 · 13', phase:'第五幕 / FEB 12–13', title:'退守市區・水庫告急',
    desc:'英軍被壓縮至環繞市區的最後防線。麥里芝、實里達水庫一帶岌岌可危，全島水源命脈受到威脅。城內擠滿百萬軍民。',
    jp:32000, uk:55000,
    events:[
      { text:'英軍收縮至市區最後防線', x:2, z:4, type:'' },
      { text:'水庫陣地遭日軍逼近', x:0.5, z:-1, type:'fire' },
    ],
    fireLines:[['J_G','B_27'],['J_18','B_AUS'],['J_5','B_22']],
  },
  {
    date:'1942 · 02 · 14', phase:'第六幕 / FEB 14', title:'巴西班讓之役・亞歷山大慘案',
    desc:'馬來軍團在阿德南中尉率領下於巴西班讓的鴉片山死守至彈盡，全員壯烈殉國。同日，日軍闖入亞歷山大醫院，製造屠殺慘案。',
    jp:31000, uk:45000,
    events:[
      { text:'巴西班讓・馬來軍團死戰殉國', x:-5.5, z:4, type:'fire' },
      { text:'亞歷山大醫院慘案', x:-2.5, z:5, type:'' },
    ],
    fireLines:[['J_18','B_MALAY'],['J_5','B_22'],['J_G','B_27']],
  },
  {
    date:'1942 · 02 · 15', phase:'終幕 / FEB 15', title:'帕西瓦爾投降',
    desc:'水源將盡、彈藥匱乏，帕西瓦爾於武吉知馬的福特車廠簽署無條件投降。約八萬名英聯邦官兵成為俘虜。邱吉爾稱之為「英國軍事史上最慘重的災難」。',
    jp:30000, uk:0,
    events:[
      { text:'帕西瓦爾於福特車廠簽署投降', x:-3, z:-2, type:'flag' },
      { text:'約 80,000 英聯邦軍被俘', x:3.5, z:7, type:'' },
    ],
    fireLines:[],
  },
];
