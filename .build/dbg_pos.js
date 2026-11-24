const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('C:/Users/lenovo/WorkBuddy/2026-11-18-20-03-11/数学_升级版.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function fakeEl(){return{style:{},dataset:{},children:[],value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},removeEventListener(){},appendChild(){},remove(){},setAttribute(){},getAttribute(){return null},focus(){},blur(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100}},querySelector(){return fakeEl()},querySelectorAll(){return[]}}}
const els={},store={};
const document={getElementById(id){return els[id]||(els[id]=fakeEl())},createElement(){return fakeEl()},addEventListener(){},body:fakeEl(),documentElement:fakeEl()};
const sb={document,console,Math,Date,JSON,Number,String,Array,Object,parseInt,parseFloat,isNaN,isFinite,Function,
  localStorage:{getItem(k){return k in store?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  AndroidStore:{getHistory(){return null},setHistory(){}}, setInterval(){return 0},clearInterval(){},setTimeout(){return 0},clearTimeout(){},alert(){},confirm(){return false},navigator:{userAgent:'node'}};
sb.window=sb;sb.globalThis=sb;vm.createContext(sb);vm.runInContext(code,sb,{filename:'game.js'});
const src=`(function(){
 // 复刻 secretMakeSpecial 的核心，但固定 POS，统计成功率
 function test(type,POS,floor,cap,N){
   let ok=0,failHint=0,failRange=0;
   for(let t=0;t<N;t++){
     const V=getRandomInt(floor,cap);
     let done=false;
     for(let at=0;at<200;at++){
       let a,b,c,text,calc,target;
       const VV=getRandomInt(floor,cap);
       if(type===4){ if(VV<12)continue; b=getRandomInt(10,Math.min(999,VV-1)); a=VV-b; if(a<1)continue; target=b; text=a+' + '+secretFireNumber(b,POS); calc=d=>a+secretReplaceDigit(b,POS,d); }
       else if(type===6){ if(VV<14)continue; c=getRandomInt(10,Math.min(999,VV-4)); const pairs=secretFactorPairs(VV-c); if(!pairs.length)continue; const pr=pairs[getRandomInt(0,pairs.length-1)]; a=pr[0]; b=pr[1]; target=c; text=a+' × '+b+' + '+secretFireNumber(c,POS); calc=d=>a*b+secretReplaceDigit(c,POS,d); }
       else continue;
       const map={}; const od=secretDigitAt(target,POS);
       for(let d=0;d<=9;d++){ const v=calc(d); map[v]=(map[v]||0)+1; }
       const list=Object.keys(map).map(Number); if(list.length<2)continue;
       const ans=calc(od); if(ans<floor*0.5||ans>cap*2)continue;
       const hints=secretGreedHints(ans,list.map(x=>({ans:x})));
       if(!hints){failHint++;continue;}
       ok++;done=true;break;
     }
   }
   return {type,POS,ok,failHint};
 }
 const R=[];
 for(const ty of [4,6]) for(const pos of [0,1,2]) R.push(test(ty,pos,200,2800,300));
 return R;
})()`;
console.log(JSON.stringify(vm.runInContext(src,sb),null,1));
