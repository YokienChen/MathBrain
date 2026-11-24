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
function evalSide(str){str=str.trim();const m=str.match(/^(.+?)\s*([+×^])\s*(.+)$/);if(!m)return parseFloat(str.replace('π','3.14').replace('e','2.72'));const a=parseFloat(m[1].replace('π','3.14').replace('e','2.72'));const b=parseFloat(m[3].replace('π','3.14').replace('e','2.72'));if(m[2]==='+')return a+b;if(m[2]==='×')return a*b;if(m[2]==='^')return Math.pow(a,b);return NaN;}
let shown=0;
for(let i=0;i<30000 && shown<20;i++){
  ctx.noSpecialCount=0;ctx.noDoubleExpCount=0;
  ctx.__api.generateCompare(190,190);
  const cp=ctx.currentProblem, ans=ctx.currentAnswer;
  const parts=cp.split(' ？ ');
  const lv=evalSide(parts[0]),rv=evalSide(parts[1]);
  const computed=lv>rv?'>':(lv<rv?'<':'=');
  if(computed!==ans){
    console.log('题:'+cp+'  标答:'+ans+'  计算:'+computed+'  L='+lv.toExponential(6)+' R='+rv.toExponential(6)+'  差='+(lv-rv).toExponential(3));
    shown++;
  }
}
