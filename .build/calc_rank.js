// v8.0 排行榜排名算法（按用户给的分段公式）
// 输入: mood(心情值), n(总人数)
// 输出: rank(名次), pct(超过玩家百分比)
function rankOf(mood,n){
  if(mood>=20200) return n*0.006;                       // 11级满心情20200 → 前0.6%
  if(mood>=20000) return n*0.015;                       // 20000 → 前1.5%
  if(mood>=600)   return n*300/mood;                    // 600≤m<20000 → n*300/心情
  // 100≤m<600: 每比600少1，比0.5n多0.0008n
  return n*(0.5+(600-mood)*0.0008);
}
function pctOf(mood,n){ const r=rankOf(mood,n); return Math.min(99.99,(1-r/n)*100); }
const n=100000000;
console.log('mood  名次        超过%');
for(const m of [25700,25680,20200,20100,20000,19999,10000,3000,1000,600,599,300,100]){
  console.log(String(m).padEnd(6), Math.round(rankOf(m,n)).toString().padEnd(11), pctOf(m,n).toFixed(2)+'%');
}
// 用户给的断言
console.log('\n20200 → 超过99.40%?',pctOf(20200,n).toFixed(2));
console.log('20000 → 名次 n*0.015 =',(rankOf(20000,n)/n).toFixed(3),'n');
console.log('600 → 名次 0.5n, 超过50%?',pctOf(600,n).toFixed(2));
console.log('100 → 名次 0.9n, 超过10%?',pctOf(100,n).toFixed(2));
