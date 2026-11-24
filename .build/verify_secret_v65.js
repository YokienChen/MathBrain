const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},removeEventListener(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]}}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}},
  setInterval(){return 0},clearInterval(){},setTimeout(){return 0},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
console.log('[1] 语法 OK');
const src=`
(function(){
 const R={};
 // 加成表抽查
 R.bonus={};
 for(const k of [1,5,6,10,11,20,30,31,32,33,34,35,36,41,42,43,49,50]) R.bonus[k]=secretBonuses(k);
 let hp=1791, limitAt=null;
 for(let k=42;k<=120;k++){ hp=Math.min(3900,Math.round(hp*1.04)); if(hp===3900&&limitAt===null) limitAt=k; }
 R.hpLimitAt=limitAt;
 // 隐藏分
 R.hidden={k1:[1,2,20,21,22,40].map(i=>secretHiddenScore(1,i)),k41:[1,2,20,21,22,40].map(i=>secretHiddenScore(41,i))};
 // 上限表边界
 R.caps=[10,11,25,26,50,51,100,101,150,151,200,201,250,251,300,301,350,351,400,401,500,501,600,601,700,701,800,801,900,901,1000,1001,1150,1151,1300,1301,1500,1501,1750,1751,2000,2001,2250,2251,2500,2501,2750,2751,3000,3001].map(h=>[h,secretAnswerCap(h)]);
 // 题型表
 R.types=[1,200,201,500,501,1000,1001,5000].map(h=>[h,secretAllowedTypes(h)]);
 // 星级线
 R.lines={};for(const k of [1,5,6,20,31,41,42,61,80]) R.lines[k]=secretStarLines(k);
 // 特殊题唯一性大样本
 let sp=0,spBad=0,spHintOver=0,hintCounts={};
 const ns={v:0};
 for(let t=0;t<3000;t++){
   const k=1+Math.floor(Math.random()*60), i=1+Math.floor(Math.random()*70);
   const q=generateSecretProblem(k,i,ns);
   if(!q||!q.answer||!q.text) continue;
   if(q.special){
     sp++;
     const cands=[];
     for(let d=0;d<=9;d++){
       let expr=q.text.replace('🔥',String(d)).replace(/×/g,'*').replace(/\\s/g,'');
       expr=expr.replace(/(^|[^\w.])0+(\d)/g,'$1$2');
       try{ cands.push(Function('return '+expr)()); }catch(e){ cands.push(NaN); }
     }
     const filtered=cands.filter(v=>q.hints.every(h=>secretDigitAt(v,h.p)===h.v));
     if(filtered.length!==1||filtered[0]!==q.answer) spBad++;
     hintCounts[q.hints.length]=(hintCounts[q.hints.length]||0)+1;
     if(q.hints.length>4) spHintOver++;
   }
 }
 R.special={sp,spBad,spHintOver,hintCounts};
 // v6.5 专项：🔥隐藏位分布 + 各题型答案上限
 let posCount={0:0,1:0,2:0}, typeAns={4:[],5:[],6:[],7:[]};
 const ns3={v:0};
 for(let t=0;t<8000;t++){
   const q=generateSecretProblem(60,1+(t%120),ns3);
   if(!q||!q.special) continue;
   const m=q.text.match(/(\d*)🔥(\d*)/);
   if(m){ const p=m[2].length; posCount[p]=(posCount[p]||0)+1; }
 }
 // 直接调用 secretMakeSpecial 按题型采样答案上限
 for(const ty of [4,5,6,7]){
   let a=0;
   for(let t=0;t<400;t++){ const qq=secretMakeSpecial(ty,60,2800); if(qq&&qq.answer>a) a=qq.answer; }
   typeAns[ty]=a;
 }
 R.v65={posCount,typeAns};
 // 普通题答案=表达式值
 let norm=0,normBad=0;
 for(let t=0;t<3000;t++){
   const k=1+Math.floor(Math.random()*60), i=1+Math.floor(Math.random()*30);
   const q=generateSecretProblem(k,i,{v:0});
   if(!q||q.special) continue;
   let expr=q.text.replace(/×/g,'*').replace(/\\s/g,'');
   expr=expr.replace(/(^|[^\w.])0+(\d)/g,'$1$2');
   let v; try{ v=Function('return '+expr)(); }catch(e){ continue; }
   norm++; if(v!==q.answer) normBad++;
 }
 R.normal={norm,normBad};
 // 保底：h>=501 连续两题不出必出
 const ns2={v:0}; let forced=0,forcedOk=0,rateHit=0,rateTotal=0;
 for(let t=0;t<3000;t++){
   const idx=1+(t%100);
   const before=ns2.v;
   const q=generateSecretProblem(60,idx,ns2);
   if(before>=2 && secretHiddenScore(60,idx)>=501){forced++;if(q.special)forcedOk++;}
   if(ns2.v===0)rateHit++; rateTotal++;
 }
 R.guarantee={forced,forcedOk,rate:(rateHit/rateTotal).toFixed(3)};
 return R;
})()`;
const R=vm.runInContext(src,sb);
console.log('[2] 加成表:',JSON.stringify(R.bonus));
console.log('[3] 血量加成达上限关卡:',R.hpLimitAt);
console.log('[4] 隐藏分:',JSON.stringify(R.hidden));
console.log('[5] 上限表:',JSON.stringify(R.caps));
console.log('[6] 题型:',JSON.stringify(R.types));
console.log('[7] 星级线:',JSON.stringify(R.lines));
console.log('[8] 特殊题:',JSON.stringify(R.special));
console.log('[9] 普通题:',JSON.stringify(R.normal));
console.log('[11] v6.5专项:',JSON.stringify(R.v65));
console.log('[10] 保底:',JSON.stringify(R.guarantee));
let fail=false;
if(R.special.spBad>0||R.special.spHintOver>0){console.log('✗ 特殊题唯一性失败');fail=true;}
if(R.normal.normBad>0){console.log('✗ 普通题答案不符');fail=true;}
if(R.guarantee.forced>0&&R.guarantee.forcedOk!==R.guarantee.forced){console.log('✗ 保底失败');fail=true;}
const dmgTabs={1:0,5:0,6:1,10:5,11:7,20:24,30:62,31:70,32:80,33:90,34:100,35:120,36:140,41:240,42:260,43:280,49:400,50:400};
for(const k in dmgTabs){ if(R.bonus[k].dmg!==dmgTabs[k]){console.log('✗ 伤害加成错误 @'+k+' 期望'+dmgTabs[k]+' 实际'+R.bonus[k].dmg);fail=true;} }
const hpTabs={6:10,30:627,31:690,41:1791};
for(const k in hpTabs){ if(R.bonus[k].hp!==hpTabs[k]){console.log('✗ 血量加成被改动 @'+k+' 期望'+hpTabs[k]+' 实际'+R.bonus[k].hp);fail=true;} }
if(R.lines[80].need!==80){console.log('✗ 80关题数错误');fail=true;}
if(fail) throw new Error('验证失败');
console.log('[✓] 全部断言通过');
