// 根据 v8.0 用户给的关卡人数分布规律，计算各段人数与累计，验证锚点并求 n
function levelCap(L){
  if(L<=9) return [0,125,150,175,200,250,500,1000,3000,8000][L];
  if(L<=14) return 18000+L*200;
  if(L<=19) return 18300+L*180;
  if(L<=24) return 18700+L*160;
  if(L<=29) return 19200+L*140;
  if(L<=34) return 19800+L*120;
  if(L<=39) return 20500+L*100;
  if(L<=44) return 21300+L*80;
  if(L<=49) return 22200+L*60;
  if(L<=54) return 23200+L*40;
  if(L<=59) return 23750+L*30;
  if(L<=64) return 24350+L*20;
  if(L<=69) return 25000+L*10;
  return 25700;
}
// 关卡 k 的玩家人数（k=通关最高关）
function cnt(k){
  if(k>=95&&k<=97) return 1;
  if(k>=81&&k<=94) return 96-k;
  if(k>=71&&k<=80) return 18*Math.pow(1.2,80-k);
  if(k>=51&&k<=70) return cnt(71)*Math.pow(1.25,71-k);
  if(k>=41&&k<=50) return cnt(51)*Math.pow(1.35,51-k);
  return 0;
}
// 过 k 关的玩家名次 = 最高关 > k 的人数累计 + 1
function rankPassed(k){ let s=0; for(let j=k+1;j<=97;j++) s+=cnt(j); return s+1; }
console.log('=== 关键锚点验证 ===');
console.log('过80关名次:',rankPassed(80),'(期望≈123)');
console.log('过77关名次:',rankPassed(77),'(期望≈189)');
// 前20名心情
const board=[];
for(let k=97;k>=1;k--){ const m=levelCap(k-29+ (0)); } // 占位
const top=[];
for(let rank=1;rank<=20;rank++){}
// 直接列出关卡→心情→人数
console.log('\n=== 关卡→等级→心情→人数(前若干) ===');
for(let k=97;k>=85;k--){ const L=k-29; console.log(k+'关 → '+L+'级 → '+levelCap(L)+' → '+cnt(k).toFixed(2)+'人'); }
// X = 过40关及以上累计(即41-97关人数和)
let X=0; for(let k=41;k<=97;k++) X+=cnt(k);
console.log('\n=== 总人数推算 ===');
console.log('累计(41-97关) X =',X.toFixed(2));
const n=X/0.006;
console.log('若 20200 名次=0.006n，则 n =',n.toFixed(0));
console.log('校验: 20200名次=',(0.006*n).toFixed(0),' 20000名次=',(0.015*n).toFixed(0),' 1000名次=',(300*n/1000).toFixed(0));
// 各系数段累计
let s95=0;for(let k=95;k<=97;k++)s95+=cnt(k);
let s81=0;for(let k=81;k<=94;k++)s81+=cnt(k);
let s71=0;for(let k=71;k<=80;k++)s71+=cnt(k);
let s51=0;for(let k=51;k<=70;k++)s51+=cnt(k);
let s41=0;for(let k=41;k<=50;k++)s41+=cnt(k);
console.log('\n各段人数: 95-97=',s95,' 81-94=',s81.toFixed(2),' 71-80=',s71.toFixed(2),' 51-70=',s51.toFixed(2),' 41-50=',s41.toFixed(2));
