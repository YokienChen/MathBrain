// v1.0.3 验证：难度分档 / 比大小百分位2.3倍 / 猫咪5关 / 宠物文案颜色 / 既有回归
const fs=require('fs'),vm=require('vm');
const root=__dirname+'/..';
const html=fs.readFileSync(root+'/数学_升级版.html','utf8');
const java=fs.readFileSync(root+'/.build/app/app/src/main/java/com/mathbrain/game/MainActivity.java','utf8');
const gradle=fs.readFileSync(root+'/.build/app/app/build.gradle','utf8');
let pass=0,fail=0;
function ok(n,c,x){if(c){pass++;console.log('  ✓ '+n+(x?'  '+x:''));}else{fail++;console.log('  ✗ '+n+(x?'  '+x:''));}}

console.log('\n=== 1. 版本号 ===');
ok('HTML 顶部标记 v1.0.3', html.includes('<!-- MathBrain v1.0.3 -->'));
ok('Gradle versionCode 28', /versionCode\s+28/.test(gradle));
ok('Gradle versionName 1.0.3', /versionName\s+"1\.0\.3"/.test(gradle));
ok('Java Bridge version 1.0.3', java.includes('return "1.0.3";'));
ok('无旧版本字符串残留', !html.includes('1.0.0')&&!html.includes('1.0.1')&&!html.includes('1.0.2')&&!java.includes('return "1.0.2"'));

console.log('\n=== 2. 应用内版本中心已移除 ===');
['versionScreen','modeVersion','VER_DATA','verInit','verShow','showVerDetail','VER_BRANCH_KEY',
 '版本中心','VERSION CONTROL','__vcBack',"location.href='versions/'","location.hash==='#versions'"].forEach(k=>{
  ok('无残留 '+k, !html.includes(k));
});
ok('主页仅剩4个入口', ['id="modeCalc"','id="modeCompare"','id="modeSecret"','id="modePet"'].every(k=>html.includes(k)));
ok('div 标签配平', (html.match(/<div\b/g)||[]).length===(html.match(/<\/div>/g)||[]).length);
ok('#versions 历史资源不进APK', !fs.existsSync(root+'/.build/app/app/src/main/assets/versions'));

console.log('\n=== 3. 本地版本管理工具保留 ===');
const tool=fs.readFileSync(root+'/版本管理工具.html','utf8');
const meta=JSON.parse(fs.readFileSync(root+'/versions-meta.json','utf8'));
ok('本地工具存在', tool.length>5000);
ok('内嵌版本元数据', tool.includes('const META='));
ok('分支结构树', tool.includes('renderBranches'));
ok('一键回滚命令', tool.includes('cp 数学_'));
ok('版本diff展示', tool.includes('相对上一版'));
ok('本地元数据版本数', Array.isArray(meta.versions)&&meta.versions.length>=19, meta.versions.length+'条');
ok('本地历史备份文件', fs.existsSync(root+'/数学_v8.7_备份.html')&&fs.existsSync(root+'/数学_v1.0.1_备份.html'));
ok('本地工具脚本语法', (()=>{const m=tool.match(/<script>([\s\S]*)<\/script>/);try{new Function(m[1]);return true}catch(e){return false}})());
ok('历史版本仍保留本地', fs.readdirSync(root+'/.build/app/local_versions_assets/versions').filter(f=>f.endsWith('.html')).length===19);

console.log('\n=== 4. 游戏JS语法与关键函数 ===');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
ok('游戏脚本语法', (()=>{try{new Function(js);return true}catch(e){console.log('    '+e.message);return false}})());
['calcCoinsEarned','compareRatio','rankOf','initGame','checkAnswer','decreaseLife','secretBurn',
 'triggerSteadfast','secretNextProblem','feedBtn','applyDailyDecay'].forEach(f=>{
  ok('函数/标识 '+f, js.includes(f));
});
ok('金币×4', js.includes('return Math.round(base*n)*4'));
ok('比大小动态扣血公式', js.includes('const lossPct=8 + currentStage/40 + wrongStreak*3'));
ok('心情投喂+20', js.includes('petFeed(10,20)'));
ok('排行榜超过%文案', js.includes('(超过'));

