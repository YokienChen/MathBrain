// v1.0.0 验证：防外挂(4倍/离开补扣/稳健检测)、版本中心、Java桥接
const fs=require('fs'),vm=require('vm');
const root=__dirname+'/..';
const html=fs.readFileSync(root+'/数学_升级版.html','utf8');
const java=fs.readFileSync(root+'/.build/app/app/src/main/java/com/mathbrain/game/MainActivity.java','utf8');
let pass=0,fail=0;
function ok(n,c,x){if(c){pass++;console.log('  ✓ '+n+(x?'  '+x:''));}else{fail++;console.log('  ✗ '+n+(x?'  '+x:''));}}

console.log('\n=== 1. 原生层桥接 (MainActivity.java) ===');
ok('AndroidGuard 桥接注册', java.includes('}, "AndroidGuard");'));
['markHidden','consumeAway','clearAway','heartbeat','clearActive','escapeState','isSplit','isDebugger','version'].forEach(m=>{
  ok('桥接方法 '+m, java.includes('public ')+(java.includes(m+'(')||java.includes(m+' (')));
});
ok('onPause 打隐藏时间戳', /onPause\(\)[\s\S]{0,200}guard\.hiddenAt/.test(java));
ok('onResume 触发 JS 结算', /onResume\(\)[\s\S]{0,400}__guardOnResume/.test(java));
ok('分屏检测 isInMultiWindowMode', java.includes('isInMultiWindowMode()'));
ok('调试器检测 isDebuggerConnected', java.includes('Debug.isDebuggerConnected()'));
ok('版本号 1.0.0', java.includes('return "1.0.0";'));

console.log('\n=== 2. Web层 4 倍速扣血 ===');
ok('BACK_MULT=4', html.includes('const BACK_MULT = 4'));
ok('普通模式分屏倍率', html.includes('setInterval(()=>decreaseLife(Guard.splitMult()),250)'));
ok('秘境分屏倍率', html.includes('setInterval(()=>secretBurn(Guard.splitMult()),100)'));
ok('decreaseLife 带默认倍率', html.includes('function decreaseLife(mult)')&&html.includes('mult=mult||1'));
ok('secretBurn 带默认倍率', html.includes('function secretBurn(mult)'));
ok('分屏返回4倍', html.includes('return split?BACK_MULT:1;'));
ok('普通离开补扣=基础×4×4', html.includes('life-(1/3)*4*BACK_MULT*sec'));
ok('秘境离开补扣=dps×4×时长', html.includes('s.playerHP-dps*BACK_MULT*sec'));

console.log('\n=== 3. 稳健外挂检测 ===');
ok('多信号累积 suspect', html.includes('const suspect={}'));
ok('4类检测信号齐全', ['lifeRange','hpRange','debugger','fnTamper','tickFast'].every(s=>html.includes("'"+s+"'")));
ok('稳健阈值:2类信号或单信号≥4', html.includes('kinds.length>=2||anyHeavy'));
ok('归零普通模式', html.includes('life=0;')&&html.includes('endGame();'));
ok('归零秘境', html.includes('secretState.playerHP=0;')&&html.includes('secretFinish(false);'));
ok('不屈期间不强制归零', html.includes('if(secretState.steadfastActive) return;'));
ok('桥接调用全 try/catch 降级', html.includes('try{ return G[fn].apply'));
ok('不在游戏中不采样', html.includes('if(!inBattle()) return;'));

console.log('\n=== 4. 生命周期与防重复 ===');
ok('pagehide/visibilitychange/pageshow/focus 监听', ['visibilitychange','pagehide','pageshow','focus'].every(e=>html.includes("'"+e+"'")));
ok('awaySettled 防重复补扣', html.includes('awaySettled=true')&&html.includes('if(!hasNative||awaySettled) return;'));
ok('进程被杀重启补扣', html.includes('settleAfterKill()'));
ok('有效离开阈值0.4秒', html.includes('away>400'));
ok('游戏结束清活跃标记2处', (html.match(/Guard\.onGameEnd\(\)/g)||[]).length===2);
ok('Guard.init 启动', html.includes('Guard.init();'));

console.log('\n=== 5. 版本中心 ===');
ok('版本数据21条', (html.match(/\{v:'[^']+',file:/g)||[]).length===21);
ok('版本中心DOM', html.includes('id="versionScreen"'));
ok('主页入口 modeVersion', html.includes('id="modeVersion"'));
ok('verInit 初始化', html.includes('verInit();'));
ok('查看修改/详情', html.includes('showVerDetail'));
ok('分支存取(AndroidStore优先)', html.includes('VER_BRANCH_KEY')&&html.includes('window.AndroidStore.getHistory'));
ok('回退跳转历史HTML', html.includes("location.href='versions/'"));
ok('#versions 返回自动打开', html.includes("location.hash==='#versions'"));
ok('secretShow 隐藏版本页', html.includes("const verEl=document.getElementById('versionScreen')"));
const versDir=root+'/.build/app/app/src/main/assets/versions';
ok('19个历史版本已打包', fs.readdirSync(versDir).filter(f=>f.endsWith('.html')).length===19, fs.readdirSync(versDir).length+'个文件');
ok('历史版本含返回按钮', fs.readFileSync(versDir+'/v8_7.html','utf8').includes('__vcBack'));

console.log('\n=== 6. 本地版本管理工具 ===');
const tool=fs.readFileSync(root+'/版本管理工具.html','utf8');
ok('工具存在', tool.length>5000);
ok('内嵌版本元数据', tool.includes('const META='));
ok('分支结构树', tool.includes('renderBranches'));
ok('一键回滚命令', tool.includes('cp 数学_'));
ok('版本diff展示', tool.includes('相对上一版'));
ok('版本管理工具无语法错误', (()=>{const m=tool.match(/<script>([\s\S]*)<\/script>/);try{new Function(m[1]);return true}catch(e){return false}})());

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
