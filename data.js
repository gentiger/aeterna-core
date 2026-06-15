// ============================================================
//  Battle of Singapore — data model
//  Coords: x = East(+), z = South(+), units ≈ km. North is -z.
//  The Johor Strait separates the mainland (north) from Singapore.
// ============================================================

// ---------- Place / terrain labels ----------
export const PLACES = [
  { name:'JOHOR', sub:'Malay Peninsula', x:-14, z:-21, major:true },
  { name:'Johor Bahru', sub:'Malaya', x:-0.5, z:-16.2, major:true },
  { name:'Skudai', sub:'', x:-8, z:-17 },
  { name:'Tebrau', sub:'', x:8, z:-16.2 },
  { name:'Sungai Johor', sub:'river', x:19, z:-16.2 },
  { name:'Causeway', sub:'road & rail', x:0, z:-13.4 },
  { name:'Sembawang Naval Base', sub:'', x:5, z:-12, major:true },
  { name:'Sarimbun Beach', sub:'Japanese landing', x:-15, z:-11, major:true },
  { name:'Lim Chu Kang', sub:'', x:-17, z:-8.5 },
  { name:'Kranji', sub:'', x:-5, z:-11 },
  { name:'Seletar', sub:'', x:3, z:-9.5 },
  { name:'Tengah Airfield', sub:'', x:-9, z:-6.5, major:true },
  { name:'Bukit Panjang', sub:'', x:-4.5, z:-6 },
  { name:'Bukit Timah Hill', sub:'163 m · highest point', x:-2.5, z:-3, major:true },
  { name:'Jurong', sub:'', x:-12.5, z:-1.5 },
  { name:'MacRitchie Reservoir', sub:'', x:0.5, z:-1 },
  { name:'Paya Lebar', sub:'', x:7.5, z:0.5 },
  { name:'Pasir Panjang', sub:'Opium Hill', x:-5.5, z:4, major:true },
  { name:'Alexandra', sub:'', x:-2.5, z:5 },
  { name:'Singapore City', sub:'Downtown · Fort Canning', x:3.5, z:7, major:true },
  { name:'Kallang', sub:'', x:7, z:6 },
  { name:'Bedok', sub:'', x:11.5, z:4.2 },
  { name:'Changi', sub:'', x:17.5, z:-2.5, major:true },
  { name:'Johor Strait', sub:'', x:9, z:-13.2 },
  { name:'Singapore Strait', sub:'', x:-2, z:10.5, major:true },
  { name:'Sentosa I.', sub:'P. Blakang Mati', x:1.5, z:8.7 },
  { name:'Pulau Ubin', sub:'', x:14, z:-11.4 },
  { name:'Central Catchment', sub:'', x:0.3, z:-4.6 },
  { name:'Singapore R.', sub:'', x:2.3, z:5.0 },
  { name:'Kallang R.', sub:'', x:5.9, z:2.6 },
  { name:'Tanjong Pagar Stn', sub:'KTM railway terminus', x:1.6, z:7.3 },
  { name:'Boat Quay', sub:'', x:2.6, z:5.7 },
  { name:'Choa Chu Kang', sub:'', x:-7.5, z:-7.6 },
  { name:'Mandai', sub:'', x:-1.5, z:-8.2 },
  { name:'Nee Soon', sub:'', x:2.6, z:-8.8 },
  { name:'Hougang', sub:'', x:7.6, z:-3.4 },
  { name:'Holland Village', sub:'', x:-1.2, z:2.2 },
  { name:'Bukit Timah Village', sub:'', x:-4.2, z:-3.6 },
];

// Army colours
export const JP = 0xe23b32;   // Japanese — red
export const UK = 0x3b78d8;   // British — blue

