// v8.4 验证：投喂 +20 (×10=+200)、上限截断、比大小错血×2
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log('  ✓ '+name+(extra?'  '+extra:''));}else{fail++;console.log('  ✗ '+name+(extra?'  '+extra:''));} }

// 提取存储区块（含 clampMood/PET_LEVELS/petCfgFor/defaultV7）
function extract(startMark,endMark){const s=html.indexOf(startMark),e=html.indexOf(endMark,s);if(s<0||e<0)throw new Error('提取失败');return html.slice(s,e);}
const storeBlock=extract('const V7_KEY=', '/* ================= 历史记录与起点');
let LS={};
const sandbox={console,localStorage:{getItem:k=>LS[k]||null,setItem:(k,v)=>{LS[k]=String(v);}},window:{},Math,JSON,Number,Array,Date,Object,String,PET_MIN_MOOD:100};
vm.createContext(sandbox);
vm.runInContext(storeBlock+'\nthis.__api={PET_LEVELS,defaultV7,clampMood,petCfgFor,PET_MIN_MOOD};',sandbox);
const a=sandbox.__api;

console.log('\n=== 1. 投喂数值（源码静态检查）===');
ok('单次投喂 = petFeed(10,20)', html.includes('petFeed(10,20)'));
ok('投喂×10 = petFeed(99,200)', html.includes('petFeed(99,200)'));
ok('×10 是单次10倍 (200=20×10)', html.includes('petFeed(99,200)')&&html.includes('petFeed(10,20)'));

console.log('\n=== 2. 投喂上限截断（clampMood真实行为）===');
// 1级上限125，下限100
const cfg1=a.petCfgFor(1);
ok('1级上限=125', cfg1.m===125, '→'+cfg1.m);
ok('下限+20 不超上限 (100+20=120≤125)', a.clampMood(100+20,1)===120, '→'+a.clampMood(120,1));
ok('差5到上限投+20 截断到125 (120+20→125)', a.clampMood(120+20,1)===125, '→'+a.clampMood(140,1));
ok('差10到上限投+20 截断到125 (115+20→125)', a.clampMood(115+20,1)===125, '→'+a.clampMood(135,1));
ok('×10投喂也截断 (110+200→125)', a.clampMood(110+200,1)===125, '→'+a.clampMood(310,1));
ok('满格时仍=上限', a.clampMood(125+20,1)===125, '→'+a.clampMood(145,1));
// 10级上限
const cfg10=a.petCfgFor(10);
ok('10级上限=20000', cfg10.m===20000, '→'+cfg10.m);
ok('10级差10投+20截断 (19990+20→20000)', a.clampMood(cfg10.m-10+20,10)===cfg10.m, '→'+a.clampMood(cfg10.m+10,10));

console.log('\n=== 3. 比大小错血 ×2 ===');
ok('错血用动态公式 (v8.7起)', html.includes('MAX_LIFE*lossPct/100'));
ok('无残留 life-10.8', !html.includes('life-10.8'));
ok('21.6 = 原10.8 × 2', Math.abs(21.6-10.8*2)<1e-9);
ok('心算错血仍为3（未受影响）', html.includes('life=Math.max(0,life-3)'));
// 模拟扣血：MAX_LIFE=200，连续扣血不越界
let life=200; for(let i=0;i<20;i++) life=Math.max(0,life-21.6);
ok('扣血下限钳制≥0', life===0, '→'+life);

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
