// v7.0 "外挂"测试：强制心情=20000，验证双技能(不屈意志+硬核护盾)与减伤封顶有无 bug
const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]},offsetWidth:100,parentElement:null}}
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
sb.timers=timers;

const src=`(function(){
 const R={};
 // === 外挂：写入满心情存档并真实调用 secretStartLevel ===
 saveV7({coins:0,petLevel:10,mood:20000,lastDecay:Date.now()});
 secretStartLevel(41);
 const s0=secretState;
 R.realStart={mood:s0.mood,reduction:s0.burnReduction,steady:s0.steadfastReady,shield:s0.shieldReady,
   rawDps:+(5*(1+s0.lines.bonus.dmg/100)).toFixed(1),
   effDps:+(5*(1+s0.lines.bonus.dmg/100)-s0.burnReduction).toFixed(1)};

 // 覆盖投掷动画，捕获命中回调（跳过抛体飞行，直接触发 onHit）
 let pendingHit=null;
 secretThrow=function(from,to,icon,dmg,color,onHit){ pendingHit=onHit; };
 function fire(){ const f=pendingHit; pendingHit=null; if(f) f(); }
 // 构造心情20000的战斗状态（与 secretStartLevel 锁定逻辑一致）
 function mk(level){
   const lines=secretStarLines(level), mood=20000, reduction=moodBurnReduction(mood);
   return {level:level,active:true,locked:false,input:'',idx:0,playerHP:1000,
     enemyHP:lines.enemyHP,enemyMax:lines.enemyHP,score:0,correct:0,wrong:0,qStart:0,q:{answer:'1'},
     noSpecial:{v:0},lines:lines,startedAt:Date.now(),mood:mood,burnReduction:reduction,
     steadfastReady:hasSteadfast(mood),shieldReady:hasHardShield(mood),
     steadfastActive:false,steadfastTimer:null};
 }
 function wrong(s){ s.input='999'; pendingHit=null; secretSubmit(); fire(); }
 function right(s){ s.input='1'; pendingHit=null; secretSubmit(); fire(); }

 // T1: 硬核护盾首刀免伤
 secretState=mk(41); let s=secretState;
 wrong(s);
 R.shieldFirst={hp:s.playerHP,shield:s.shieldReady,active:s.active,steady:s.steadfastActive};
 // T2: 第二刀正常扣血（41关 dmg=680）
 wrong(s);
 R.shieldSecond={hp:+s.playerHP.toFixed(1),shield:s.shieldReady,active:s.active};

 // T3: 灼烧致死触发不屈意志（新局，盾未用）
 secretState=mk(41); s=secretState; s.playerHP=0.01; secretBurn();
 R.steadyTrigger={hp:s.playerHP,active:s.steadfastActive,ready:s.steadfastReady,shield:s.shieldReady,alive:s.active};
 // T4: 不屈期间灼烧不致死
 secretBurn();
 R.steadyBurn={hp:s.playerHP,active:s.steadfastActive,alive:s.active};
 // T5: 不屈期间答对 → 恢复250并解除
 right(s);
 R.steadyRecover={hp:s.playerHP,steadyActive:s.steadfastActive,alive:s.active};
 // T6: 不屈每局仅一次 —— 恢复后再归零应直接失败
 s.playerHP=0.01; secretBurn();
 R.steadyOnce={steadyActive:s.steadfastActive,alive:s.active};

 // T7【关键交互测试】不屈期间挨刀 + 护盾仍在 → 规则说"期间挨刀依旧死"，看代码行为
 secretState=mk(41); s=secretState;
 s.playerHP=0.01; secretBurn();  // 触发不屈，盾未消耗
 const before={hp:s.playerHP,steadyActive:s.steadfastActive,shield:s.shieldReady};
 wrong(s);                        // 不屈期间挨刀
 R.steadyKnifeWithShield={before:before,after:{hp:s.playerHP,steadyActive:s.steadfastActive,shield:s.shieldReady,alive:s.active}};

 // T8: 不屈超时5秒未回血 → 死亡
 secretState=mk(41); s=secretState; s.playerHP=0.01; secretBurn();
 const timer=timers.find(x=>x.id===s.steadfastTimer);
 if(timer&&!timer.cancelled) timer.fn();
 R.timeout={alive:s.active,steadyActive:s.steadfastActive};

 // T9: 不屈期间挨刀（盾已用掉）→ 应死亡
 secretState=mk(41); s=secretState; s.playerHP=0.01; secretBurn(); s.shieldReady=false;
 wrong(s);
 R.steadyKnifeNoShield={alive:s.active,steadyActive:s.steadfastActive,hp:s.playerHP};

 return R;
})()`;
const R=vm.runInContext(src,sb);
for(const k of Object.keys(R)) console.log(k+':',JSON.stringify(R[k]));
