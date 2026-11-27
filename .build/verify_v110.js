/* v1.1.5 终极挑战验证 */
const fs=require('fs'),vm=require('vm');
const root='C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/';
const html=fs.readFileSync(root+'数学_升级版.html','utf8');
const gradle=fs.readFileSync(root+'.build/app/app/build.gradle','utf8');
const java=fs.readFileSync(root+'.build/app/app/src/main/java/com/mathbrain/game/MainActivity.java','utf8');
let pass=0,fail=0;
function ok(c,m){ if(c){pass++;}else{fail++;console.log('FAIL:',m);} }
function close(a,b,tol){ return Math.abs(a-b)<=(tol||1e-6); }

/* ---------- 1. 版本标识 ---------- */
ok(html.includes('<!-- MathBrain v1.1.5 -->'),'HTML顶部v1.1.5');
ok(/versionCode\s+35/.test(gradle),'Gradle versionCode35');
ok(/versionName\s+"1\.1\.5"/.test(gradle),'Gradle versionName1.1.5');
ok(java.includes('return "1.1.5";'),'Bridge version1.1.5');

/* ---------- 2. 页面与DOM ---------- */
['modeUltimate','ultScreen','ultResultScreen','ultStage','ultHpFill','ultHpPct','ultBlueFill','ultBluePct',
 'ultProblem','ultInput','ultBonus','ultKeyboard','ultIceBtn','ultIceCount','ultSaveBtn','ultPauseBtn',
 'ultPausePanel','ultResumeBtn','ultResultStage','ultCooldown','ultBestLabel'].forEach(id=>{
  ok(html.includes('id="'+id+'"'),'DOM#'+id);
});
ok(html.includes('class="mode-card ultimate"'),'主页终极挑战入口');
ok(html.includes('crab-radio')&&html.includes('☢'),'螃蟹肚子放射性图标(画中画叠加)');
ok(html.includes('🦀'),'螃蟹emoji图标');
ok(html.includes('巨型螃蟹'),'名称改为巨型螃蟹');
ok(html.includes('敌方加成：🔪+0%')&&html.includes("'敌方加成：🔪+'"),'敌方加成用秘境同款🔪');
ok(html.includes('crab-emoji-wrap'),'emoji容器样式存在');
ok(!html.includes('crabBody'),'旧SVG螃蟹已移除');

/* ---------- 3. 血条改造 ---------- */
ok(html.includes('class="life-bar-wrap"')&&html.includes('class="life-heart"')&&html.includes('❤️'),'普通模式红心血条');
ok(html.includes('id="lifeValue">100%'),'血条内白字初始100%');
ok((html.match(/lifeValue\.textContent=Math\.round\(life\/MAX_LIFE\*100\)\+'%'/g)||[]).length>=2,'lifeValue赋值带%');
ok(!html.includes('生命 <span id="lifeValue"'),'旧"生命 x%"文本已移除');

/* ---------- 4. 纯逻辑公式（抽取函数执行） ---------- */
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
// 抽取公式函数定义
const fns=['ultAddLimit','ultAddSubProb','ultFactorCap','ultEnemyBonus','ultIsSpecial','ultBlueGain','getRandomInt','ultDigitAt','ultFireNumber','ultFireHTML','ultProblemHTML','ultNewProblem'];
let fsrc='';
for(const fn of fns){
  const re=new RegExp('function '+fn+'\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}','m');
  const m=js.match(re);
  ok(!!m,'函数存在:'+fn);
  if(m) fsrc+=m[0]+'\n';
}
const ctx={Math:Math,BigInt:BigInt,console:console};
vm.createContext(ctx);
vm.runInContext(fsrc,ctx);

