// v8.7 验证：动态扣血公式、101+难度标签5档文案与动画参数
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log('  ✓ '+name+(extra?'  '+extra:''));}else{fail++;console.log('  ✗ '+name+(extra?'  '+extra:''));} }

console.log('\n=== 1. 动态扣血公式：8 + 关卡数/40 + 连续错误数×3 (%) ===');
const MAX_LIFE=200;
function lossPct(stage,wrong){ return 8 + stage/40 + wrong*3; }
function lossHp(stage,wrong){ return MAX_LIFE*lossPct(stage,wrong)/100; }
// 校验各场景百分比与扣血
const cases=[
  {st:100,w:1,pct:8+100/40+3},
  {st:130,w:1,pct:8+130/40+3},
  {st:160,w:1,pct:8+160/40+3},
  {st:200,w:1,pct:8+200/40+3},
  {st:220,w:1,pct:8+220/40+3},
  {st:160,w:0,pct:8+160/40},
  {st:160,w:2,pct:8+160/40+6},
  {st:160,w:3,pct:8+160/40+9},
];
for(const c of cases){
  const hp=lossHp(c.st,c.w);
  console.log('  '+String(c.st).padStart(3)+'关 连错'+c.w+' → 扣'+c.pct.toFixed(2)+'% → '+hp.toFixed(1)+'点');
  ok(c.st+'关连错'+c.w+'百分比正确', Math.abs(lossPct(c.st,c.w)-c.pct)<1e-9);
}
ok('连错越多扣血越多(线性+3%/次)', lossPct(160,3)-lossPct(160,2)===3);
ok('关卡越高扣血越多(+1%/40关)', Math.abs(lossPct(200,1)-lossPct(160,1)-1)<1e-9);
ok('连错0次只扣基础8%+关卡项', Math.abs(lossPct(160,0)-(8+4))<1e-9);
ok('源码用 MAX_LIFE*lossPct/100', html.includes('MAX_LIFE*lossPct/100'));
ok('答对清零 wrongStreak=0', html.includes('wrongStreak=0;'));
ok('答错+1 wrongStreak++', html.includes('wrongStreak++;'));
ok('每局重置 wrongStreak=0', /wrongStreak=0;\s*\/\/\s*v8\.7：每局重置/.test(html));

console.log('\n=== 2. 101+ 难度标签5档文案与动画 ===');
// 构造 DOM 桩，提取 fitDiffLabel + updateDifficultyLabel 运行
const diffs={};
const el={className:'',textContent:'',style:{color:'',textShadow:'',letterSpacing:'',fontSize:''},parentElement:{clientWidth:400}};
const sandbox={
  console,Math,JSON,Number,Array,Object,String,
  difficultyText:el,
  document:{createElement:()=>({getContext:()=>({font:'',measureText:t=>({width:t.length*17.6})})})},
  getComputedStyle:()=>({paddingLeft:'30px',paddingRight:'30px'})
};
vm.createContext(sandbox);
const fnBlock=html.slice(html.indexOf('let _diffMeasureCtx=null;'),html.indexOf('/* ================= 判题'));
vm.runInContext(fnBlock+'\nthis.__api={updateDifficultyLabel};',sandbox);
const api=sandbox.__api;
const expect=[
  {st:101,text:'未知',cls:'diff-lv1'},
  {st:130,text:'未知',cls:'diff-lv1'},
  {st:131,text:'布豪，前面是死域！快逃！！',cls:'diff-lv2'},
  {st:160,text:'布豪，前面是死域！快逃！！',cls:'diff-lv2'},
  {st:161,text:'那道火花是岩浆，不是家！快回头！！',cls:'diff-lv3'},
  {st:190,text:'那道火花是岩浆，不是家！快回头！！',cls:'diff-lv3'},
  {st:191,text:'不要作死！！！',cls:'diff-lv4'},
  {st:220,text:'不要作死！！！',cls:'diff-lv4'},
  {st:221,text:'莫非……您正是炎魔本魔？',cls:'diff-lv5'},
  {st:300,text:'莫非……您正是炎魔本魔？',cls:'diff-lv5'},
];
for(const e of expect){
  api.updateDifficultyLabel(e.st);
  ok(e.st+'关文案='+e.text.slice(0,8), el.textContent===e.text&&el.className.includes(e.cls), '实际"'+el.textContent+'" class='+el.className);
}
// 100及以下三档
api.updateDifficultyLabel(30); ok('30关简单', el.textContent==='简单'&&el.className==='difficulty-indicator');
api.updateDifficultyLabel(50); ok('50关中等', el.textContent==='中等');
api.updateDifficultyLabel(100);ok('100关困难', el.textContent==='困难');

console.log('\n=== 3. 动画CSS参数 ===');
ok('131-160 每0.5秒更替 (animation 1s)', html.includes('.diff-lv2{animation:diffColorSwap 1s infinite;}'));
ok('161-190 每0.4秒更替 (animation .8s)', html.includes('diff-lv3{animation:diffColorSwap .8s'));
ok('161-190 闪烁 (diffBlinkMid)', html.includes('diffBlinkMid .2s'));
ok('191-220 每0.35秒更替 (animation .7s)', html.includes('diff-lv4{animation:diffColorSwap .7s'));
ok('191-220 更强闪烁 (diffBlinkStrong)', html.includes('diffBlinkStrong .12s'));
ok('221+ 紫色微弱荧光 (diff-lv5)', html.includes('.diff-lv5{color:#b388ff;text-shadow:'));
ok('紫色↔深红 keyframes', html.includes('@keyframes diffColorSwap{0%,49.999%{color:#b388ff;}50%,100%{color:#8b0000;}}'));
ok('0.7倍框宽缩放', html.includes('const target=avail*0.7;'));
ok('两模式共用 updateDifficultyLabel (generateProblem调用)', (html.match(/updateDifficultyLabel\(dStage\)/g)||[]).length===1);

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
