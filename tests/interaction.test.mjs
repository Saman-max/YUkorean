import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {topikQuestions} from '../public/learning-data.js';
test('learning flow: progress, vocabulary review, journal, grammar, chat, exam and backup persist',async()=>{
 const dom=new JSDOM('<!doctype html><html><head><meta name="app-base" content="/YUKorean/"></head><body><div id="app"></div><div id="toast"></div></body></html>',{url:'https://saman-max.github.io/YUKorean/learn/'});
 for(const key of ['window','document','location','localStorage'])globalThis[key]=dom.window[key];
 window.scrollTo=()=>{};window.speechSynthesis={cancel(){},getVoices(){return[]},speak(){}};globalThis.speechSynthesis=window.speechSynthesis;
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false};
 await import('../public/learn.js');
 const click=s=>{const el=document.querySelector(s);assert.ok(el,`missing ${s}`);el.click();};
 const go=async(route)=>{location.hash='/'+route;window.dispatchEvent(new window.HashChangeEvent('hashchange'));await new Promise(r=>setTimeout(r,5));};
 const submit=id=>document.querySelector(id).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 const data=()=>JSON.parse(localStorage.getItem('yukorean-progress'));
 assert.match(document.querySelector('h1').textContent,/안녕/);
 assert.ok([...document.querySelectorAll('img')].every(i=>i.src.includes('/YUKorean/brand/assets/')));
 await go('phonetics');assert.equal(document.querySelectorAll('.letter').length,40);click('[data-action="letter"]');click('[data-action="complete-letter"]');assert.ok(data().completed.includes('phonetic:ㅏ'));
 await go('vocabulary');assert.equal(document.querySelectorAll('.word-card').length,60);click('[data-action="save-word"][data-id="0"]');assert.deepEqual(data().saved,[0]);
 const input=document.querySelector('#word-search');input.value='咖啡';input.dispatchEvent(new window.Event('input',{bubbles:true}));assert.equal(document.querySelectorAll('.word-card').length,2);
 await go('review');click('[data-action="reveal"]');click('[data-action="rate-word"][data-known="true"]');assert.equal(data().reviews['0'].interval,1);assert.match(document.querySelector('#main-content').textContent,/复习完成/);
 await go('diary/1');document.querySelector('#diary-note').value='오늘은 행복해요.';click('[data-action="complete-diary"]');assert.equal(data().notes['1'],'오늘은 행복해요.');assert.ok(data().completed.includes('diary:1'));
 await go('grammar/1');click('[data-action="grammar-answer"][data-answer="이에요"]');assert.match(document.querySelector('#answer-feedback').textContent,/答对/);click('[data-action="complete-grammar"]');assert.ok(data().completed.includes('grammar:1'));
 await go('reading/1');click('[data-action="complete-reading"]');assert.ok(data().completed.includes('reading:1'));
 await go('speaking/cafe');click('[data-action="suggestion"]');assert.equal(document.querySelectorAll('.message').length,3);assert.match(document.querySelector('.message:last-child').textContent,/따뜻한/);
 await go('topik');click('[data-action="exam-start"]');for(let id=0;id<topikQuestions.length;id++){
  const choice=[...document.querySelectorAll('[data-action="exam-answer"]')].find(b=>b.dataset.answer===topikQuestions[id].answer);assert.ok(choice);choice.click();if(id<topikQuestions.length-1)click('[data-action="exam-next"]');
 }click('[data-action="exam-submit"]');assert.equal(data().examScores.at(-1).score,100);assert.equal(document.querySelectorAll('.answer-review').length,8);
 await go('analysis');document.querySelector('#analysis-input').value='카페에서 커피를 마셔요.';submit('#analysis-form');assert.match(document.querySelector('#analysis-result').textContent,/에서/);
 await go('settings');document.querySelector('#name-input').value='<script>alert(1)</script>';submit('#name-form');await go('learn');assert.ok(!document.querySelector('#main-content script'));assert.match(document.querySelector('h1').textContent,/<script>/);
 for(const route of ['practice','progress','radio','reading','grammar','diary','speaking']){await go(route);assert.ok(document.querySelector('#main-content h1'),route);}
 dom.window.close();
});
