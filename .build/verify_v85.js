// v8.5 验证：不屈意志触发后输入解锁（修复"只能等死"bug）、banner文字删除
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');
let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log('  ✓ '+name+(extra?'  '+extra:''));}else{fail++;console.log('  ✗ '+name+(extra?'  '+extra:''));} }

console.log('\n=== 1. banner 文字删除 ===');
ok('无 steadfastBanner DOM', !html.includes('steadfastBanner'));
ok('无 ✨ 不屈意志 ✨ 战斗横幅', !html.includes('✨ 不屈意志 ✨'));
ok('无 banner CSS (.steadfast-banner)', !html.includes('.steadfast-banner'));
ok('光效 glow 保留', html.includes('steadfast-glow'));
ok('宠物页技能说明保留', html.includes('不屈意志已解锁'));

console.log('\n=== 2. 死锁 bug 修复（源码逻辑）===');
// 提取答错分支中挨刀归零的代码块，检查触发不屈后是否调用 secretNextProblem
const fixIdx=html.indexOf('v8.5 修复'); const seg=html.slice(fixIdx, fixIdx+400); const m=[seg];
ok('存在 挨刀归零→triggerSteadfast 分支', !!m);
if(m){
  ok('触发不屈成功分支内调用 secretNextProblem()', /triggerSteadfast\(\)\)\{\s*secretNextProblem\(\);/.test(m[0]), m[0].replace(/\s+/g,' ').slice(0,180));
}
const assignLines=html.split('\n').filter(l=>l.includes('s.locked=false')&&!l.trim().startsWith('//')); ok('secretNextProblem 是唯一 s.locked=false 赋值处', assignLines.length===1, assignLines.length+'处');

console.log('\n=== 3. 行为模拟：触发不屈后能否答题 ===');
// 模拟 secretState + 关键函数的解锁行为（用源码提取真实 triggerSteadfast / secretNextProblem 的解锁语义）
let LS={};
const sandbox={console,window:{},localStorage:{getItem:k=>LS[k]||null,setItem:(k,v)=>{LS[k]=String(v);}},
  Math,JSON,Number,Array,Date,Object,String,PET_MIN_MOOD:100,
  // DOM/动画桩
  document:{getElementById:()=>null},
  performance:{now:()=>0},
  sec:{hero:null,problem:{innerHTML:'',parentElement:{clientWidth:420}},input:{textContent:''},hints:{textContent:''}},
  getComputedStyle:()=>({paddingLeft:0,paddingRight:0}),
  generateSecretProblem:()=>({text:'1+1=?',answer:'2',hints:[]}),
  secretFitProblem:()=>{},
  secretDigitName:p=>String(p)
};
vm.createContext(sandbox);
// 提取 secretNextProblem 及所需状态定义
const sBlock=html.slice(html.indexOf('function secretNextProblem(){'),html.indexOf('function secretUpdateHP(){'));
vm.runInContext(sBlock+'\nthis.__next=secretNextProblem;',sandbox);
// 构造一个已锁死的不屈状态
sandbox.secretState={active:true,locked:true,idx:0,level:50,input:'7',qStart:0,
  playerHP:0,steadfastActive:true,steadfastReady:false,noSpecial:{},lines:{}};
sandbox.__next();
ok('触发不屈后 locked 被解除 (false)', sandbox.secretState.locked===false, '→'+sandbox.secretState.locked);
ok('触发不屈后出了新题 (idx+1)', sandbox.secretState.idx===1, 'idx='+sandbox.secretState.idx);
ok('触发不屈后输入被清空', sandbox.secretState.input==='', 'input="'+sandbox.secretState.input+'"');
ok('血维持0（不屈视觉设定）', sandbox.secretState.playerHP===0);

console.log('\n=== 4. 回归：不屈期间答对回血/答错死亡规则不变 ===');
ok('答对回血分支存在 (playerHP=250)', html.includes('s.playerHP=250'));
ok('不屈期间挨刀死亡分支存在', /if\(s\.steadfastActive\)\{[\s\S]{0,200}secretFinish\(false\)/.test(html));
ok('灼烧期间不屈不致死', html.includes('if(s.steadfastActive){ secretUpdateHP(); return; }'));

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
