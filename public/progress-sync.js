// Pure merge logic shared by browsers and the service. Deletions retain clocks.
export const trackedFields=['name','theme'];
const mapFields=['reviews','activity','notes','lessonAnswers'];
const setFields=['saved','mistakes'];
export function compareClock(a,b){return (a?.at||0)-(b?.at||0)||String(a?.device||'').localeCompare(String(b?.device||''));}
export function stampChanges(previous,next,device,now=Date.now()){
 const clocks={...(previous?._clocks||{}),...(next._clocks||{})};
 const stamp=k=>{const at=Math.max(now,(clocks[k]?.at||0)+1);clocks[k]={at,device};};
 for(const key of trackedFields)if(previous?.[key]!==next[key])stamp(key);
 for(const field of mapFields){const a=previous?.[field]||{},b=next[field]||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(JSON.stringify(a[k])!==JSON.stringify(b[k]))stamp(`${field}:${k}`);}
 for(const field of setFields){const a=new Set(previous?.[field]||[]),b=new Set(next[field]||[]);for(const k of new Set([...a,...b]))if(a.has(k)!==b.has(k))stamp(`${field}:${k}`);}
 return {...next,_clocks:clocks};
}
export function mergeProgress(a,b){
 if(!a)return structuredClone(b);if(!b)return structuredClone(a);
 const result={...a,version:2,_clocks:{...a._clocks}},clock=k=>compareClock(a._clocks?.[k],b._clocks?.[k]);
 for(const k of Object.keys(b._clocks||{}))if(clock(k)<0)result._clocks[k]=b._clocks[k];
 for(const field of trackedFields)if(clock(field)<0)result[field]=b[field];
 for(const field of mapFields){result[field]={};for(const k of new Set([...Object.keys(a[field]||{}),...Object.keys(b[field]||{})])){const key=`${field}:${k}`;const source=clock(key)<0?b:clock(key)>0?a:(k in (b[field]||{})?b:a);if(k in (source[field]||{}))result[field][k]=structuredClone(source[field][k]);}}
 for(const field of setFields){const av=new Set(a[field]||[]),bv=new Set(b[field]||[]);result[field]=[...new Set([...av,...bv,...Object.keys(result._clocks).filter(k=>k.startsWith(field+':')).map(k=>Number(k.slice(field.length+1)))])].filter(id=>{const c=clock(`${field}:${id}`);return c<0?bv.has(id):c>0?av.has(id):av.has(id)||bv.has(id);}).sort((x,y)=>x-y);}
 result.completed=[...new Set([...(a.completed||[]),...(b.completed||[])])].sort();
 const scores=new Map();for(const row of [...(a.examScores||[]),...(b.examScores||[])])scores.set(row.id||`${row.date}:${row.score}`,row);result.examScores=[...scores.values()].sort((x,y)=>String(x.date).localeCompare(String(y.date))).slice(-300);
 return result;
}
