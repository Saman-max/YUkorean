import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeProgress,stampChanges} from '../public/progress-sync.js';
import {freshState,validateState} from '../public/learning-state.js';
import {getProgress,putProgress,getChat,listChats} from '../cloud-app/lib/progress-service.mjs';
import {chatTurn,parseTutorResponse} from '../cloud-app/lib/ai-service.mjs';
import {database} from './helpers/sqlite.mjs';
const alice={userId:'alice'},bob={userId:'bob'};
const output={reply:'따뜻한 커피 한 잔 드릴게요. 다른 것도 필요하세요?',translation:'给您一杯热咖啡，还需要其他的吗？',correction:'',corrected:'',suggestions:['아니요, 감사합니다.','빵도 주세요.']};
const provider=async()=>Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(output)}]}]});
test('cloud progress: real SQLite, per-user isolation, optimistic conflicts, validation',async()=>{
 const db=database();try{
 await assert.rejects(()=>getProgress(db,null),e=>e.status===401);
 const s=freshState();s.notes[1]='비밀 문장';let result=await putProgress(db,alice,{state:s,revision:0},validateState);assert.equal(result.revision,1);
 assert.equal((await getProgress(db,bob)).state,null);
 const stale=await putProgress(db,alice,{state:freshState(),revision:0},validateState);assert.equal(stale.conflict,true);assert.equal(stale.state.notes[1],'비밀 문장');
 await assert.rejects(()=>putProgress(db,alice,{state:null,revision:1},validateState),e=>e.status===400);
 }finally{db.close();}
});
test('merge: completion unions, saved deletions stay deleted, concurrent notes survive',()=>{
 const base=freshState();base.saved=[1,2];base.notes[1]='old';
 const a=structuredClone(base);a.saved=[2];a.completed=['diary:1'];a.notes[1]='new';
 const b=structuredClone(base);b.saved.push(3);b.completed=['grammar:1'];b.notes[2]='another';
 const av=stampChanges(base,a,'phone',100),bv=stampChanges(base,b,'laptop',101),merged=mergeProgress(av,bv);
 assert.deepEqual(merged.saved,[2,3]);assert.deepEqual(merged.completed,['diary:1','grammar:1']);assert.equal(merged.notes[1],'new');assert.equal(merged.notes[2],'another');
 assert.deepEqual(mergeProgress(av,bv),mergeProgress(bv,av));assert.deepEqual(mergeProgress(merged,av),merged);
});
test('AI: actual request contract, history, idempotency and ownership with mocked provider',async()=>{
 const db=database();let calls=0;const mock=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(options.body);assert.equal(body.store,false);assert.equal(body.text.format.type,'json_schema');assert.equal(body.input.at(-1).content,'따뜻한 커피 주세요.');return provider();};
 try{
 const input={requestId:'request_00001',scenario:'cafe',message:'따뜻한 커피 주세요.'};const result=await chatTurn(db,alice,input,{apiKey:'test-only'},mock);
 assert.equal(result.assistant.text,output.reply);assert.equal(calls,1);
 const same=await chatTurn(db,alice,input,{apiKey:'test-only'},mock);assert.deepEqual(same,result);assert.equal(calls,1);
 assert.equal((await getChat(db,alice,result.sessionId)).messages.length,2);await assert.rejects(()=>getChat(db,bob,result.sessionId),e=>e.status===404);assert.equal((await listChats(db,bob)).length,0);
 await assert.rejects(()=>chatTurn(db,bob,{...input,requestId:'request_00002',sessionId:result.sessionId},{apiKey:'test-only'},mock),e=>e.status===404);
 }finally{db.close();}
});
test('AI: missing secrets, provider errors, retry and daily quota',async()=>{
 const db=database();const body={requestId:'failed_request',scenario:'cafe',message:'안녕하세요.'};
 try{
 await assert.rejects(()=>chatTurn(db,alice,body,{},provider),e=>e.code==='ai_not_configured');
 await assert.rejects(()=>chatTurn(db,alice,body,{apiKey:'test-only',dailyLimit:1},async()=>new Response('',{status:429})),e=>e.code==='provider_limit');
 await chatTurn(db,alice,body,{apiKey:'test-only',dailyLimit:1},provider);
 await assert.rejects(()=>chatTurn(db,alice,{...body,requestId:'second_request'},{apiKey:'test-only',dailyLimit:1},provider),e=>e.code==='daily_limit');
 assert.throws(()=>parseTutorResponse({status:'incomplete'}),e=>e.code==='ai_incomplete');
 assert.throws(()=>parseTutorResponse({output:[{content:[{type:'refusal'}]}]}),e=>e.code==='ai_refusal');
 }finally{db.close();}
});
