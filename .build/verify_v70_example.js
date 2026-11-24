const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]},offsetWidth:100}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,BigInt,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 1},clearInterval(){},
  setTimeout(){return 1},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'},performance:{now(){return 0}},requestAnimationFrame(){}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 const R={};
 saveV7({coins:0,petLevel:10,mood:20000,lastDecay:Date.now()});
 for(const lv of [41,49,60,99]){
   secretStartLevel(lv);
   const s=secretState;
   const raw=5*(1+s.lines.bonus.dmg/100);
   const eff=Math.max(0,raw-s.burnReduction);
   R[lv]={dmgBonus:s.lines.bonus.dmg,raw:+raw.toFixed(1),reduction:s.burnReduction,eff:+eff.toFixed(1)};
 }
 return R;
})()`;
const R=vm.runInContext(src,sb);
for(const k of Object.keys(R)) console.log('第'+k+'关:',JSON.stringify(R[k]));
// 用户例子：被动-25.0 关，满心情应减到 -22.0
const ex=Object.values(R).find(x=>x.raw===25);
console.log('用户例(被动-25.0):',ex?('减伤后 -'+ex.eff.toFixed(1)):'未找到被动-25.0的关');
if(!ex||ex.eff!==22){console.log('✗ 与用户例子不符');process.exit(1);}
console.log('[✓] 与用户例子 -25.0→-22.0 完全一致');