// 加减法上限
ok(ctx.ultAddLimit(1)===1,'加数上限 k=1 → 1');
ok(ctx.ultAddLimit(100)===100,'加数上限 k=100 → 100');
ok(close(ctx.ultAddLimit(101),100),'加数上限 k=101 → 100*(1)^0.7=100');
ok(close(ctx.ultAddLimit(149),100*Math.pow(49,0.7),1e-9),'加数上限 k=149 公式');
// 加减法概率
ok(ctx.ultAddSubProb(101)===98,'加减概率 k=101 → 98%');
ok(ctx.ultAddSubProb(149)===2,'加减概率 k=149 → 2%');
ok(ctx.ultAddSubProb(150)===0,'加减概率 k=150 → 0%');
// 因数上限
ok(ctx.ultFactorCap(149)===59,'因数上限 k=149 → 59');
ok(close(ctx.ultFactorCap(150),0.033*Math.pow(150,1.5),1e-9),'因数上限 150-499');
ok(close(ctx.ultFactorCap(499),0.033*Math.pow(499,1.5),1e-9),'因数上限边界499');
ok(close(ctx.ultFactorCap(500),0.0015*500*500,1e-9),'因数上限 500-999');
ok(close(ctx.ultFactorCap(999),0.0015*999*999,1e-9),'因数上限边界999');
ok(close(ctx.ultFactorCap(1000),0.0000015*1e9,1e-9),'因数上限 1000-1999');
ok(close(ctx.ultFactorCap(1999),0.0000015*Math.pow(1999,3),1e-9),'因数上限边界1999');
ok(close(ctx.ultFactorCap(2000),3.75e-13*Math.pow(2000,5),1e-9),'因数上限 2000+');
ok(ctx.ultFactorCap(5000)>ctx.ultFactorCap(2000),'因数上限持续增长');
// 敌方加成
ok(ctx.ultEnemyBonus(1)===1,'加成 k=1 → 1%');
ok(ctx.ultEnemyBonus(100)===100,'加成 k=100 → 100%');
ok(close(ctx.ultEnemyBonus(100),100,1e-9),'加成 k=100 = 100% 与第一段连续');
ok(close(ctx.ultEnemyBonus(101),100*Math.pow(1.14,0.1),1e-9),'加成 101-300 公式(0.1*(k-100))');
ok(close(ctx.ultEnemyBonus(300),100*Math.pow(1.14,20),1e-9),'加成边界300');
ok(close(ctx.ultEnemyBonus(301),141*Math.pow(301,0.4),1e-9),'加成 301+ 公式');
ok(Math.abs(ctx.ultEnemyBonus(301)-ctx.ultEnemyBonus(300))/ctx.ultEnemyBonus(300)<0.05,'加成在300→301平滑衔接(差<5%)');
// 特殊关
ok(!ctx.ultIsSpecial(99)&&!ctx.ultIsSpecial(100),'100以下非特殊');
ok(ctx.ultIsSpecial(102)&&ctx.ultIsSpecial(105),'100-299的3倍数特殊');
ok(!ctx.ultIsSpecial(103),'100-299非3倍数不特殊');
ok(ctx.ultIsSpecial(300)&&ctx.ultIsSpecial(302)&&!ctx.ultIsSpecial(301),'300+仅偶数特殊');
ok(!ctx.ultIsSpecial(303),'300+奇数不特殊');
// 蓝条
ok(close(ctx.ultBlueGain(0),50,1e-9),'蓝条 t=0 → 50%');
ok(close(ctx.ultBlueGain(4),25,1e-9),'蓝条 t=4 → (8-4)*6.25=25%');
ok(close(ctx.ultBlueGain(5),18.75,1e-9),'蓝条 t=5 → 93.75/5=18.75%');
ok(close(ctx.ultBlueGain(10),9.375,1e-9),'蓝条 t=10 → 9.375%');
ok(close(ctx.ultBlueGain(4.999),ctx.ultBlueGain(5.001),0.02),'蓝条在5秒处近似连续');

/* ---------- 4b. v1.1.1 🔥只波及一位数字 ---------- */
ok(ctx.ultFireNumber(1234,0)==='123🔥','火遮个位');
ok(ctx.ultFireNumber(1234,2)==='1🔥34','火遮百位');
ok(ctx.ultFireNumber(7,0)==='🔥','一位数整位遮');
ok(ctx.ultDigitAt(1234,2)===2,'取位数字');
const fq={a:12,b:34,op:'×',ans:408,special:true,hideIdx:0,hidePos:0,revealed:false};
ok(ctx.ultProblemHTML(fq)==='1<span class="fire">🔥</span> × 34','特殊关只藏一位(12→1🔥)');
fq.hidePos=1;
ok(ctx.ultProblemHTML(fq)==='<span class="fire">🔥</span>2 × 34','火遮十位显示');
fq.revealed=true;
ok(ctx.ultProblemHTML(fq)==='12 × 34','冰揭示后完整显示');
fq.revealed=false;fq.wholeHide=true;
ok(ctx.ultProblemHTML(fq)==='<span class="fire">🔥</span> × 34','v1.1.0旧存档整位隐藏兼容');
let digitOk=true,hideCount=0;
for(const k of [102,105,150,300,302,500,1000]){
  for(let i=0;i<40;i++){
    const q=ctx.ultNewProblem(k);
    if(!q.special) continue;
    hideCount++;
    const n=q.hideIdx===0?q.a:q.b;
    if(!(q.hidePos>=0&&q.hidePos<String(n).length)) digitOk=false;
    const shown=ctx.ultFireNumber(n,q.hidePos);
    if(shown.indexOf('🔥')<0||shown.replace('🔥','#').length!==String(n).length) digitOk=false;
  }
}
ok(hideCount>0&&digitOk,'随机出题：🔥只替换一位且位置合法');
ok(html.includes('wholeHide=true'),'旧存档兼容标记');
ok(html.includes('hidePos:s.q.hidePos'),'存档保存隐藏位');

