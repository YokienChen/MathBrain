// v1.0.1 验证：移除应用内版本中心 / 保留本地工具 / 防外挂回归 / 版本号
const fs=require('fs'),vm=require('vm');
const root=__dirname+'/..';
const html=fs.readFileSync(root+'/数学_升级版.html','utf8');
const java=fs.readFileSync(root+'/.build/app/app/src/main/java/com/mathbrain/game/MainActivity.java','utf8');
const gradle=fs.readFileSync(root+'/.build/app/app/build.gradle','utf8');
let pass=0,fail=0;
function ok(n,c,x){if(c){pass++;console.log('  ✓ '+n+(x?'  '+x:''));}else{fail++;console.log('  ✗ '+n+(x?'  '+x:''));}}

console.log('\n=== 1. 版本号 ===');
ok('HTML 顶部标记 v1.0.1', html.includes('<!-- MathBrain v1.0.1 -->'));
ok('Gradle versionCode 26', /versionCode\s+26/.test(gradle));
ok('Gradle versionName 1.0.1', /versionName\s+"1\.0\.1"/.test(gradle));
ok('Java Bridge version 1.0.1', java.includes('return "1.0.1";'));
ok('无残留 1.0.0 版本字符串', !html.includes('1.0.0')&&!java.includes('return "1.0.0"'));

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
    isSplit:()=>true, isDebugger:()=>false, version:()=>'1.0.1'
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

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
