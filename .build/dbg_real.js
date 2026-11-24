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
 const ns={v:0};const samples=[];
 const posCount={0:0,1:0,2:0};
 for(let t=0;t<6000;t++){
   const q=generateSecretProblem(60,1+(t%120),ns);
   if(!q||!q.special) continue;
   const m=q.text.match(/(\\d*)🔥(\\d*)/);
   let p=-1;
   if(m) p=m[2].length;
   if(p in posCount) posCount[p]++;
   if(samples.length<12) samples.push(q.text);
 }
 return {posCount,samples};
})()`;
console.log(JSON.stringify(vm.runInContext(src,sb),null,1));