console.log('\n=== 5. 防外挂 Guard 静态回归 ===');
ok('AndroidGuard 桥接注册', java.includes('}, "AndroidGuard");'));
['markHidden','consumeAway','clearAway','heartbeat','clearActive','escapeState','isSplit','isDebugger','version'].forEach(m=>{
  ok('桥接方法 '+m, java.includes(m+'('));
});
ok('onPause 打隐藏时间戳', /onPause\(\)[\s\S]{0,200}guard\.hiddenAt/.test(java));
ok('onResume 触发 JS 结算', /onResume\(\)[\s\S]{0,400}__guardOnResume/.test(java));
ok('分屏检测', java.includes('isInMultiWindowMode()'));
ok('调试器检测', java.includes('Debug.isDebuggerConnected()'));
console.log('\n--- v1.0.2 系统级分屏探测 ---');
ok('otherAppSplit 方法存在', java.includes('private boolean otherAppSplit()'));
ok('ActivityTaskManager 反射', java.includes('Class.forName("android.app.ActivityTaskManager")')&&java.includes('getStackInfos'));
ok('窗口模式 2~5 判为分屏', java.includes('mode >= 2 && mode <= 5'));
ok('isSplit 本应用优先+系统兜底', java.includes('isInMultiWindowMode()) return true')&&java.includes('lastOtherSplit = otherAppSplit()'));
ok('500ms 探测缓存', java.includes('now - lastOtherSplitCheck < 500L'));
ok('反射失败静默降级', (java.match(/catch \(Throwable ignored\) \{\}/g)||[]).length>=2);
ok('反射依赖导入齐全', ['import java.lang.reflect.Method','import java.lang.reflect.Field','import java.util.Collection'].every(x=>java.includes(x)));
ok('JS 每0.25秒读取分屏倍率', html.includes('setInterval(()=>decreaseLife(Guard.splitMult()),250)')&&html.includes('setInterval(()=>secretBurn(Guard.splitMult()),100)'));
ok('BACK_MULT=4', html.includes('const BACK_MULT = 4'));
ok('普通模式分屏扣血', html.includes('setInterval(()=>decreaseLife(Guard.splitMult()),250)'));
ok('秘境分屏灼烧', html.includes('setInterval(()=>secretBurn(Guard.splitMult()),100)'));
ok('离开补扣普通模式', html.includes('life-(1/3)*4*BACK_MULT*sec'));
ok('离开补扣秘境', html.includes('s.playerHP-dps*BACK_MULT*sec'));
ok('5类检测信号', ['lifeRange','hpRange','debugger','fnTamper','tickFast'].every(s=>html.includes("'"+s+"'")));
ok('稳健阈值', html.includes('kinds.length>=2||anyHeavy'));
ok('不屈期间不强制归零', html.includes('if(secretState.steadfastActive) return;'));
ok('检测后安全重置(修复const赋值)', html.includes('Object.keys(suspect).forEach(k=>delete suspect[k])')&&(html.match(/suspect\s*=\s*\{\};/g)||[]).length===1);
ok('生命周期监听', ['visibilitychange','pagehide','pageshow','focus'].every(e=>html.includes("'"+e+"'")));
ok('Guard.init 启动', html.includes('Guard.init();'));
ok('游戏结束清标记2处', (html.match(/Guard\.onGameEnd\(\)/g)||[]).length===2);

