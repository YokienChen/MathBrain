const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
const s=html.indexOf('/* ================= 比大小模式：出题系统');
const e=html.indexOf('/* ================= DOM',s);
let code=html.slice(s,e);
const gi=html.indexOf('function getRandomInt');
const getRI=html.slice(gi,html.indexOf('\n}',gi)+2);
const ctx={console,Math,JSON,Object,Array,Number,String,noSpecialCount:0,noDoubleExpCount:0,currentProblem:'',currentAnswer:'',getRandomInt:(a,b)=>Math.floor(Math.random()*(b-a+1))+a};
vm.createContext(ctx);
vm.runInContext(getRI+'\n'+code+'\nthis.__api={generateCompare,compareRatio,compareCap,exprStr,exprVal};',ctx);
const api=ctx.__api;
let pass=0,fail=0;
function ok(n,c,x){if(c){pass++;console.log('  ✓ '+n+(x?'  '+x:''));}else{fail++;console.log('  ✗ '+n+(x?'  '+x:''));}}

console.log('\n=== 1. 比例分档 ===');
const expect={100:[0.92,0.97],115:[0.92,0.97],129:[0.92,0.97],130:[0.94,0.98],145:[0.94,0.98],159:[0.94,0.98],160:[0.96,0.98],175:[0.96,0.98],189:[0.96,0.98],190:[0.97,0.985],205:[0.97,0.985],219:[0.97,0.985],220:[0.98,0.99],250:[0.98,0.99],300:[0.98,0.99]};
for(const [st,ex] of Object.entries(expect)){
  const r=api.compareRatio(+st);
  ok(st+'关 → ['+ex+']', Math.abs(r[0]-ex[0])<1e-9&&Math.abs(r[1]-ex[1])<1e-9, '实际['+r+']');
}

// 解析题目字符串并计算两端值（支持 整数/π/e、+ × ^）
function evalSide(str){
  str=str.trim();
  // π 或 e 是常数节点，视为数值参与运算
  const m=str.match(/^(.+?)\s*([+×^])\s*(.+)$/);
  if(!m) return parseFloat(str.replace('π','3.14').replace('e','2.72'));
  const a=parseFloat(m[1].replace('π','3.14').replace('e','2.72'));
  const b=parseFloat(m[3].replace('π','3.14').replace('e','2.72'));
  if(m[2]==='+')return a+b;
  if(m[2]==='×')return a*b;
  if(m[2]==='^')return Math.pow(a,b);
  return NaN;
}
console.log('\n=== 2. 高关卡题目质量（各5000题）===');
for(const st of [160,190,220,260]){
  const cap=api.compareCap(st), floor=Math.floor(0.6*cap);
  let c2=0, badRatio=0, badScale=0, badAns=0, n=5000, ratioSum=0, minR=1, valid=0;
  for(let i=0;i<n;i++){
    ctx.noSpecialCount=0;ctx.noDoubleExpCount=0;
    api.generateCompare(st,st);
    const cp=ctx.currentProblem, ans=ctx.currentAnswer;
    if(/\b2 \^ 2\b/.test(cp)) c2++;
    const parts=cp.split(' ？ ');
    const lv=evalSide(parts[0]), rv=evalSide(parts[1]);
    const rel=Math.abs(lv-rv)/Math.max(Math.abs(lv),Math.abs(rv),1);
    const computed=(rel<1e-10)?'=':(lv>rv?'>':'<');
    if(computed!==ans) badAns++;
    const big=Math.max(lv,rv),small=Math.min(lv,rv);
    const ratio=small/big;
    if(big<floor*0.99||big>cap*1.01) badScale++;
    // 送分题判据：比例过低（<0.4）
    if(ans!=='='&&ratio<0.4) badRatio++;
    if(ans!=='='){ratioSum+=ratio;minR=Math.min(minR,ratio);valid++;}
  }
  const avgR=ratioSum/valid;
  ok(st+'关 无2²送分题', c2===0, '出现'+c2+'次');
  ok(st+'关 无低比例(<0.4)题', badRatio===0, '出现'+badRatio+'次');
  ok(st+'关 两边量级合理(≥floor)', badScale===0, '异常'+badScale+'次');
  ok(st+'关 答案与数值一致', badAns===0, '错误'+badAns+'次');
  ok(st+'关 平均比例≥0.8', avgR>=0.8, 'avg='+avgR.toFixed(3)+' min='+minR.toFixed(3));
}

console.log('\n=== 3. π/e 注入题不算错 ===');
let piCount=0,piBadAns=0;
for(let i=0;i<5000;i++){
  ctx.noSpecialCount=0;ctx.noDoubleExpCount=0;
  api.generateCompare(190,190);
  const cp=ctx.currentProblem;
  if(/π|e/.test(cp)){
    piCount++;
    const parts=cp.split(' ？ ');
    // π/e 用近似值判断方向（容许等值容差）
    const lv=evalSide(parts[0]),rv=evalSide(parts[1]);
    const rel=Math.abs(lv-rv)/Math.max(Math.abs(lv),Math.abs(rv),1);
    const computed=rel<0.002?'=':(lv>rv?'>':'<');
    if(computed!==ctx.currentAnswer) piBadAns++;
  }
}
ok('π/e题答案合理', piBadAns<=piCount*0.02, 'π/e题'+piCount+' 疑似不符'+piBadAns);

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
