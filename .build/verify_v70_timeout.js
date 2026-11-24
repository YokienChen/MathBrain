const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]},offsetWidth:100}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const timers=[];let tid=0;
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,BigInt,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 1},clearInterval(){},
  setTimeout(fn,ms){const id=++tid;timers.push({id,fn,ms,cancelled:false});return id;},
  clearTimeout(id){const t=timers.find(x=>x.id===id);if(t)t.cancelled=true;},
  alert(){},confirm(){return false},navigator:{userAgent:'node'},performance:{now(){return 0}},requestAnimationFrame(){}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 const R={};
 const lines=secretStarLines(1);
 // 超时死：触发不屈后，手动执行5秒定时器回调，应 secretFinish(false) → active=false
 secretState={level:1,active:true,locked:false,input:'',idx:0,playerHP:0,
   enemyHP:lines.enemyHP,enemyMax:lines.enemyHP,score:0,correct:0,wrong:0,qStart:0,q:{answer:'1'},
   noSpecial:{v:0},lines:lines,startedAt:Date.now(),mood:8000,burnReduction:0,
   steadfastReady:true,shieldReady:false,steadfastActive:false,steadfastTimer:null};
 const s=secretState;
 triggerSteadfast();
 const timerId=s.steadfastTimer;
 const t=timers.find(x=>x.id===timerId);
 // 执行定时器回调（模拟5秒到）
 if(t&&!t.cancelled) t.fn();
 R.timeoutDeath={active:s.active,steadfastActive:s.steadfastActive};
 return R;
})()`;
// 把 timers 暴露到沙箱供 src 访问
sb.timers=timers;
const R=vm.runInContext(src,sb);
console.log(JSON.stringify(R));
let fail=false;
if(R.timeoutDeath.active!==false){console.log('✗ 超时未死亡');fail=true;}
if(R.timeoutDeath.steadfastActive!==false){console.log('✗ 超时后状态未清');fail=true;}
if(fail)throw new Error('超时验证失败');
console.log('[✓] 超时死亡验证通过');