console.log('\n=== 6. Guard 运行时回归 (vm 桩) ===');
const gStart=html.indexOf('const Guard=(function(){');
const gEnd=html.indexOf('})();',gStart)+5;
const guardSrc=html.slice(gStart,gEnd);
let ended=0,cleared=0;
const timers=[];
const bridgeCalls={};
const ctx={
  window:{AndroidGuard:{
    consumeAway:()=>1000, markHidden:()=>{}, clearAway:()=>{}, clearActive:()=>{cleared++},
    heartbeat:(m,r)=>{bridgeCalls.heartbeat=[m,r]}, escapeState:()=>JSON.stringify({active:true,mode:'compare',rate:4/3}),
    isSplit:()=>true, isDebugger:()=>false, version:()=>'1.0.3'
  },addEventListener:()=>{}},
  document:{hidden:false,addEventListener:()=>{}},
  performance:{now:()=>Date.now()},
  setInterval:(fn,ms)=>{timers.push({fn,ms});return timers.length},
  console,Date,JSON,Math,isFinite,String,Object,
  MAX_LIFE:200,life:200,gameActive:true,secretState:null,
  decreaseLife:function decreaseLife(mult){life-=mult;},
  checkAnswer:function checkAnswer(){const correct=true;return correct;},
  endGame:()=>{ended++},secretUpdateHP:()=>{},secretFinish:()=>{},triggerSteadfast:()=>false,
  lifeFill:{style:{}},lifeValue:{}
};
vm.createContext(ctx);
vm.runInContext(guardSrc+'\nthis.__G=Guard;',ctx);
const G=ctx.__G;
ok('分屏时 splitMult=4', G.splitMult()===4);
ctx.life=200; G.applyAway(1000,'compare',4/3);
ok('离开1秒扣血 16/3', Math.abs(ctx.life-(200-16/3))<0.001, 'life='+ctx.life.toFixed(3));
ok('active 战斗判断', G.inBattle()===true);
G.init();
const detect=timers.find(t=>t.ms===1000&&t.fn.toString().includes('detectCheat'));
ok('检测定时器已注册', !!detect);
// 注入两类信号：生命越界 + 调试器连接
ctx.life=999; ctx.window.AndroidGuard.isDebugger=()=>true;
let threw=false; try{ detect.fn(); detect.fn(); }catch(e){threw=true;console.log('    '+e.message);}
ok('多信号确认后归零', ctx.life===0&&ended>0);
ok('检测后重置不抛错', !threw);
ok('归零后清理活跃标记', cleared>0);
ctx.window.AndroidGuard.isSplit=()=>false;
ok('非分屏 splitMult=1', G.splitMult()===1);

console.log('\n=== 7. v1.0.3 新功能 ===');
console.log('--- 难度文字分档 ---');
ok('模式化分档常量', html.includes("const late=currentMode==='compare'?[130,160,190,220]:[120,140,160,180]"));
{
  const s=html.indexOf('function updateDifficultyLabel(stage){');
  const e=html.indexOf('/* ================= 判题',s);
  const src=html.slice(s,e);
  const dEl={className:'',textContent:'',style:{},parentElement:{clientWidth:360}};
  const c={currentMode:'calc',difficultyText:dEl,fitDiffLabel:()=>{},
    document:{createElement:()=>({getContext:()=>({font:'',measureText:()=>({width:0})})})},
    getComputedStyle:()=>({paddingLeft:'0px',paddingRight:'0px'})};
  vm.createContext(c); vm.runInContext(src+'\nthis.__upd=updateDifficultyLabel;',c);
  const label=(mode,stage)=>{c.currentMode=mode;c.__upd(stage);return dEl.textContent;};
  ok('心算120=未知', label('calc',120)==='未知');
  ok('心算121=死域', label('calc',121).includes('死域'));
  ok('心算141=岩浆', label('calc',141).includes('岩浆'));
  ok('心算161=不要作死', label('calc',161).includes('不要作死'));
  ok('心算181=炎魔', label('calc',181).includes('炎魔'));
  ok('比大小130=未知', label('compare',130)==='未知');
  ok('比大小131=死域', label('compare',131).includes('死域'));
  ok('比大小161=岩浆', label('compare',161).includes('岩浆'));
  ok('比大小191=不要作死', label('compare',191).includes('不要作死'));
  ok('比大小221=炎魔', label('compare',221).includes('炎魔'));
}

