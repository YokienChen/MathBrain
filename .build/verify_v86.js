// v8.6 验证：排行榜名次随心情递减（修复卡在634083）、扣血=21.6%最大生命值
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log('  ✓ '+name+(extra?'  '+extra:''));}else{fail++;console.log('  ✗ '+name+(extra?'  '+extra:''));} }

// 提取排行榜区块
const rankBlock=html.slice(html.indexOf('const RANK_N='),html.indexOf('function fmtRank'));
const sandbox={console,Math,JSON,Number,Array,Object,String};
vm.createContext(sandbox);
vm.runInContext(rankBlock+'\nthis.__api={RANK_N,rankOf,pctOf,moodToLevel,rankPassed,rankLevelCap};',sandbox);
const a=sandbox.__api;

console.log('\n=== 1. 修复核心：名次随心情严格递减 ===');
const moods=[20200,20400,20600,20800,21000,22000,23000,24000,25000,25080,25260,25570,25680];
let prev=Infinity,mono=true;
for(const m of moods){
  const r=Math.round(a.rankOf(m));
  const pct=a.pctOf(m);
  console.log('  心情'+String(m).padStart(5)+' → 名次'+String(r).padStart(7)+' → 超过'+pct+'%');
  if(r>prev) mono=false;
  prev=r;
}
ok('名次严格递减（不再卡住）', mono);
ok('20200 名次=634083（锚点保持）', Math.round(a.rankOf(20200))===634083, '→'+Math.round(a.rankOf(20200)));
ok('20800 名次明显优于20200', a.rankOf(20800)<a.rankOf(20200)*0.5, '20800→'+Math.round(a.rankOf(20800)));
ok('20800 不再是634083', Math.round(a.rankOf(20800))!==634083, '→'+Math.round(a.rankOf(20800)));
ok('25080(77关)名次=189', a.rankPassed(77)===189, '→'+a.rankPassed(77));
ok('25260(80关)名次=123', a.rankPassed(80)===123, '→'+a.rankPassed(80));
ok('25680(97关)名次=1', a.rankPassed(97)===1, '→'+a.rankPassed(97));

console.log('\n=== 2. 百分比随心情递增 ===');
ok('20200 超过99.40%', a.pctOf(20200).toFixed(2)==='99.40', a.pctOf(20200)+'%');
ok('20800 超过>99.40%', parseFloat(a.pctOf(20800))>99.40, a.pctOf(20800)+'%');
ok('百分比封顶99.99%', a.pctOf(30000)===99.99, a.pctOf(30000)+'%');
let pctMono=true,pp=0;
for(const m of moods){ const p=parseFloat(a.pctOf(m)); if(p<pp)pctMono=false; pp=p; }
ok('百分比单调不减', pctMono);

console.log('\n=== 3. 心情→等级映射 ===');
ok('20200→11级', a.moodToLevel(20200)===11, '→'+a.moodToLevel(20200));
ok('20800→14级', a.moodToLevel(20800)===14, '→'+a.moodToLevel(20800));
ok('25570→61级', a.moodToLevel(25570)===61, '→'+a.moodToLevel(25570));
ok('25680→68级', a.moodToLevel(25680)===68, '→'+a.moodToLevel(25680));

console.log('\n=== 4. 扣血 = 21.6% 最大生命值 ===');
ok('MAX_LIFE=200', html.includes('const MAX_LIFE = 200'));
ok('扣血用动态公式(v8.7起)', html.includes('MAX_LIFE*lossPct/100'));
ok('动态公式基准仍基于MAX_LIFE=200', html.includes('const MAX_LIFE = 200'));
// v8.7 起扣血改为动态公式，具体见 verify_v87.js
ok('旧绝对值21.6已移除', !html.includes('life-21.6'));
ok('心算错血3不变', html.includes('life=Math.max(0,life-3)'));

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
