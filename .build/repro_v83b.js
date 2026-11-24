const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
const s=html.indexOf('/* ================= 比大小模式：出题系统');
const e=html.indexOf('/* ================= DOM',s);
let code=html.slice(s,e);
const gi=html.indexOf('function getRandomInt');
const getRI=html.slice(gi,html.indexOf('\n}',gi)+2);
const ctx={console,Math,JSON,Object,Array,Number,String,noSpecialCount:0,noDoubleExpCount:0,currentProblem:'',currentAnswer:'',getRandomInt:(a,b)=>Math.floor(Math.random()*(b-a+1))+a};
vm.createContext(ctx);
vm.runInContext(getRI+'\n'+code+'\nthis.__api={generateCompare};',ctx);
const stage=190, samples={};
for(let i=0;i<8000;i++){
  ctx.noSpecialCount=0;ctx.noDoubleExpCount=0;
  ctx.__api.generateCompare(stage,stage);
  const cp=ctx.currentProblem;
  if(/\b2 \^ 2\b/.test(cp)){
    samples[cp]=(samples[cp]||0)+1;
  }
}
const arr=Object.entries(samples).sort((a,b)=>b[1]-a[1]);
console.log('不同2²题目种类:',arr.length);
console.log('Top 15 样例:');
arr.slice(0,15).forEach(([k,v])=>console.log('  '+String(v).padStart(4)+'x  '+k+'  ans='+ctx.currentAnswer));