console.log('--- 比大小结算百分位 ---');
ok('比大小表按2.3倍生成', html.includes('const COMPARE_PERCENTILE_TABLE=PERCENTILE_TABLE.map(x=>({score:Math.round(x.score*2.3),pct:x.pct}))'));
ok('结算传入当前模式', html.includes('calculatePercentile(score,currentMode)'));
ok('两种模式都显示结算行', /percentileRow\.style\.display='';\s*progressRow\.style\.display='';/.test(html)&&!html.includes("percentileRow.style.display='none'"));
{
  const s=html.indexOf('const PERCENTILE_TABLE=[');
  const e=html.indexOf('/* ================= 比大小模式：出题系统',s);
  const src=html.slice(s,e);
  const c={}; vm.createContext(c);
  vm.runInContext(src+'\nthis.__calc=calculatePercentile;this.__cmp=COMPARE_PERCENTILE_TABLE;this.__base=PERCENTILE_TABLE;',c);
  ok('表条目数一致', c.__cmp.length===c.__base.length);
  ok('每个临界点均为2.3倍', c.__cmp.every((x,i)=>x.score===Math.round(c.__base[i].score*2.3)));
  ok('心算282880=50%', Math.abs(c.__calc(282880,'calc')-50)<1e-9);
  ok('比大小650624=50%', Math.abs(c.__calc(650624,'compare')-50)<1e-9);
  ok('比大小3128=20%', Math.abs(c.__calc(3128,'compare')-20)<1e-9);
  ok('比大小0分=0%', c.__calc(0,'compare')===0);
  ok('比大小满分封顶99.99', c.__calc(23000000,'compare')===99.99);
}

console.log('--- 猫咪鼓励频率 ---');
ok('星光里程碑仍每10关', html.includes('if(passed%10===0)'));
ok('猫咪鼓励改为每5关', html.includes('if(passed%5===0) catPraise();'));
ok('无旧10关猫夸文案', !html.includes('每过10关猫咪'));

console.log('--- 宠物按钮与等级行 ---');
ok('10升11起按钮改等级突破', html.includes("v7.petLevel>=10?'等级突破':'升级宠物'"));
ok('等级颜色分段11/31', html.includes("lv>=31?'#ffe680':(lv>=11?'#7fe9ff':'')"));
ok('11级起删除不衰减行', html.includes('if(lv<11) parts.push('));
{
  const s=html.indexOf('function renderPet(){');
  const e=html.indexOf('function petFeed(',s);
  const src=html.slice(s,e);
  const mk=()=>({textContent:'',innerHTML:'',style:{},disabled:false});
  const petAt=(lv)=>{
    const c={PET_MIN_MOOD:100,applyDailyDecay:(v)=>v,saveV7:()=>{},
      loadV7:()=>({petLevel:lv,mood:100,coins:9999,keys:9}),
      petCfgFor:()=>({k:lv<=9?4.5:0,m:1000,price:100,keyPrice:0}),
      hasSteadfast:()=>false,hasHardShield:()=>false,renderCoins:()=>{},
      petEl:{screen:{},mood:mk(),moodMax:mk(),fill:{style:{}},levelInfo:mk(),skills:mk(),upgrade:mk(),feed:mk(),feed10:mk()}};
    vm.createContext(c); vm.runInContext(src+'\nthis.__render=renderPet;',c); c.__render();
    return {info:c.petEl.levelInfo.innerHTML,btn:c.petEl.upgrade.textContent};
  };
  const p9=petAt(9),p10=petAt(10),p11=petAt(11),p30=petAt(30),p31=petAt(31);
  ok('Lv9按钮=升级宠物', p9.btn.startsWith('升级宠物'));
  ok('Lv10按钮=等级突破', p10.btn.startsWith('等级突破'));
  ok('Lv10仍显示不衰减', p10.info.includes('心情不再每日衰减'));
  ok('Lv11删除不衰减', !p11.info.includes('心情不再每日衰减'));
  ok('Lv9等级保持原色', !p9.info.includes('color:'));
  ok('Lv11等级蓝色', p11.info.includes('color:#7fe9ff'));
  ok('Lv30等级蓝色', p30.info.includes('color:#7fe9ff'));
  ok('Lv31等级金色', p31.info.includes('color:#ffe680'));
}

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
