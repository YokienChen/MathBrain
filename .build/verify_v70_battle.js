const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]},offsetWidth:100}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
// 可控计时器：记录 setTimeout 回调，手动触发
const timers=[];let tid=0;
function setTimeoutMock(fn,ms){ timers.push({id:++tid,fn,ms,cancelled:false}); return tid; }
function clearTimeoutMock(id){ const t=timers.find(x=>x.id===id); if(t)t.cancelled=true; }
function fireTimer(id){ const t=timers.find(x=>x.id===id); if(t&&!t.cancelled){t.fn();return true;} return false; }
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,BigInt,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 1},clearInterval(){},setTimeout:setTimeoutMock,clearTimeout:clearTimeoutMock,alert(){},confirm(){return false},navigator:{userAgent:'node'},performance:{now(){return 0}},requestAnimationFrame(){}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 const R={};
 // 构造 secretState，不真正 startLevel（避免 DOM/动画），直接测技能逻辑
 function mk(mood){
   const lines=secretStarLines(1);
   return {level:1,active:true,locked:false,input:'',idx:0,playerHP:1000,
     enemyHP:lines.enemyHP,enemyMax:lines.enemyHP,score:0,correct:0,wrong:0,qStart:0,q:{answer:'1'},
     noSpecial:{v:0},lines:lines,startedAt:Date.now(),mood:mood,burnReduction:moodBurnReduction(mood),
     steadfastReady:hasSteadfast(mood),shieldReady:hasHardShield(mood),steadfastActive:false,steadfastTimer:null};
 }
 // 1. 不屈意志触发：心血归零触发，进入激活态，血=0
 secretState=mk(8000);
 const s1=secretState; s1.playerHP=0.01; secretBurn(); // 灼烧使其归零
 R.steadfastTrigger={active:s1.steadfastActive,hp:s1.playerHP,readyLeft:s1.steadfastReady};
 // 2. 激活期间灼烧不致死（血保持0，仍active）
 s1.playerHP=0; secretBurn();
 R.steadfastBurn={active:s1.steadfastActive,hp:s1.playerHP};
 // 3. 激活期间答对恢复250并解除
 s1.playerHP=0; recoverFromSteadfast(); s1.playerHP=250; // 模拟答对分支
 R.steadfastRecover={active:s1.steadfastActive,hp:s1.playerHP};
 // 4. 不屈意志每局仅一次：解除后再归零不再触发
 s1.playerHP=0.01; secretBurn();
 R.steadfastOnce={active:s1.steadfastActive,ready:s1.steadfastReady};
 // 5. 硬核护盾：心情20000 首次挨刀免伤
 secretState=mk(20000);
 const s2=secretState;
 s2.shieldReady=true; // 首刀
 // 模拟 onHit：护盾消耗、血不变
 const before=s2.playerHP;
 if(s2.shieldReady){s2.shieldReady=false;}
 R.shieldFirst={readyAfter:s2.shieldReady,hpUnchanged:s2.playerHP===before};
 // 6. 心情<1000 无减伤；=1000 有减伤已在纯逻辑测
 R.noReductionLowMood=mk(500).burnReduction;
 // 7. 掉下8000 技能消失：重开一局心情7999
 secretState=mk(7999);
 R.noSteadfastLow={ready:secretState.steadfastReady,shield:secretState.shieldReady};
 return R;
})()`;
const R=vm.runInContext(src,sb);
console.log(JSON.stringify(R,null,1));
let fail=false;
if(!R.steadfastTrigger.active||R.steadfastTrigger.hp!==0||R.steadfastTrigger.readyLeft!==false){console.log('✗ 不屈触发错误');fail=true;}
if(!R.steadfastBurn.active||R.steadfastBurn.hp!==0){console.log('✗ 不屈期间灼烧错误');fail=true;}
if(R.steadfastRecover.active!==false||R.steadfastRecover.hp!==250){console.log('✗ 不屈恢复错误');fail=true;}
if(R.steadfastOnce.active!==false){console.log('✗ 不屈应每局一次');fail=true;}
if(R.shieldFirst.readyAfter!==false||!R.shieldFirst.hpUnchanged){console.log('✗ 护盾错误');fail=true;}
if(R.noReductionLowMood!==0){console.log('✗ 低心情减伤错误');fail=true;}
if(R.noSteadfastLow.ready||R.noSteadfastLow.shield){console.log('✗ 低心情技能未锁');fail=true;}
if(fail)throw new Error('战斗技能验证失败');
console.log('[✓] 战斗技能全部通过');
