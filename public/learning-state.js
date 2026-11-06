import {words,diaries,grammar,readings,topikQuestions} from './learning-data.js';
export const freshState=()=>({version:2,name:'旅人',completed:[],saved:[],reviews:{},activity:{},notes:{},lessonAnswers:{},mistakes:[],examScores:[],theme:'light',_clocks:{}});
export function localDay(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function validateState(input){
 if(!input||![1,2].includes(input.version)||!Array.isArray(input.completed)||!Array.isArray(input.saved))throw Error('不是有效的学习记录文件');
 const state={...freshState(),name:String(input.name||'旅人').slice(0,32),theme:input.theme==='dark'?'dark':'light'};
 const max={diary:diaries.length,grammar:grammar.length,reading:readings.length};
 state.completed=[...new Set(input.completed.filter(x=>{if(typeof x!=='string')return false;const [kind,id]=x.split(':');return kind==='phonetic'?/^[ㄱ-ㅎㅏ-ㅣ]$/.test(id):max[kind]&&Number.isInteger(Number(id))&&Number(id)>0&&Number(id)<=max[kind];}))];
 state.saved=[...new Set(input.saved.filter(x=>Number.isInteger(x)&&x>=0&&x<words.length))];
 for(const [k,v] of Object.entries(input.reviews||{}))if(/^\d+$/.test(k)&&Number(k)<words.length&&v&&Number.isFinite(v.due)&&Number.isInteger(v.interval)&&v.interval>=0&&v.interval<=365)state.reviews[k]={due:v.due,interval:v.interval};
 for(const [k,v] of Object.entries(input.activity||{}))if(/^\d{4}-\d{2}-\d{2}$/.test(k)&&Number.isFinite(v)&&v>=0&&v<1000000)state.activity[k]=v;
 for(const [k,v] of Object.entries(input.notes||{}))if(/^\d+$/.test(k)&&Number(k)>0&&Number(k)<=diaries.length&&typeof v==='string')state.notes[k]=v.slice(0,10000);
 for(const [k,v] of Object.entries(input.lessonAnswers||{}))if(/^\d+:\d+$/.test(k)&&typeof v==='string')state.lessonAnswers[k]=v.slice(0,1000);
 state.mistakes=Array.isArray(input.mistakes)?[...new Set(input.mistakes.filter(x=>Number.isInteger(x)&&x>=0&&x<topikQuestions.length))]:[];
 state.examScores=Array.isArray(input.examScores)?input.examScores.filter(x=>Number.isFinite(x?.score)&&x.score>=0&&x.score<=100&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).slice(-300).map(x=>({id:typeof x.id==='string'?x.id.slice(0,100):`${x.date}:${x.score}`,date:x.date,score:x.score})):[];
 for(const [k,v] of Object.entries(input._clocks||{}).slice(0,12000))if(/^(name|theme|reviews:\d+|saved:\d+|mistakes:\d+|activity:\d{4}-\d{2}-\d{2}|notes:\d+|lessonAnswers:\d+:\d+)$/.test(k)&&Number.isSafeInteger(v?.at)&&v.at>0&&typeof v.device==='string')state._clocks[k]={at:v.at,device:v.device.slice(0,80)};
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
