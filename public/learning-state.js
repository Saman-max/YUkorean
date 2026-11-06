export const freshState=()=>({version:1,name:'旅人',completed:[],saved:[],reviews:{},activity:{},notes:{},mistakes:[],examScores:[],theme:'light'});
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function validateState(input){
 if(!input||input.version!==1||!Array.isArray(input.completed)||!Array.isArray(input.saved))throw Error('不是有效的学习记录文件');
 const state={...freshState(),name:String(input.name||'旅人').slice(0,32),theme:input.theme==='dark'?'dark':'light'};
 state.completed=[...new Set(input.completed.filter(x=>typeof x==='string'&&/^(phonetic|diary|grammar|reading):[\wㅏ-ㅣㄱ-ㅎ-]+$/.test(x)))];
 state.saved=[...new Set(input.saved.filter(x=>Number.isInteger(x)&&x>=0&&x<60))];
 for(const [k,v] of Object.entries(input.reviews||{}))if(/^\d+$/.test(k)&&v&&Number.isFinite(v.due)&&Number.isInteger(v.interval)&&v.interval>=0&&v.interval<=365)state.reviews[k]={due:v.due,interval:v.interval};
 for(const [k,v] of Object.entries(input.activity||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&Number.isFinite(v)&&v>=0)state.activity[k]=v;
 for(const [k,v] of Object.entries(input.notes||{}))if(/^\d+$/.test(k)&&typeof v==='string')state.notes[k]=v.slice(0,10000);
 state.mistakes=Array.isArray(input.mistakes)?[...new Set(input.mistakes.filter(x=>Number.isInteger(x)&&x>=0&&x<8))]:[];
 state.examScores=Array.isArray(input.examScores)?input.examScores.filter(x=>Number.isFinite(x?.score)&&x.score>=0&&x.score<=100&&typeof x.date==='string').slice(-100):[];
 return state;
}
export function scheduleReview(previous,remembered,now=Date.now()){
 const interval=remembered?Math.min(365,previous?.interval?Math.max(1,previous.interval*2):1):0;
 return {interval,due:now+(remembered?interval*86400000:600000)};
}
export function streak(activity,date=new Date()){
 const d=new Date(date);d.setHours(12,0,0,0);let count=0;
 if(!activity[localDay(d)])d.setDate(d.getDate()-1);
 while(activity[localDay(d)]){count++;d.setDate(d.getDate()-1);}
 return count;
}
export function dueWords(saved,reviews,now=Date.now()){return saved.filter(id=>!reviews[id]||reviews[id].due<=now);}
