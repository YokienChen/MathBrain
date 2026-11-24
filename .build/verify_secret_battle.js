const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
let clock=0;
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',offsetWidth:100,classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},removeEventListener(){},appendChild(){},removeChild(){},remove(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]}}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,BigInt,parseInt,parseFloat,isNaN,isFinite,
  performance:{now(){return clock}},requestAnimationFrame(fn){clock+=1000;fn(clock)},
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}},
  setInterval(){return 0},clearInterval(){},setTimeout(){return 0},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
console.log('[1] 脚本语法与初始化 OK');
const src=`
(function(){
 const R={};
 secretStartLevel(1);
 R.lv1Start={enemyMax:secretState.enemyMax,need:secretState.lines.need};
 let steps=0;
 while(secretState.active&&steps<10){
   secretState.input=String(secretState.q.answer);
   secretSubmit(); steps++;
 }
 R.lv1={steps:steps,active:secretState.active,enemyHP:secretState.enemyHP,
        playerHP:secretState.playerHP,score:Math.round(secretState.score),correct:secretState.correct};

 secretStartLevel(41);
 const s41=secretState;
 R.lv41Start={enemyMax:s41.enemyMax,need:s41.lines.need,
   knife:200*(1+s41.lines.bonus.dmg/100),burnPerSec:5*(1+s41.lines.bonus.dmg/100)};
 s41.input=String(s41.q.answer+1);
 secretSubmit();
 R.lv41Wrong={active:s41.active,playerHP:s41.playerHP,wrong:s41.wrong,score:s41.score};

 secretStartLevel(49);
 const s49=secretState;
 s49.input=String(s49.q.answer+1);
 secretSubmit();
 R.lv49Wrong={active:s49.active,playerHP:s49.playerHP};

 secretStartLevel(6);
 const s6=secretState;
 s6.playerHP=800;
 s6.input=String(s6.q.answer);
 secretSubmit();
 R.heal={playerHP:s6.playerHP};

 const L=secretStarLines(41);
 R.starBands=[L.minScore-1,L.minScore,L.twoScore-1,L.twoScore,L.maxScore].map(v=>secretStarsFor(v,L));

 R.burnCheck=(function(){
   secretStartLevel(41);
   const before=secretState.playerHP;
   // 直接调用 10 次 burn（每次 0.1 秒）
   for(let i=0;i<10;i++) secretBurn();
   return +(before-secretState.playerHP).toFixed(1);
 })();
 return R;
})()`;
const R=vm.runInContext(src,sb);
console.log('[2] 第1关初始:',JSON.stringify(R.lv1Start));
console.log('[3] 第1关全对通关:',JSON.stringify(R.lv1));
console.log('[4] 第41关初始:',JSON.stringify(R.lv41Start));
console.log('[5] 第41关答错一题:',JSON.stringify(R.lv41Wrong));
console.log('[6] 回血(800→):',JSON.stringify(R.heal));
console.log('[7] 星级边界:',JSON.stringify(R.starBands));
console.log('[8] 1秒灼烧掉血:',R.burnCheck);
let fail=false;
if(R.lv1Start.need!==2||R.lv1.steps!==2||R.lv1.active){console.log('✗ 第1关通关流程错误');fail=true;}
if(R.lv41Start.need!==38||R.lv41Start.knife!==680||R.lv41Start.burnPerSec!==17){console.log('✗ 第41关数值错误');fail=true;}
if(!R.lv41Wrong.active||Math.abs(R.lv41Wrong.playerHP-320)>1){console.log('✗ 41关一刀后血量错误(应剩320)');fail=true;}
if(R.lv49Wrong.active||R.lv49Wrong.playerHP>0){console.log('✗ 49关封顶伤害未一刀致死');fail=true;}
if(R.lv41Wrong.score!==0){console.log('✗ 答错仍计分');fail=true;}
if(R.lv1.score<=0){console.log('✗ 答对未计分');fail=true;}
if(R.heal.playerHP!==1000){console.log('✗ 回血错误');fail=true;}
if(JSON.stringify(R.starBands)!=='[0,1,1,2,3]'){console.log('✗ 星级边界错误');fail=true;}
if(Math.abs(R.burnCheck-17)>0.01){console.log('✗ 灼烧速率错误');fail=true;}
if(fail)throw new Error('战斗验证失败');
console.log('[✓] 全部断言通过');
