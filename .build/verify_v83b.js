// 精确验证：直接调用内部函数，用真实 exprVal 计算（避免字符串解析精度丢失）
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
const s=html.indexOf('/* ================= 比大小模式：出题系统');
const e=html.indexOf('/* ================= DOM',s);
let code=html.slice(s,e);
const gi=html.indexOf('function getRandomInt');
const getRI=html.slice(gi,html.indexOf('\n}',gi)+2);
const ctx={console,Math,JSON,Object,Array,Number,String,noSpecialCount:0,noDoubleExpCount:0,currentProblem:'',currentAnswer:'',getRandomInt:(a,b)=>Math.floor(Math.random()*(b-a+1))+a};
vm.createContext(ctx);
vm.runInContext(getRI+'\n'+code+'\nthis.__api={generateCompare,compareCap,exprStr,exprVal,buildCompareCore,pickCompareType,compareRatio};',ctx);
const api=ctx.__api;
let pass=0,fail=0;
function ok(n,c,x){if(c){pass++;console.log('  ✓ '+n+(x?'  '+x:''));}else{fail++;console.log('  ✗ '+n+(x?'  '+x:''));}}

// 直接批量调 buildCompareCore（绕过 π/e 注入，专注核心题），用真实 exprVal 校验
console.log('\n=== 核心题质量（真实exprVal，每关8000题）===');
for(const st of [160,190,220,260]){
  const cap=api.compareCap(st), floor=Math.floor(0.6*cap);
  const [lo,hi]=api.compareRatio(st);
  let c2=0,badRatio=0,badScale=0,badAns=0,dup=0,n=8000,ratioSum=0,valid=0,minR=1;
  for(let i=0;i<n;i++){
    const type=api.pickCompareType(st);
    const opts=(type.left==='pow'&&type.right==='pow')?{expPair:{x:2,y:3}}:{};
    const core=api.buildCompareCore(st,type,cap,floor,lo,hi,opts);
    const L=api.exprStr(core.leftExpr),R=api.exprStr(core.rightExpr);
    if(/\b2 \^ 2\b/.test(L)||/\b2 \^ 2\b/.test(R)) c2++;
    if(L===R) dup++;
    const lv=api.exprVal(core.leftExpr),rv=api.exprVal(core.rightExpr);
    const big=Math.max(lv,rv),small=Math.min(lv,rv);
    const eqTol=Math.max(1,Math.max(Math.abs(lv),Math.abs(rv))*1e-9);
    const computed=Math.abs(lv-rv)<eqTol?'=':(lv>rv?'>':'<');
    if(computed!==core.answer) badAns++;
    if(big<floor-1||big>cap+1) badScale++;
    if(core.answer!=='='){const ratio=small/big;if(ratio<0.4)badRatio++;ratioSum+=ratio;minR=Math.min(minR,ratio);valid++;}
  }
  ok(st+'关 无2²', c2===0, c2+'次');
  ok(st+'关 无悬殊比例', badRatio===0, badRatio+'次');
  ok(st+'关 量级∈[floor,cap]', badScale===0, badScale+'次');
  ok(st+'关 答案自洽', badAns===0, badAns+'次');
  ok(st+'关 两边不雷同', dup===0, dup+'次');
  ok(st+'关 平均比例≥0.9', ratioSum/valid>=0.9, 'avg='+(ratioSum/valid).toFixed(3)+' min='+minR.toFixed(3));
}
console.log('\n=== 结果 ===');console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
