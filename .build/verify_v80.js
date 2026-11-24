// v8.0 验证脚本：从 数学_升级版.html 提取核心函数在 vm 沙箱中运行
const fs=require('fs'), vm=require('vm');
const html=fs.readFileSync(__dirname+'/../数学_升级版.html','utf8');

let pass=0,fail=0;
function ok(name,cond,extra){ if(cond){pass++;console.log('  ✓ '+name+(extra?'  '+extra:''));}else{fail++;console.log('  ✗ '+name+(extra?'  '+extra:''));} }
function near(a,b,tol){ return Math.abs(a-b)<=tol; }

// ---- 提取存储/宠物逻辑区块 ----
function extract(startMark,endMark){
  const s=html.indexOf(startMark), e=html.indexOf(endMark,s);
  if(s<0||e<0) throw new Error('提取失败: '+startMark+' / '+endMark);
  return html.slice(s,e);
}
const storeBlock=extract('const V7_KEY=', '/* ================= 历史记录与起点');
const rankBlock=extract('const RANK_N=', 'function fmtRank');

// ---- 沙箱环境 ----
let LS={};
const sandbox={
  console,
  localStorage:{ getItem:k=>LS[k]||null, setItem:(k,v)=>{LS[k]=String(v);} },
  window:{},
  Math,JSON,Number,Array,Date,Object,String,
  PET_MIN_MOOD:100
};
vm.createContext(sandbox);
vm.runInContext(storeBlock+'\n'+rankBlock+'\n'+'this.__api={PET_LEVELS,PET_MAX_LEVEL,defaultV7,loadV7,saveV7,clampMood,applyDailyDecay,petCfgFor,calcCoinsEarned,addCoins,claimSecretKey,last3am,rankOf,pctOf,RANK_N,RANK_TOP20};',sandbox);
const a=sandbox.__api;

console.log('\n=== 1. 金币 ×4 ===');
ok('打满20关基数=reached*4', a.calcCoinsEarned(40,20)===160, '40关→'+a.calcCoinsEarned(40,20));
ok('打0关=0', a.calcCoinsEarned(50,50)===0, '→'+a.calcCoinsEarned(50,50));
ok('打10关折扣 base=40,(10/20)^2=0.25 →40', a.calcCoinsEarned(30,20)===Math.round(40*0.25)*4, '→'+a.calcCoinsEarned(30,20));
ok('base取max(reached,start+20)=120,打0关→0', a.calcCoinsEarned(5,100)===0, '→'+a.calcCoinsEarned(5,100));

console.log('\n=== 2. 宠物升级价格 ===');
ok('8→9 = 3000金币', a.PET_LEVELS[8].price===3000, '→'+a.PET_LEVELS[8].price);
ok('9→10 = 4000金币', a.PET_LEVELS[9].price===4000, '→'+a.PET_LEVELS[9].price);
ok('10级 2000金币+1钥匙, k=0', a.PET_LEVELS[10].price===2000&&a.PET_LEVELS[10].keyPrice===1&&a.PET_LEVELS[10].k===0);
ok('14级上限=18000+14*200=20800', a.PET_LEVELS[14].m===20800, '→'+a.PET_LEVELS[14].m);
ok('15级 2400金币,上限18300+15*180=21000', a.PET_LEVELS[15].price===2400&&a.PET_LEVELS[15].m===21000, '→'+a.PET_LEVELS[15].m);
ok('69级 6400金币,上限25000+69*10=25690', a.PET_LEVELS[69].price===6400&&a.PET_LEVELS[69].m===25690, '→'+a.PET_LEVELS[69].m);
ok('70级满级 无价格 上限25700', a.PET_LEVELS[70].price===null&&a.PET_LEVELS[70].m===25700);
ok('PET_MAX_LEVEL=70', a.PET_MAX_LEVEL===70);
ok('11级上限=20200 (过40关1钥匙)', a.PET_LEVELS[11].m===20200, '→'+a.PET_LEVELS[11].m);

console.log('\n=== 3. 10级后不衰减 ===');
LS={};
let v=a.defaultV7(); v.petLevel=15; v.mood=20000; v.lastDecay=a.last3am(Date.now());
let t=new Date(); t.setDate(t.getDate()+10); // 10天后
let v2=a.applyDailyDecay(v,t.getTime());
ok('15级10天后心情不变 (k=0)', v2.mood===20000, '→'+v2.mood);
v.petLevel=5; v.mood=250; v.lastDecay=a.last3am(Date.now());
let v3=a.applyDailyDecay(v,t.getTime());
ok('5级10天后心情衰减 (k=2.5)', v3.mood<250, '→'+v3.mood.toFixed(1));