// ---------- Forces (with family-crest emblem id) ----------
// pos: position [x,z] for each of the 7 acts (0..6)
export const UNITS = [
  // ===== Imperial Japanese — 25th Army =====
  { id:'J_HQ', army:'JP', emblem:'paulownia',
    name:'25th Army HQ', cmd:'Lt. Gen. Tomoyuki Yamashita · "Tiger of Malaya"', strength:'Supreme Command',
    appear:0, pos:[[-18,-16],[-12,-12],[-10,-8],[-7,-5],[-3,-3],[-3,-2],[-2,-1]] },
  { id:'J_5', army:'JP', emblem:'star',
    name:'5th Division', cmd:'Lt. Gen. Takuro Matsui', strength:'~13,000',
    appear:0, pos:[[-15,-12.5],[-12,-8],[-9,-6],[-3.5,-4],[-2,-1],[-2,1],[-1,2]] },
  { id:'J_18', army:'JP', emblem:'cherry',
    name:'18th Division', cmd:'Lt. Gen. Renya Mutaguchi', strength:'~13,000',
    appear:0, pos:[[-17,-11.5],[-14,-7],[-11,-4],[-6,-2],[-4,1],[-5,2.5],[-3,3]] },
  { id:'J_G', army:'JP', emblem:'chrysanthemum',
    name:'Imperial Guards Div.', cmd:'Lt. Gen. Takuma Nishimura', strength:'~13,000',
    appear:1, pos:[[-2,-16],[-5,-11],[-5,-8],[-4,-6],[-1,-3],[0,-1],[1,0]] },

  // ===== British Commonwealth — Malaya Command =====
  { id:'B_HQ', army:'UK', emblem:'unionjack',
    name:'Malaya Command', cmd:'Lt. Gen. Arthur Percival', strength:'Supreme Command',
    appear:0, pos:[[3.5,6.5],[3.5,6.5],[3.5,6.5],[3,6],[3,6.5],[3,6.5],[3.5,7]] },
  { id:'B_22', army:'UK', emblem:'auststar',
    name:'22nd Aus. Brigade', cmd:'Brig. Harold Taylor', strength:'~3,000',
    appear:0, pos:[[-13,-9],[-10,-4.5],[-7,-2],[-4,1],[-3,3],[-3.5,4],[-2.5,4.5]] },
  { id:'B_27', army:'UK', emblem:'auststar',
    name:'27th Aus. Brigade', cmd:'Brig. Duncan Maxwell', strength:'~3,000',
    appear:0, pos:[[-5,-11.5],[-6,-9],[-5,-7],[-3,-4],[-1.5,0],[-1,2],[-1,3]] },
  { id:'B_AUS', army:'UK', emblem:'auststar',
    name:'8th Australian Div.', cmd:'Maj. Gen. Gordon Bennett', strength:'~15,000',
    appear:0, pos:[[-8,-5],[-8,-3],[-6,-2],[-3,1],[-2.5,3],[-2,4],[-1.5,5]] },
  { id:'B_III', army:'UK', emblem:'chakra',
    name:'III Indian Corps', cmd:'Lt. Gen. Lewis Heath', strength:'~30,000',
    appear:0, pos:[[2,-8],[2,-6],[1,-4],[3,-3],[4,0],[4.5,2],[4,4]] },
  { id:'B_18', army:'UK', emblem:'crown',
    name:'18th British Div.', cmd:'Maj. Gen. Beckwith-Smith', strength:'~17,000',
    appear:0, pos:[[5,2],[4,1],[3,0],[2.5,1],[3,3],[3,4],[3,5]] },
  { id:'B_MALAY', army:'UK', emblem:'crescent',
    name:'Malay Regiment', cmd:'Lt. Adnan Saidi · last stand', strength:'~1,400',
    appear:5, pos:[[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5.5,4],[-5,4.5]] },
];

