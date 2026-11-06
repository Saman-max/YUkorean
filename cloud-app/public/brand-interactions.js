import {phoneticGroups,diaries,words,grammar,scenarios} from './learning-data.js';
const base=document.querySelector('meta[name="app-base"]').content;
const routes={sound:'phonetics',vocabulary:'vocabulary',grammar:'grammar',analysis:'analysis','ai-chat':'speaking',practice:'practice',blog:'diary',reading:'reading',topik:'topik',radio:'radio',diary:'diary'};
const learn=r=>`${base}learn/#/${r||'learn'}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storedTheme;try{storedTheme=localStorage.getItem('tori-brand-theme');}catch{}
function setTheme(theme){document.documentElement.dataset.theme=theme;try{localStorage.setItem('tori-brand-theme',theme);}catch{}document.querySelectorAll('.theme-toggle').forEach(b=>{b.setAttribute('aria-pressed',String(theme==='dark'));b.setAttribute('aria-label',theme==='dark'?'切换浅色模式':'切换暗色模式');});}
setTheme(storedTheme==='dark'?'dark':'light');
const dialog=document.createElement('dialog');dialog.className='replica-dialog';dialog.setAttribute('aria-label','兔莉的小窗口');document.body.append(dialog);let previousFocus;
function open(html){previousFocus=document.activeElement;dialog.innerHTML=`<button class="rd-close" aria-label="关闭窗口">×</button>${html}`;if(!dialog.open)dialog.showModal();}
function close(){dialog.close();previousFocus?.focus();}
dialog.addEventListener('click',e=>{if(e.target.closest('.rd-close')||e.target===dialog)close();});dialog.addEventListener('close',()=>{'speechSynthesis'in window&&speechSynthesis.cancel();});
const mark=document.createElement('button');mark.className='replica-mark';mark.textContent='界面复刻 · 非官方网站';document.body.append(mark);
const about=()=>open(`<div class="rd-eyebrow">YUKOREAN · PRODUCT RECONSTRUCTION</div><h2>因为喜欢，想了解它如何工作。</h2><p>这是参考 Tori Korean 公开页面制作的独立学习研究版本。官网布局、图片和文案来自参考站；学习中心由本项目独立实现。</p><p>本版本不处理原站账号、会员订单或付款。可以直接体验发音、日记、词汇、语法、阅读和离线情境练习，进度保存在本浏览器。</p><a class="rd-button primary" href="${learn()}">开始我的韩语旅程 ↗</a><a class="rd-button" href="https://github.com/Saman-max/YUkorean" target="_blank" rel="noopener">查看项目源码</a>`);mark.addEventListener('click',about);
function speak(text){if(!('speechSynthesis'in window)){open('<h2>当前设备暂不支持朗读</h2><p>请在系统中安装韩语语音包，或切换到支持语音朗读的浏览器。</p>');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ko-KR';u.rate=.8;speechSynthesis.speak(u);}
function feature(id){
 const r=routes[id]||'learn';const content={
  sound:['从一个声音开始','韩语 40 音',`<p>轻点字母，听听韩语最初的声音。</p><div class="rd-letters">${phoneticGroups[0].items.map(l=>`<button data-speak="${l[2]}">${l[0]}<small>${l[1]}</small></button>`).join('')}</div>`],
  diary:['DAY 01 · 出发去兽尔','先把勇气，装进行李。',`<div class="rd-preview"><strong lang="ko">${diaries[0].ko}</strong><p>${diaries[0].translation}</p></div><p>听故事、学新词，再写下一句属于你的韩语。</p>`],
  vocabulary:['WORDS IN YOUR POCKET','把新词装进口袋',`<div class="rd-letters">${words.slice(0,5).map(w=>`<button data-speak="${w.ko}" style="font-size:15px">${w.ko}<small>${w.zh}</small></button>`).join('')}</div><p>词汇卡片、例句朗读、收藏与间隔复习。</p>`],
  grammar:['WORDS BECOME STORIES','让词，连成自己的话。',`<div class="rd-preview"><strong>이에요 / 예요</strong><p>저는 토리예요. — 我是兔莉。</p></div><p>42 个语法点，配合例句与随堂小测验。</p>`],
  'ai-chat':['HELLO, NEW FRIEND','从“你好”，聊到“明天见”。',`<p>在狐狸咖啡馆点单、认识兔莉，或去街角小店逛逛。云端登录后可进行真实 OpenAI 对话。</p><div class="rd-discovery">${scenarios.map(s=>`<a href="${learn('speaking/'+s.id)}">${s.icon} ${s.name} ↗</a>`).join('')}</div>`]
 }[id]||['EXPLORE YOUR NEXT CHAPTER',{'analysis':'猫头鹰解词屋','practice':'把韩语，用起来。','reading':'晚安书店','topik':'朝着下一站，再走近一点。','radio':'晚安之前，再听一小段。','blog':'每一天，都有新的自己。'}[id]||'下一站，兽尔。','<p>打开学习中心，按自己的节奏慢慢学会韩语。</p>'];
 open(`<div class="rd-eyebrow">${content[0]}</div><h2>${content[1]}</h2>${content[2]}<a class="rd-button primary" href="${learn(r)}">进入${content[1].replace(/[。]/g,'')} ↗</a>`);
}
// Point all learning entries at this project's own learning runtime.
for(const a of document.querySelectorAll('a[href]')){
 const url=new URL(a.href);const p=url.pathname.slice(base.length-1);
 const map={'/diary':'diary','/grammar':'grammar','/phonetics':'phonetics','/vocabulary':'vocabulary','/radio':'radio','/reading':'reading','/topik':'topik','/mine/membership':'settings','/scene/custom/new':'speaking'};
 if(map[p.replace(/\/$/,'')])a.href=learn(map[p.replace(/\/$/,'')]);
 if(url.hostname.endsWith('torikorean.cn')){a.href=learn();a.removeAttribute('target');}
 if(p==='/learn'||p==='/learn/')a.href=learn();
 if(p.startsWith('/downloads/')||p.startsWith('/api/app-update')||url.hostname==='apps.apple.com'||url.hostname==='play.google.com'){a.href='#web-download';a.dataset.webDownload='true';}
 if(a.href.startsWith('mailto:')){a.href='https://github.com/Saman-max/YUkorean/issues';a.textContent='项目反馈';}
}
let photoIndex=0;
const photos=[...document.querySelectorAll('.sj-photo-crop img')].map(i=>i.src);
const roomGroups=[['从第一个音开始','每个新的声音，都是认识世界的新方式。',[['phonetics','韩语40音'],['vocabulary','词汇商店'],['grammar','语法学习']]],['在故事里学习','跟兔莉一起，在兽尔过七天小日子。',[['diary','兔莉日记'],['reading','晚安书店']]],['把韩语用起来','先听懂一点，再慢慢说出心里的话。',[['radio','兽尔电台'],['speaking','情境对话'],['practice','综合练习']]],['继续探索','下一页，该写你的故事了。',[['learn','学习地图'],['progress','我的学习记录']]]];
function room(index){const g=roomGroups[index];let target=document.querySelector('.replica-room-discovery');if(!target){target=document.createElement('div');target.className='replica-room-discovery';document.querySelector('#directory')?.append(target);}if(!target)return;target.innerHTML=`<h3>${g[0]}</h3><p>${g[1]}</p><div class="rd-discovery">${g[2].map(([r,n])=>`<a href="${learn(r)}">${n} ↗</a>`).join('')}</div>`;document.querySelectorAll('[aria-controls="tori-room-discovery"]').forEach(b=>b.setAttribute('aria-expanded','true'));target.scrollIntoView({block:'nearest',behavior:'smooth'});}
function letter(opened){const stage=document.querySelector('.tori-letter-stage');stage.dataset.phase=opened?'open':'closed';stage.dataset.side='front';stage.setAttribute('aria-expanded',String(opened));document.querySelectorAll('.tori-letter-turn').forEach(b=>b.disabled=!opened);stage.querySelectorAll('[inert]').forEach(el=>el.inert=!opened);stage.querySelectorAll('[aria-hidden]').forEach(el=>el.setAttribute('aria-hidden',String(!opened)));document.querySelector('.tori-letter-seal').setAttribute('aria-expanded',String(opened));}
function gallery(img){if(img)open(`<img src="${esc(img.src)}" alt="${esc(img.alt||'图片预览')}">`);}
document.addEventListener('click',e=>{
 const b=e.target.closest('button,a[data-web-download]');if(!b)return;
 if(b.dataset.webDownload){e.preventDefault();open(`<div class="rd-eyebrow">TAKE YOUR LEARNING WITH YOU</div><h2>打开网页，就能开始。</h2><p>本复刻版提供网页版，适配手机和电脑。你可以在浏览器菜单中选择“添加到主屏幕”，随时找到自己的学习空间。</p><p>页面中展示的原站安装包不属于本项目，因此下载入口统一使用当前网页版。</p><a class="rd-button primary" href="${learn()}">打开学习中心 ↗</a>`);return;}
 if(b.matches('.theme-toggle'))setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 if(b.matches('.menu-toggle')){const menu=document.getElementById(b.getAttribute('aria-controls'));const shell=menu?.closest('.mobile-menu-shell,.seo-mobile-menu-shell')||menu;if(shell){const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));shell.dataset.open=String(open);shell.inert=!open;menu?.setAttribute('aria-hidden',String(!open));shell.hidden=!open;}}
 if(b.dataset.featureEntry)feature(b.dataset.featureEntry);
 if(b.dataset.speak)speak(b.dataset.speak);
 if(b.matches('.sj-postcard-front,.sj-flip-back'))document.querySelector('.sj-postcard')?.classList.toggle('is-flipped');
 if(b.matches('[aria-label="下一张生活照片"],[aria-label="上一张生活照片"]')){const image=document.querySelector('.sj-photo-crop img');photoIndex=(photoIndex+(b.getAttribute('aria-label').startsWith('下一')?1:-1)+diaries.length)%diaries.length;if(image){image.src=base+'brand/assets/'+(photoIndex%2?'tori-little-room.v-5f43cd8dfdbd6b41.webp':'w1-tori-meet-haru-0.v-fec135229bf057d4.jpg');image.alt=diaries[photoIndex].title;}const counter=document.querySelector('.sj-postcard-counter,.sj-photo-controls>span');if(counter)counter.textContent=`0${photoIndex+1} / 07`;}
 if(b.matches('.sj-lamp-switch')){const night=document.querySelector('.sj-night');const on=night.classList.toggle('lamp-on');b.setAttribute('aria-pressed',String(on));}
 if(b.matches('.scene-radio-play')){const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));if(on)speak('안녕하세요. 오늘은 서울에서 보낸 첫 주말 이야기를 들려 드릴게요.');else if('speechSynthesis'in window)speechSynthesis.cancel();}
 if(b.matches('[aria-controls="tori-room-discovery"]')){const all=[...document.querySelectorAll('[aria-controls="tori-room-discovery"]')];room(all.indexOf(b)%4);}
 if(b.matches('.tori-letter-seal'))letter(true);
 if(b.matches('.tori-letter-turn')){const stage=document.querySelector('.tori-letter-stage');stage.dataset.side=stage.dataset.side==='front'?'back':'front';}
 if(b.closest('.tori-letter')&&b.textContent.includes('把信收好'))letter(false);
 if(b.matches('[data-seo-event="brand_checkout_start"]')||b.matches('.mp-primary'))open(`<div class="rd-eyebrow">MEMBERSHIP · DESIGN PREVIEW</div><h2>喜欢的事，慢慢学。</h2><p>这里展示的是参考产品的会员页面。本复刻版没有收费服务，课程、收藏、复习和学习记录都可以直接体验。</p><div class="rd-price-note">不会跳转到原站支付，也不会创建订单。</div><a class="rd-button primary" href="${learn()}">免费进入学习中心 ↗</a>`);
 if(b.matches('[id^="membership-tab-"]')){document.querySelectorAll('[id^="membership-tab-"]').forEach(t=>t.setAttribute('aria-selected',String(t===b)));open(`<div class="rd-eyebrow">MEMBERSHIP · 方案对照</div><h2>${esc(b.textContent.trim())}</h2><p>参考产品用学习内容范围、AI 额度和学习支持区分会员档位。当前复刻版仅展示方案结构，不提供付费开通。</p><a class="rd-button primary" href="${learn()}">先开始学习 ↗</a>`);}
 if(b.matches('.mp-materials-preview'))gallery(b.querySelector('img'));
 if(b.matches('[id^="materials-tab-"],[id^="monthly-report-tab-"]')){const container=b.closest('section');const isReport=b.id.startsWith('monthly-report');const index=Number(b.id.slice(-1));const files=[...document.querySelectorAll('img')].filter(i=>i.src.includes(isReport?'membership-report':'membership-materials'));if(files[index])gallery(files[index]);else open(`<h2>${esc(b.textContent.trim())}</h2><p>资料目录展示。完整的学习记录可以在本项目学习中心查看和导出。</p><a class="rd-button primary" href="${learn('progress')}">查看我的学习记录 ↗</a>`);}
 if(b.matches('[id="select-lifetime"]'))document.querySelector('#membership-tab-lifetime')?.click();
 if(b.matches('.cl-keep')){const pressed=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(pressed));b.classList.toggle('replica-favorite',pressed);try{localStorage.setItem('yu-stamp-'+b.textContent.trim(),String(pressed));}catch{}}
 if(b.matches('.cl-hotspot')){const title=b.getAttribute('aria-label')?.replace('发现','')||b.textContent;open(`<div class="rd-eyebrow">A LITTLE DISCOVERY</div><h2>${esc(title)}</h2><p>小城里的每个细节，都可以成为学习的起点。带着刚刚遇见的新事物，写一句自己的韩语吧。</p><a class="rd-button primary" href="${learn('diary')}">打开兔莉日记 ↗</a>`);}
 if(b.getAttribute('role')==='tab'&&b.id.startsWith('cl-tab-')){const group=b.closest('[role="tablist"]');group?.querySelectorAll('[role="tab"]').forEach(t=>{const selected=t===b;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel){panel.hidden=!selected;panel.inert=!selected;}});}
 if(b.matches('.city-renovation-close'))b.closest('[role="dialog"]')?.remove();
 if(b.matches('.city-renovation-enter'))location.href=learn('speaking');
 if(b.matches('.kr-hero-explore'))document.querySelector('#korea-directory')?.scrollIntoView({behavior:'smooth'});
 if(b.getAttribute('aria-label')?.startsWith('收藏')){const value=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(value));b.classList.toggle('replica-favorite',value);try{localStorage.setItem('yu-place-'+b.getAttribute('aria-label'),String(value));}catch{}}
 if(b.matches('.kr-photo-open,.kr-school-photo-open')){const card=b.closest('article')||b.parentElement;gallery(card.querySelector('img'));}
 if(b.matches('.kr-share-button')){if(b.textContent.includes('导出'))window.print();else navigator.clipboard?.writeText(location.href).then(()=>{const text=b.textContent;b.textContent='链接已复制 ✓';setTimeout(()=>b.textContent=text,2000);}).catch(()=>open('<h2>复制当前页面地址</h2><p>浏览器未授予剪贴板权限，请从地址栏复制链接。</p>'));}
 if(b.getAttribute('aria-label')?.startsWith('出示韩语')){const container=b.closest('article')||b.parentElement;open(`<div class="rd-eyebrow">SHOW THIS LITTLE CARD</div><h2>${esc(b.getAttribute('aria-label').replace('出示韩语：',''))}</h2><div class="rd-korean">${esc(container.querySelector('[lang="ko"]')?.textContent||container.querySelector('strong')?.textContent||container.textContent.replace('出示大字卡',''))}</div><a class="rd-button primary" href="${learn('speaking')}">练习说出这句话 ↗</a>`);}
});
// Keep presentation tabs keyboard accessible.
document.addEventListener('keydown',e=>{const target=e.target;if(target.getAttribute('role')!=='tab'||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...target.parentElement.querySelectorAll('[role="tab"]')];if(!tabs.length)return;e.preventDefault();const i=tabs.indexOf(target),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();});
