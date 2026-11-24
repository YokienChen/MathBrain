const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]},offsetWidth:100}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,BigInt,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 0},clearInterval(){},setTimeout(){return 0},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'},performance:{now(){return 0}},requestAnimationFrame(){}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 const R={};
 // 1. 金币公式四例（用户给的例子：起始72）
 R.coins={};
 const start=72;
 for(const reached of [115,92,82,75]) R.coins[reached]=calcCoinsEarned(reached,start);
 // 2. 边界：刚好打20关 / 打19关
 R.boundary={exact20:calcCoinsEarned(92,72), played19:calcCoinsEarned(91,72), played0:calcCoinsEarned(72,72)};
 // 3. 心情减伤
 R.reduction={m500:moodBurnReduction(500),m1000:moodBurnReduction(1000),m3000:moodBurnReduction(3000),m9000:moodBurnReduction(9000),m20000:moodBurnReduction(20000)};
 // 4. 技能解锁
 R.skills={s7999:hasSteadfast(7999),s8000:hasSteadfast(8000),h19999:hasHardShield(19999),h20000:hasHardShield(20000)};
 // 5. 每日衰减：构造 now 与 lastDecay
 function decayTest(level,mood,lastDecay,nowH,nowDay){
   const now=new Date(2026,10,nowDay,nowH,0,0).getTime();
   const v={coins:0,petLevel:level,mood:mood,lastDecay:lastDecay};
   applyDailyDecay(v,now);
   return Math.round(v.mood*10)/10;
 }
 const baseDay=20;
 const day3=new Date(2026,10,baseDay,3,0,0).getTime();
 const day19=new Date(2026,10,baseDay-1,19,0,0).getTime();
 R.decay={
   // 等级1 k=4.5%, 从125起，跨1个3点 -> 125*0.955=119.4
   oneDay:decayTest(1,125,day3,10,baseDay+1),
   // 同一天19点，3点已过，不衰减
   sameDay:decayTest(1,125,day3,19,baseDay),
   // 下限100：连续衰减
   floor:decayTest(1,101,day3,10,baseDay+30)
 };
 // 6. 等级表
 R.levels={};for(let l=1;l<=10;l++)R.levels[l]=PET_LEVELS[l];
 return R;
})()`;
const R=vm.runInContext(src,sb);
console.log('金币四例:',JSON.stringify(R.coins));
console.log('边界:',JSON.stringify(R.boundary));
console.log('减伤:',JSON.stringify(R.reduction));
console.log('技能:',JSON.stringify(R.skills));
console.log('衰减:',JSON.stringify(R.decay));
let fail=false;
// 校验金币例子（×2后）: 230,184,46,4
if(R.coins[115]!==230||R.coins[92]!==184||R.coins[82]!==46||R.coins[75]!==4){console.log('✗ 金币公式不符');fail=true;}
if(R.boundary.played0!==0){console.log('✗ 打0关应得0金币');fail=true;}
// 减伤: m1000=0.3, m3000=1.0, m9000=3.0(封顶), m20000=3
if(R.reduction.m500!==0||R.reduction.m1000!==0.3||R.reduction.m3000!==1||R.reduction.m9000!==3||R.reduction.m20000!==3){console.log('✗ 减伤错误');fail=true;}
if(R.skills.s7999||!R.skills.s8000||R.skills.h19999||!R.skills.h20000){console.log('✗ 技能解锁错误');fail=true;}
if(R.decay.oneDay!==119.4||R.decay.sameDay!==125||R.decay.floor!==100){console.log('✗ 衰减错误');fail=true;}
if(fail)throw new Error('v7.0验证失败');
console.log('[✓] 纯逻辑全部通过');
