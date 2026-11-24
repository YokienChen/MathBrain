const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
const s=html.indexOf('/* ================= 比大小模式：出题系统');
const e=html.indexOf('/* ================= DOM',s);
let code=html.slice(s,e);
const gi=html.indexOf('function getRandomInt');
const giEnd=html.indexOf('\n}',gi)+2;
const getRI=html.slice(gi,giEnd);
const ctx={console,Math,JSON,Object,Array,Number,String,
  noSpecialCount:0,noDoubleExpCount:0,currentProblem:'',currentAnswer:'',
  getRandomInt:(a,b)=>Math.floor(Math.random()*(b-a+1))+a};
vm.createContext(ctx);
vm.runInContext(getRI+'\n'+code+'\nthis.__api={generateCompare};',ctx);
const api=ctx.__api;

for(const stage of [100,130,160,190,220,260]){
  let c2=0, smallPow=0, total=30000;
  for(let i=0;i<total;i++){
    ctx.noSpecialCount=0; ctx.noDoubleExpCount=0;
    api.generateCompare(stage,stage);
    const cp=ctx.currentProblem||'';
    if(/\b2 \^ 2\b/.test(cp)) c2++;
    // 检测任何指数<=2的小幂 vs 普通两三位数（送分题特征）
    if(/(^| )2 \^ 2 /.test(cp)) smallPow++;
  }
  console.log('关卡',String(stage).padStart(3),'2²出现',String(c2).padStart(5),'/',total,'=',(c2/total*100).toFixed(2)+'%');
}