console.log('\n=== 4. 钥匙领取(v8后首次,每关一次) ===');
LS={};
ok('初始0钥匙', a.loadV7().keys===0);
ok('通关40关 +1钥匙', a.claimSecretKey(40)===1 && a.loadV7().keys===1);
ok('再通关40关不重复发', a.claimSecretKey(40)===0 && a.loadV7().keys===1);
ok('通关39关不发', a.claimSecretKey(39)===0 && a.loadV7().keys===1);
ok('通关41关 +1', a.claimSecretKey(41)===1 && a.loadV7().keys===2);
ok('通关99关 +1', a.claimSecretKey(99)===1 && a.loadV7().keys===3);
// 模拟旧存档：历史打过但 keyClaimed 为空
LS={};
LS['mathbrain_v7_v1']=JSON.stringify({coins:5000,keys:0,keyClaimed:[],petLevel:9,mood:8000,lastDecay:0});
ok('旧玩家通关40关仍可领(不被吞)', a.claimSecretKey(40)===1 && a.loadV7().keys===1);

console.log('\n=== 5. 排行榜分段公式 ===');
const n=a.RANK_N;
ok('n≈1.057亿', near(n,105680504,1), 'n='+n);
ok('心情20200 → 超过99.40%', a.pctOf(20200).toFixed(2)==='99.40', a.pctOf(20200).toFixed(2)+'%');
ok('心情20000 → 名次n*0.015', near(a.rankOf(20000),n*0.015,1), a.rankOf(20000).toFixed(0));
ok('心情19999 → 名次n*300/19999', near(a.rankOf(19999),n*300/19999,1));
ok('心情1000 → 名次n*0.3', near(a.rankOf(1000),n*0.3,1), a.rankOf(1000).toFixed(0));
ok('心情600 → 名次0.5n, 超过50%', near(a.rankOf(600),n*0.5,1)&&a.pctOf(600).toFixed(2)==='50.00');
ok('心情100 → 名次0.9n, 超过10%', near(a.rankOf(100),n*0.9,1)&&a.pctOf(100).toFixed(2)==='10.00');
// v8.6 起：高心情不再固定99.40%，按分布递减名次（见 verify_v86.js）
ok('20200锚点99.40%(前0.6%)', a.pctOf(20200)===99.40, a.pctOf(20200)+'%');
ok('百分比四舍五入2位', a.pctOf(19999).toString().split('.')[1].length<=2, a.pctOf(19999)+'%');

console.log('\n=== 6. 前20固定榜 & 并列规则 ===');
ok('前20共20条', a.RANK_TOP20.length===20);
ok('第1名25680(97关58钥匙68级)', a.RANK_TOP20[0][1]===25680);
ok('第20名25570(90关)', a.RANK_TOP20[19][1]===25570);
// 并列最前：25570 应插在第18位(ahead=17)
let mood=25570, ahead=0; for(const [,m] of a.RANK_TOP20){ if(m>mood)ahead++; }
ok('25570并列最前→第18名', ahead+1===18, '名次='+(ahead+1));
mood=25650; ahead=0; for(const [,m] of a.RANK_TOP20){ if(m>mood)ahead++; }
ok('25650→第4名', ahead+1===4, '名次='+(ahead+1));

console.log('\n=== 分布锚点(参考 calc_dist.js) ===');
function levelCap(L){
  if(L<=9) return [0,125,150,175,200,250,500,1000,3000,8000][L];
  if(L<=14) return 18000+L*200; if(L<=19) return 18300+L*180;
  if(L<=24) return 18700+L*160; if(L<=29) return 19200+L*140;
  if(L<=34) return 19800+L*120; if(L<=39) return 20500+L*100;
  if(L<=44) return 21300+L*80; if(L<=49) return 22200+L*60;
  if(L<=54) return 23200+L*40; if(L<=59) return 23750+L*30;
  if(L<=64) return 24350+L*20; if(L<=69) return 25000+L*10;
  return 25700;
}
function cnt(k){
  if(k>=95&&k<=97) return 1;
  if(k>=81&&k<=94) return 96-k;
  if(k>=71&&k<=80) return 18*Math.pow(1.2,80-k);
  if(k>=51&&k<=70) return cnt(71)*Math.pow(1.25,71-k);
  if(k>=41&&k<=50) return cnt(51)*Math.pow(1.35,51-k);
  return 0;
}
function rankPassed(k){ let s=0; for(let j=k+1;j<=97;j++) s+=cnt(j); return s+1; }
ok('过80关≈123名', near(rankPassed(80),123,1), rankPassed(80).toFixed(1));
ok('过77关≈189名', near(rankPassed(77),189,2), rankPassed(77).toFixed(1));
// 97关→68级→25680；顶配玩家名次公式
ok('过97关(25680)名次=1', near(a.rankOf(levelCap(68)),1,1), '名次'+Math.round(a.rankOf(levelCap(68))));

console.log('\n=== 结果 ===');
console.log('通过 '+pass+' / 失败 '+fail);
process.exit(fail?1:0);
