import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,validateState,localDay,scheduleReview,streak,dueWords} from '../public/learning-state.js';
import {phoneticGroups,words,diaries,grammar,readings,topikQuestions} from '../public/learning-data.js';
test('content integrity: 40 unique letters and referenced curriculum',()=>{
 const letters=phoneticGroups.flatMap(g=>g.items.map(r=>r[0]));assert.equal(letters.length,40);assert.equal(new Set(letters).size,40);assert.equal(words.length,60);
 diaries.forEach(d=>{assert.ok(d.wordIds.every(id=>words[id]));assert.ok(grammar.some(g=>g.pattern===d.grammar)||d.grammar==='에 가요'||d.grammar==='같이');});
 [...grammar,...readings,...topikQuestions].forEach(q=>assert.ok(q.options.includes(q.answer)));
});
test('spaced repetition: missed words recur in 10 minutes, known words grow and cap',()=>{
 const now=1000;assert.deepEqual(scheduleReview(null,false,now),{interval:0,due:601000});
 assert.deepEqual(scheduleReview(null,true,now),{interval:1,due:86401000});
 assert.equal(scheduleReview({interval:4},true,now).interval,8);assert.equal(scheduleReview({interval:256},true,now).interval,365);
});
test('review queue excludes future words and includes unscheduled words',()=>{
 assert.deepEqual(dueWords([1,2,3],{1:{due:20},2:{due:10}},15),[2,3]);
});
test('streak is stable through today, yesterday, and a break',()=>{
 const d=new Date(2026,10,7,23,50);assert.equal(localDay(d),'2026-11-07');
 assert.equal(streak({'2026-11-07':1,'2026-11-06':2,'2026-11-05':1},d),3);
 assert.equal(streak({'2026-11-06':1,'2026-11-05':1},d),2);
 assert.equal(streak({'2026-11-05':1},d),0);
});
test('backup validation rejects invalid schema and strips unexpected state',()=>{
 assert.throws(()=>validateState(null));assert.throws(()=>validateState({version:2,completed:[],saved:[]}));
 const s=validateState({...freshState(),saved:[1,1,-1,60,'2'],completed:['diary:1','diary:1','garbage'],reviews:{1:{due:1000,interval:1},2:{due:'bad',interval:0}},notes:{1:'hello'},admin:true});
 assert.deepEqual(s.saved,[1]);assert.deepEqual(s.completed,['diary:1']);assert.equal(s.admin,undefined);assert.deepEqual(s.reviews,{1:{due:1000,interval:1}});assert.equal(s.notes[1],'hello');
 assert.deepEqual(validateState(JSON.parse(JSON.stringify(freshState()))),freshState());
});