/* ---------- 5. 机制关键字 ---------- */
ok(html.includes('const ULT_MAX_LIFE=150000'),'血量上限150000(v1.1.3)');
ok(html.includes('ULT_COST=1000'),'参与费用1000');
ok(html.includes('22*60*60*1000'),'冷却22小时');
ok(html.includes('s.hp=Math.max(0,s.hp-25)'),'答错扣25血');
ok(html.includes('5*(1+ultEnemyBonus(s.stage)/100)'),'每秒掉血含加成');
ok(html.includes('s.blue+=ultBlueGain(t)')&&html.includes('s.blue-=100; s.ice++'),'蓝条满+1冰');
ok(html.includes('s.ice--; s.q.revealed=true'),'冰消耗与揭示');
ok(html.includes('上一个答案比正确答案大了'),'答错大小提示(大)');
ok(html.includes('上一个答案比正确答案小了'),'答错大小提示(小)');
ok(html.includes('toFixed(1)+\'%\''),'终极红条0.1%');
ok(html.includes('Math.round(s.blue)+\'%\''),'蓝条1%');
ok(html.includes('s.hp/ULT_MAX_LIFE*100'),'HP百分比计算');
// 无回血：终极逻辑里不应有回血
const ultBlock=js.slice(js.indexOf('v1.1.0 终极挑战'),js.indexOf('v1.0.4 防外挂 Guard'));
ok(!/hp\s*=\s*Math\.min\([^,]+,\s*s\.hp\s*\+/.test(ultBlock),'终极挑战无回血');
// 无热身、从第1关开始
ok(/stage:saved\?saved\.stage:1/.test(js),'从第1关开始');
ok(!/ultNewProblem\(warmup/.test(js),'无热身机制');
// 两段式
ok(html.includes('if(s.saveArmed || s.pauseArmed)'),'切题时检查待生效');
ok(html.includes('s.saveArmed=false; ultSaveBtn.classList.remove(\'armed\')'),'保存退出可取消');
// 存档与冷却
ok(html.includes('ULT_KEY=\'mathbrain_ultimate_v1\''),'存档key');
ok(html.includes('meta.save={stage:s.stage,hp:s.hp,ice:s.ice,blue:s.blue'),'保存完整进度');
ok(html.includes('meta.cooldownUntil=Math.max((meta.runStartAt||0)+ULT_CD_MS,Date.now()+ULT_CD_MS)'),'结算设置冷却');
/* ---------- 5b. v1.1.2 存档恢复修复（WebView confirm 被吞） ---------- */
ok(!/\balert\(|\bconfirm\(/.test(js),'彻底移除alert/confirm');
ok(html.includes('id="ultModal"')&&html.includes('function ultShowModal('),'页面内模态框替代confirm');
ok(html.includes('继续第 \'+st+\' 关')&&html.includes('重新开始（覆盖旧进度）'),'续玩/重开双选项明确');
ok(html.includes('function ultWriteSave(s,exitMode)'),'统一存档函数带离场标记');
ok((html.match(/ultWriteSave\(s/g)||[]).length>=4,'答对/答错/保存退出均自动存档');
ok(/if\(!saved\)\{[\s\S]{0,400}v7\.coins-=ULT_COST/.test(js),'续玩不重复扣费(扣费在if(!saved)内)');
const startFn=js.slice(js.indexOf('function ultStart('),js.indexOf('function stopAllScreens('));
ok(!/if\(v7\.coins<ULT_COST\)\{ ultToast/.test(startFn.replace(/if\(!saved\)\{[\s\S]*?\n  \}/,'')),'金币检查仅在开新局分支');
ok(html.includes("t.id='ultToast'")&&html.includes('function ultToast('),'页面内toast替代alert');
ok(html.includes("ultShowModal('发现未完成的挑战'"),'主页检测存档弹窗');
/* ---------- 5c. v1.1.3 修复与平衡性 ---------- */
ok(html.includes('ULT_BLUE_UNLOCK=71'),'蓝条解锁线71关');
ok(html.includes('if(s.stage>=ULT_BLUE_UNLOCK){')&&html.includes('s.blue+=ultBlueGain(t)'),'前70关不累积蓝条');
ok(html.includes('通过70关以解锁'),'前70关蓝条解锁文案');
ok(html.includes("ultBluePct.textContent='通过70关以解锁'"),'前70关蓝条白字');
ok(html.includes('ultProblemEl.style.visibility=\'\';')&&html.includes("if(ultPausePanel) ultPausePanel.style.display='none';"),'ultStart复位题目/控件(修复空白bug)');
ok(html.includes('runStartAt:o.runStartAt||0')&&html.includes('runStartAt:0'),'存档读取runStartAt');
ok(html.includes('meta.runStartAt=Date.now()'),'开局记录时间戳');
ok(html.includes('meta.cooldownUntil=Math.max(meta.cooldownUntil||0,Date.now()+ULT_CD_MS)'),'开局即锁22h');
ok(html.includes('meta.cooldownUntil=Math.max((meta.runStartAt||0)+ULT_CD_MS,Date.now()+ULT_CD_MS)'),'结算CD不早于开局+22h');
ok(html.includes('if(!saved){')&&html.includes('const saved=(resume&&meta.save)?meta.save:null;'),'继续存档在CD检查之前判定');
/* ---------- 5d. v1.1.4 全面排查修复 ---------- */
const keyFn=js.slice(js.indexOf('function ultKey('),js.indexOf('function ultUseIce('));
ok(keyFn.indexOf("if(t==='提交')")<keyFn.indexOf("classList.contains('hint')"),'提交键在hint清空之前处理');
ok(html.includes('// v1.1.4：提交键不受 hint 清除影响'),'hint提交修复注释');
ok(html.includes('s.q===q&&ultInputEl.classList.contains(\'hint\')'),'hint清除增加同题校验');
ok(html.includes('// v1.1.4：2秒后清除提示时，必须确认仍是同一道题'),'hint超时防覆盖注释');
ok(/if\(!s\.pauseArmed\)\{ s\.pauseArmed=true;[\s\S]{0,120}\}\s*else \{ s\.pauseArmed=false; ultPauseBtn\.classList\.remove\('armed'\); \}/.test(js),'暂停第二下为取消(非立即暂停)');
ok(!/else ultApplyPause\(\);\s*\n\}\);\s*\nif\(ultIceBtn\)/.test(js),'暂停事件不再直接ultApplyPause');
/* ---------- 5e. v1.1.5 未暂停杀后台=弃权 ---------- */
ok(html.includes("meta.save={stage:s.stage,hp:s.hp,ice:s.ice,blue:s.blue,q:")&&html.includes("exitMode:exitMode||'active'"),'存档带exitMode标记(默认active)');
ok(html.includes("function ultCheckAbandon()"),'启动弃权检查函数');
ok(html.includes("meta.save.exitMode!=='active'")&&html.includes('meta.save=null;'),'仅active离场删档');
ok(html.includes("meta.cooldownUntil=Math.max((meta.runStartAt||0)+ULT_CD_MS,Date.now()+ULT_CD_MS)")&&html.includes('function ultCheckAbandon'),'弃权进入22h冷却');
ok(html.includes("ultWriteSave(s,'paused')"),'暂停标记paused可续档');
ok(html.includes("ultWriteSave(s,'saved')"),'显式保存退出标记saved可续档');
ok(html.includes("ultWriteSave(ultState,'active')"),'开局/续玩标记active');
ok(html.includes("ultWriteSave(s,'active');   // v1.1.5：继续后恢复"),'暂停继续后恢复active标记');
ok(html.includes('if(ultCheckAbandon()){'),'页面加载即执行弃权检查');
ok(html.includes('检测到未暂停直接退出，本次挑战已作废'),'弃权提示');
ok(html.includes('距下次开放还有'),'冷却倒计时文案');
ok(html.includes('最高达到：第 '),'主页显示最高关卡');
// 防外挂接入
ok(html.includes("mode='ultimate'"),'Guard心跳识别ultimate');
ok(/ultState&&ultState\.active&&!ultState\.paused/.test(html),'Guard战斗判定含终极挑战');
ok(html.includes('ultState.hp=0'),'Guard归零含终极挑战');
ok(html.includes('ultState.hp>ULT_MAX_LIFE+0.5'),'Guard数值边界含终极挑战');

console.log('\n=== 结果 === 通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
