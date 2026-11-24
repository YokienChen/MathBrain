const fs=require('fs'), vm=require('vm');
const p='C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html';
const html=fs.readFileSync(p,'utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m) throw new Error('script not found');
const code=m[1];

function fakeEl(){
  return {
    style:{}, dataset:{}, children:[], value:'', textContent:'', innerHTML:'',
    classList:{add(){},remove(){},toggle(){},contains(){return false;}},
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){},
    setAttribute(){}, getAttribute(){return null;}, focus(){}, blur(){},
    getBoundingClientRect(){return {left:0,top:0,width:100,height:100};},
    querySelector(){return fakeEl();}, querySelectorAll(){return [];}
  };
}
const els={}, store={};
const document={
  getElementById(id){return els[id]||(els[id]=fakeEl());},
  createElement(){return fakeEl();}, addEventListener(){}, body:fakeEl(), documentElement:fakeEl()
};
const sandbox={
  document, console, Math, Date, JSON, Number, String, Array, Object,
  parseInt, parseFloat, isNaN, isFinite,
  localStorage:{getItem(k){return k in store?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  AndroidStore:{getHistory(){return null;},setHistory(){}},
  setInterval(){return 0;}, clearInterval(){}, setTimeout(){return 0;}, clearTimeout(){},
  alert(){}, confirm(){return false;}, navigator:{userAgent:'node'}
};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(code,sandbox,{filename:'game.js'});
console.log('[1] 脚本语法检查: OK');

const testSrc=`
(function(){
  const res={};
  let c23=0,c34=0,cOther=0;
  for(let i=0;i<100000;i++){
    const p=pickExpPair();
    if(p.x===2&&p.y===3)c23++; else if(p.x===3&&p.y===4)c34++; else cOther++;
  }
  res.dist={c23,c34,cOther};

  res.perStage={};
  for(const st of [81,91,101,121,151]){
    const cap=compareCap(st), floor=Math.floor(0.6*cap);
    const rr=compareRatio(st), lo=Math.max(0.4,rr[0]-0.05), hi=rr[1];
    let badPair=0,badAns=0,badRange=0,badRatio=0,eq=0;
    const dist={c23:0,c34:0,other:0};
    for(let i=0;i<2000;i++){
      const pair=pickExpPair();
      const core=buildCompareCore(st,{left:'pow',right:'pow'},cap,floor,lo,hi,{expPair:pair});
      const exps=[core.leftExpr.b.v,core.rightExpr.b.v].sort((a,b)=>a-b);
      const want=[pair.x,pair.y].sort((a,b)=>a-b);
      if(exps[0]!==want[0]||exps[1]!==want[1]) badPair++;
      const lv=exprVal(core.leftExpr),rv=exprVal(core.rightExpr);
      const ans=lv>rv?'>':(lv<rv?'<':'=');
      if(ans!==core.answer) badAns++;
      if(ans==='=') eq++;
      else{
        const big=Math.max(lv,rv),small=Math.min(lv,rv);
        if(big<floor-1e-6||big>cap+1e-6) badRange++;
        const ratio=small/big;
        if(ratio<lo-1e-9||ratio>hi+1e-9) badRatio++;
      }
      if(want[0]===2&&want[1]===3)dist.c23++;
      else if(want[0]===3&&want[1]===4)dist.c34++;
      else dist.other++;
    }
    res.perStage[st]={badPair,badAns,badRange,badRatio,eq,dist};
  }

  const gd={c23:0,c34:0,other:0,notDouble:0};
  for(let i=0;i<3000;i++){
    noDoubleExpCount=3;
    generateCompare(110,110);
    const mm=currentProblem.match(/\\^/g);
    if(!mm||mm.length!==2){gd.notDouble++;continue;}
    const ns=(currentProblem.match(/\\^\\s*(\\d+)/g)||[]).map(s=>Number(s.replace(/[^0-9]/g,''))).sort((a,b)=>a-b);
    if(ns[0]===2&&ns[1]===3)gd.c23++; else if(ns[0]===3&&ns[1]===4)gd.c34++; else gd.other++;
  }
  res.force=gd;
  return res;
})()
`;
const res=vm.runInContext(testSrc,sandbox);
console.log('[2] pickExpPair 10万次分布:',JSON.stringify(res.dist));
for(const [st,v] of Object.entries(res.perStage)) console.log('[3] 关卡'+st+':',JSON.stringify(v));
console.log('[4] 保底强制双指数 3000 局:',JSON.stringify(res.force));
const d=res.dist, total=d.c23+d.c34+d.cOther;
const r23=d.c23/total, r34=d.c34/total;
if(Math.abs(r23-0.40)>0.01||Math.abs(r34-0.30)>0.01) throw new Error('分布偏差过大');
for(const v of Object.values(res.perStage)){
  if(v.badPair||v.badAns||v.badRange) throw new Error('题目校验失败: '+JSON.stringify(v));
}
if(res.force.notDouble) throw new Error('保底未触发双指数');
console.log('[5] 全部断言通过');
