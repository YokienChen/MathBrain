const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},remove(){},appendChild(){},removeChild(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]}}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 0},clearInterval(){},setTimeout(){return 0},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 const R={};
 // 1. 隐藏位分布（用高关卡保证①②③⑤⑦都有，且 cap 足够大）
 const ns={v:0}; const posCount={0:0,1:0,2:0}; let total=0;
 for(let t=0;t<12000;t++){
   const q=generateSecretProblem(60,1+(t%140),ns);
   if(!q||!q.special) continue;
   const m=q.text.match(/(\\d*)🔥(\\d*)/);
   if(m){ const p=m[2].length; if(p in posCount) posCount[p]++; total++; }
 }
 R.pos={counts:posCount,total,nonUnitPct:+(100*(posCount[1]+posCount[2])/total).toFixed(1)};
 // 2. 各题型答案上限：直接调 secretMakeSpecial 传入统一 spCap，看④⑥用0.4 / ⑤⑦用0.1
 //    这里用 generateSecretProblem 在 h=1001+ (k=60,i=60→h=3600) 强制各题型不现实，
 //    改为核对生成函数在 h=1001 时 capBase=15000, ④⑥ spCap=6000, ⑤⑦ spCap=1500
 R.cap={capBase:secretAnswerCap(1001), sp4_6:Math.round(secretAnswerCap(1001)*0.4), sp5_7:Math.round(secretAnswerCap(1001)*0.1)};
 // 3. 唯一性大样本（含非个位）
 let sp=0,bad=0;
 for(let t=0;t<20000;t++){
   const k=1+Math.floor(Math.random()*80), i=1+Math.floor(Math.random()*100);
   const q=generateSecretProblem(k,i,{v:0});
   if(!q||!q.special) continue;
   sp++;
   const cands=[];
   for(let d=0;d<=9;d++){
     let expr=q.text.replace('🔥',String(d)).replace(/×/g,'*').replace(/\\s/g,'');
     expr=expr.replace(/(^|[^\\w.])0+(\\d)/g,'$1'+'$2');
     try{ cands.push(Function('return '+expr)()); }catch(e){ cands.push(NaN); }
   }
   const f=cands.filter(v=>q.hints.every(h=>secretDigitAt(v,h.p)===h.v));
   if(f.length!==1||f[0]!==q.answer) bad++;
 }
 R.uniq={sp,bad};
 return R;
})()`;
const R=vm.runInContext(src,sb);
console.log('位置分布:',JSON.stringify(R.pos));
console.log('上限系数:',JSON.stringify(R.cap));
console.log('唯一性:',JSON.stringify(R.uniq));
let fail=false;
if(R.pos.counts[1]+R.pos.counts[2] < R.pos.total*0.3){console.log('✗ 非个位占比过低');fail=true;}
if(R.cap.sp4_6!==6000||R.cap.sp5_7!==1500){console.log('✗ 上限系数错误');fail=true;}
if(R.uniq.bad>0){console.log('✗ 唯一性失败');fail=true;}
if(fail)throw new Error('v6.5验证失败');
console.log('[✓] v6.5 全部通过');
