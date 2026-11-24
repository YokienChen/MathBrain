
const META={"project":"最强大脑 · 数学心算","current":"1.0.0","versions":[{"v":"0.3.1","file":"v0_3_1.html","date":"早期","tag":"基线","notes":"字体减半/难度标签(简单·中等·困难·？？？)/血量上限翻倍；近10局最高-50起点、前20关热身、跳过满分、答错清空输入、修双击刷分"},{"v":"0.4.0","file":"v0_4_0.html","date":"早期","tag":"里程碑","notes":"新增心算+比大小双模式"},{"v":"0.5.0","file":"v0_5_0.html","date":"早期","tag":"","notes":"比大小：内置< = >符号、题型解锁、π/e保底机制、概率表、退出85%规则"},{"v":"0.5.1","file":"v0_5_1.html","date":"早期","tag":"","notes":"比大小答错直接下一关且0分、掉血×3；双指数概率"},{"v":"0.5.2","file":"v0_5_2.html","date":"早期","tag":"","notes":"双指数定义/保底/禁止同指数、结算页两按钮"},{"v":"0.5.3","file":"v0_5_3.html","date":"11-20","tag":"","notes":"双指数对分布：(2,3)=40%、(3,4)=30%、其他=30%，保底同分布"},{"v":"0.6.0","file":"v0_6_0.html","date":"11-20","tag":"里程碑","notes":"新增秘境挑战：关卡选择/星级/最高分、人vs妖怪双血条、炸弹·飞刀·炽热烈焰、敌方加成表、隐藏分与答案上限、7种题型、特殊数🔥与唯一提示、速度计分与星级线"},{"v":"0.6.1","file":"v0_6_1.html","date":"11-20","tag":"","notes":"修复秘境答错仍计分"},{"v":"0.6.2","file":"v0_6_2.html","date":"11-20","tag":"","notes":"秘境算式强制单行显示（自动缩放字号）"},{"v":"0.6.4","file":"v0_6_4.html","date":"11-20","tag":"","notes":"秘境敌方伤害加成重新平衡"},{"v":"0.6.5","file":"v0_6_5.html","date":"11-20","tag":"","notes":"秘境🔥位置多样化、④⑥特殊题上限改0.4"},{"v":"0.7.0","file":"v0_7_0.html","date":"11-20","tag":"里程碑","notes":"金币系统、猫咪陪伴气泡、我的宠物页(投喂/升级/每日心情衰减)、秘境宠物加成(减灼烧/不屈意志/硬核护盾)"},{"v":"0.8.0","file":"v0_8_0.html","date":"11-23","tag":"里程碑","notes":"金币再×2(累计4倍)、钥匙🗝系统(≥40关首通各1把)、宠物10-70级与钥匙成本、10级后不衰减、全球排行榜(固定前20+名次/百分比公式+并列最前)"},{"v":"0.8.1","file":"v0_8_0.html","date":"11-23","tag":"文案","notes":"排行榜玩家行(前xx.xx%)改为(超过xx.xx%)。注：无独立备份，回退指向v0.8.0源码"},{"v":"0.8.2","file":"v0_8_2.html","date":"11-23","tag":"","notes":"删除主页'双模式·无限挑战'、秘境战斗隐藏货币、秘境排版优化(勇士左移+算式安全边距)"},{"v":"0.8.3","file":"v0_8_3.html","date":"11-23","tag":"修复","notes":"修复190+关2²送分题bug(兜底限定量级范围+换对)；比大小比例分档(100-129:92-97%…220+:98-99%)"},{"v":"0.8.4","file":"v0_8_4.html","date":"11-23","tag":"","notes":"投喂心情+5→+20(×10=+200，不超上限)；比大小答错扣血翻倍"},{"v":"0.8.5","file":"v0_8_5.html","date":"11-23","tag":"修复","notes":"修复不屈意志生效时输入死锁只能等死的bug；删除生效横幅'✨不屈意志✨'"},{"v":"0.8.6","file":"v0_8_6.html","date":"11-23","tag":"修复","notes":"修复排行榜名次卡在634083(按心情→等级→关卡→分布算真实名次)；比大小扣血改为21.6%最大生命值"},{"v":"0.8.7","file":"v0_8_7.html","date":"11-23","tag":"","notes":"比大小动态扣血(8+关卡/40+连错×3%)；101+难度标签5档文案与动画(未知/死域/岩浆/不要作死/炎魔本魔)"},{"v":"1.0.0","file":"index.html","date":"11-24","tag":"当前·大版本","notes":"版本控制(查看版本间修改/分支/回退)+防外挂(退出/分屏4倍速扣血、稳健外挂检测归零)。当前运行版本"}]};
const LS_BRANCH='mathbrain_ver_branches_v1';
let selected=null;
function branches(){ try{const o=JSON.parse(localStorage.getItem(LS_BRANCH));if(Array.isArray(o)&&o.length)return o;}catch(e){} return [{name:'main',base:'1.0.0',active:true}]; }
function saveBranches(b){ localStorage.setItem(LS_BRANCH,JSON.stringify(b)); renderBranches(); }
function renderBranches(){
  const bs=branches();
  document.getElementById('branches').innerHTML=bs.map(b=>'<span class="branch '+(b.active?'act':'')+'">'+b.name+' → v'+b.base+(b.active?' ✓':'')+'</span>').join('')
   +'<div class="tree" style="margin-top:8px;">'+META.versions.slice().reverse().map((x,i)=>{
      const branchAt=bs.filter(b=>b.base===x.v).map(b=>' ├─🌿 '+b.name).join('\n');
      const cur=x.v===META.current?'  ← 当前运行':'';
      return (i===0?'● ':'│ ')+'<b>v'+x.v+'</b>'+cur+(branchAt?'\n'+branchAt:'');
     }).join('\n')+'</div>';
  const sel=document.getElementById('bb');
  sel.innerHTML=META.versions.map(x=>'<option value="'+x.v+'">基于 v'+x.v+'</option>').join('');
  sel.value='1.0.0';
}
function addBranch(){
  const name=document.getElementById('bn').value.trim(); if(!name){t('请输入分支名');return;}
  const base=document.getElementById('bb').value; const bs=branches();
  if(bs.some(b=>b.name===name)){t('分支名已存在');return;}
  bs.forEach(b=>b.active=false); bs.push({name,base,active:true}); saveBranches(bs);
  document.getElementById('bn').value=''; t('已创建分支 '+name+' (基于 v'+base+')');
}
function renderList(){
  const order=META.versions.slice().reverse();
  document.getElementById('vlist').innerHTML=order.map(x=>
    '<div class="vitem" data-v="'+x.v+'" onclick="sel(\''+x.v+'\')">'
    +'<div class="h"><span class="v">v'+x.v+'</span>'
    +(x.tag?'<span class="tag '+(x.tag==='里程碑'?'mile':'')+'">'+x.tag+'</span>':'')
    +'<span class="date">'+x.date+'</span></div>'
    +'<div class="note">'+x.notes.slice(0,60)+(x.notes.length>60?'…':'')+'</div></div>').join('');
}
function sel(v){ selected=v; document.querySelectorAll('.vitem').forEach(e=>e.classList.toggle('sel',e.dataset.v===v)); showDetail(v); }
function expandAll(){ document.getElementById('detail').innerHTML=META.versions.slice().reverse().map(x=>'<div class="diffbox" style="margin-bottom:10px;"><span class="add">[v'+x.v+']</span> '+x.notes+'</div>').join(''); }
function resetSel(){ selected=null; document.querySelectorAll('.vitem').forEach(e=>e.classList.remove('sel')); document.getElementById('detail').innerHTML='<div class="hint">← 点击左侧版本卡片查看修改说明、分支点与回退命令</div>'; }
function showDetail(v){
  const i=META.versions.findIndex(x=>x.v===v); const x=META.versions[i]; const prev=i>0?META.versions[i-1]:null;
  const branchAt=branches().filter(b=>b.base===v).map(b=>b.name).join('、');
  const rollback=x.file==='index.html'?'（当前版本，无需回退）':'cp 数学_v'+v+'_备份.html 数学_升级版.html';
  let h='<h3 style="color:var(--gold);margin:0 0 8px;">v'+x.v+' '+(x.tag?'· '+x.tag:'')+'</h3>';
  h+='<div class="kv"><span class="hint">日期</span><b>'+x.date+'</b><span class="hint">源码文件</span><code>'+x.file+'</code></div>';
  h+='<div class="diffbox"><span class="meta">## 本版修改内容</span>\n<span class="add">+ '+x.notes+'</span>';
  if(prev) h+='\n\n<span class="meta">## 相对上一版 v'+prev.v+'</span>\n<span class="del">- '+prev.notes.slice(0,80)+(prev.notes.length>80?'…':'')+'</span>\n<span class="add">+ '+x.notes+'</span>';
  if(branchAt) h+='\n\n<span class="meta">## 分支点</span>\n🌿 '+branchAt;
  h+='</div>';
  h+='<div class="kv" style="margin-top:12px;"><span class="hint">一键回滚到本地源码：</span><code id="rollcmd">'+rollback+'</code>'
   +(x.file!=='index.html'?'<button onclick="cpCmd()">复制</button>':'')+'</div>';
  if(v==='0.8.1') h+='<div class="hint">⚠ v0.8.1 无独立备份，回滚命令指向 v0.8.0（内容差异仅为排行榜文案）</div>';
  document.getElementById('detail').innerHTML=h;
}
function cpCmd(){ const c=document.getElementById('rollcmd'); if(!c)return; copy(c.textContent); }
function copyRollback(){
  if(!selected){t('请先选择一个版本');return;}
  const i=META.versions.findIndex(x=>x.v===selected); const x=META.versions[i];
  if(x.file==='index.html'){t('当前版本无需回退');return;}
  copy('cp 数学_v'+selected+'_备份.html 数学_升级版.html');
}
function copy(s){ if(navigator.clipboard) navigator.clipboard.writeText(s).then(()=>t('已复制: '+s),()=>t('复制失败，请手动选择')); else t('请手动复制: '+s); }
function t(m){ const e=document.getElementById('toast'); e.textContent=m; e.style.display='block'; clearTimeout(t._t); t._t=setTimeout(()=>e.style.display='none',1800); }
renderList(); renderBranches();