// ---------- Timeline: 7 acts ----------
export const PHASES = [
  {
    date:'8 Feb 1942', phase:'Act I · Feb 8', title:'Night Landing at Sarimbun',
    desc:'After nightfall the Japanese pound the north-west coast with artillery; the 5th and 18th Divisions cross the Johor Strait in landing craft and storm ashore at Sarimbun Beach. The Australian 22nd Brigade fights in the rain and searchlights as the line is torn open.',
    jp:36000, uk:85000,
    events:[
      { text:'Japanese artillery saturates the NW coast', x:-13, z:-12, type:'fire' },
      { text:'5th & 18th Divisions land at Sarimbun Beach', x:-14, z:-10.5, type:'flag' },
      { text:'22nd Australian Brigade fights on the beaches', x:-12, z:-8.5, type:'' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_22']],
  },
  {
    date:'9 Feb 1942', phase:'Act II · Feb 9', title:'Guards Cross · Fall Back to Jurong Line',
    desc:'The Imperial Guards cross the strait at Kranji — briefly trapped by burning fuel oil, yet still landing. The British abandon the north coast and pull back to the Jurong–Kranji Line, but gaps open up between units.',
    jp:35000, uk:80000,
    events:[
      { text:'Imperial Guards cross at Kranji', x:-5, z:-11, type:'flag' },
      { text:'Australians fall back to the Jurong–Kranji Line', x:-9, z:-4, type:'' },
    ],
    fireLines:[['J_G','B_27'],['J_5','B_22']],
  },
  {
    date:'10 Feb 1942', phase:'Act III · Feb 10', title:'Tengah Airfield Falls · Line Collapses',
    desc:'Tengah airfield is lost and the Jurong Line dissolves amid confused orders. Yamashita seizes the moment and drives all three divisions toward the heart of the island — Bukit Timah.',
    jp:34000, uk:74000,
    events:[
      { text:'Tengah Airfield falls', x:-9, z:-6.5, type:'fire' },
      { text:'Jurong Line collapses; full British retreat', x:-10, z:-3, type:'' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_AUS'],['J_G','B_27']],
  },
  {
    date:'11 Feb 1942', phase:'Act IV · Feb 11', title:'Bukit Timah Captured',
    desc:"The Japanese take the island's high point, Bukit Timah, and its vast supply depots. Yamashita sends Percival a demand to surrender. British supplies and morale collapse together.",
    jp:33000, uk:67000,
    events:[
      { text:'Bukit Timah hill & supply depots lost', x:-2.5, z:-3, type:'fire' },
      { text:'Yamashita issues a surrender ultimatum', x:-3, z:-4, type:'flag' },
    ],
    fireLines:[['J_5','B_22'],['J_18','B_AUS'],['J_G','B_27']],
  },
  {
    date:'13 Feb 1942', phase:'Act V · Feb 12–13', title:'Retreat to the City · Reservoirs Threatened',
    desc:'The British are squeezed into a final perimeter around the city. The MacRitchie and Seletar reservoirs are imperilled, threatening the island’s water supply. A million soldiers and civilians are packed into the town.',
    jp:32000, uk:55000,
    events:[
      { text:'British pull back to the final city perimeter', x:2, z:4, type:'' },
      { text:'Reservoir positions overrun', x:0.5, z:-1, type:'fire' },
    ],
    fireLines:[['J_G','B_27'],['J_18','B_AUS'],['J_5','B_22']],
  },
  {
    date:'14 Feb 1942', phase:'Act VI · Feb 14', title:'Pasir Panjang · Alexandra Massacre',
    desc:'At Pasir Panjang (Opium Hill) the Malay Regiment under Lt. Adnan Saidi fights to the last round and is wiped out. The same day Japanese troops storm Alexandra Hospital and massacre staff and patients.',
    jp:31000, uk:45000,
    events:[
      { text:"Malay Regiment's last stand at Pasir Panjang", x:-5.5, z:4, type:'fire' },
      { text:'Alexandra Hospital massacre', x:-2.5, z:5, type:'' },
    ],
    fireLines:[['J_18','B_MALAY'],['J_5','B_22'],['J_G','B_27']],
  },
  {
    date:'15 Feb 1942', phase:'Finale · Feb 15', title:'Percival Surrenders',
    desc:'With water and ammunition nearly gone, Percival signs an unconditional surrender at the Ford Motor Factory in Bukit Timah. Some 80,000 Commonwealth troops become prisoners — Churchill calls it "the worst disaster in British military history."',
    jp:30000, uk:0,
    events:[
      { text:'Percival signs the surrender at the Ford Factory', x:-3, z:-2, type:'flag' },
      { text:'~80,000 Commonwealth troops captured', x:3.5, z:7, type:'' },
    ],
    fireLines:[],
  },
];
