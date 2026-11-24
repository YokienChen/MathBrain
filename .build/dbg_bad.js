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
 const bad=[];const ns={v:0};
 for(let t=0;t<20000;t++){
   const k=1+Math.floor(Math.random()*60), i=1+Math.floor(Math.random()*70);
   const q=generateSecretProblem(k,i,ns);
   if(!q||!q.special) continue;
   const cands=[];
   for(let d=0;d<=9;d++){
     let expr=q.text.replace('🔥',String(d)).replace(/×/g,'*').replace(/\\s/g,'');
     expr=expr.replace(/(^|[^\\w.])0+(\\d)/g,'$1$2');
     try{ cands.push(Function('return '+expr)()); }catch(e){ cands.push(NaN); }
   }
   const filtered=cands.filter(v=>q.hints.every(h=>secretDigitAt(v,h.p)===h.v));
   if(filtered.length!==1||filtered[0]!==q.answer){
     bad.push({text:q.text,answer:q.answer,hints:q.hints,cands,filtered});
     if(bad.length>=5)break;
   }
 }
 return bad;
})()`;
console.log(JSON.stringify(vm.runInContext(src,sb),null,1));
