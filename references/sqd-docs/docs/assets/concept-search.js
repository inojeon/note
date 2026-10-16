/* Local-only note search: the build embeds source text, never live lab values. */
(function(){
'use strict';
const dialog=document.getElementById('reader-search');
if(!dialog||typeof dialog.showModal!=='function')return;
const input=document.getElementById('reader-search-input'),list=document.getElementById('reader-search-results'),status=document.getElementById('reader-search-status');
const aliases=[[/큐비트/g,'큐빗'],[/백터/g,'벡터'],[/슈레딩거|슈뢰딩거|슈뢰덴거/g,'슈뢰딩거']];
function normalize(text){let s=text.normalize('NFKC').toLowerCase();for(const [pattern,replacement]of aliases)s=s.replace(pattern,replacement);return s.replace(/[^\p{L}\p{N}]/gu,'');}
const notes=JSON.parse(document.getElementById('reader-search-index').textContent).map(n=>({...n,key:normalize(n.title+' '+n.slug),bodyKey:normalize(n.text)}));
const mapOrder=['learning-maps','home','quantum-chemistry','quantum-computing','vqe','sqd'];
let composing=false;
function render(){
 const query=input.value.trim(),whole=normalize(query),tokens=query.split(/\s+/).map(normalize).filter(Boolean);
 let found;
 if(!query)found=mapOrder.map(slug=>notes.find(n=>n.slug===slug)).filter(Boolean);
 else if(!tokens.length)found=[];
 else found=notes.map(note=>{
  if(!tokens.every(t=>note.key.includes(t)||note.bodyKey.includes(t)))return null;
  return {note,score:(normalize(note.title.split('(')[0])===whole?200:note.key.startsWith(whole)?130:note.key.includes(whole)?100:0)+tokens.reduce((sum,t)=>sum+(note.key.includes(t)?20:1),0)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.note.title.localeCompare(b.note.title,'ko')).map(r=>r.note);
 list.replaceChildren();
 status.textContent=!query?'학습 지도를 고르거나 검색어를 입력하세요.':found.length?found.length+'개 결과'+(found.length>20?' · 상위 20개 표시':''):'검색 결과가 없습니다. 더 짧은 단어나 한국어·영어 용어로 검색해 보세요.';
 for(const note of found.slice(0,20)){
  const li=document.createElement('li'),link=document.createElement('a'),title=document.createElement('strong'),snippet=document.createElement('span');
  link.href='#'+note.slug;title.textContent=note.title;
  snippet.textContent=note.lead||note.text.slice(0,110);
  link.append(title,snippet);li.append(link);list.append(li);
 }
 list.scrollTop=0;
}
function open(){if(dialog.open)return;dialog.showModal();render();input.focus();input.select();}
function close(){if(dialog.open)dialog.close();}
document.getElementById('reader-search-open').addEventListener('click',open);
document.getElementById('reader-search-close').addEventListener('click',close);
input.addEventListener('compositionstart',()=>{composing=true;});
input.addEventListener('compositionend',()=>{composing=false;render();});
input.addEventListener('input',()=>{if(!composing)render();});
input.addEventListener('keydown',event=>{
 if(composing||event.isComposing||event.keyCode===229)return;
 const first=list.querySelector('a');
 if(event.key==='ArrowDown'&&first){event.preventDefault();first.focus();}
 if(event.key==='Enter'&&first){event.preventDefault();first.click();}
});
list.addEventListener('keydown',event=>{
 if(!['ArrowDown','ArrowUp'].includes(event.key))return;
 const links=Array.from(list.querySelectorAll('a')),i=links.indexOf(document.activeElement);if(i<0)return;
 event.preventDefault();if(event.key==='ArrowUp'&&i===0)input.focus();else links[Math.max(0,Math.min(links.length-1,i+(event.key==='ArrowDown'?1:-1)))].focus();
});
list.addEventListener('click',event=>{
 const link=event.target.closest('a');if(!link)return;close();
 // Also move focus correctly when choosing the already-visible page.
 requestAnimationFrame(()=>{const heading=document.getElementById('page-'+link.hash.slice(1))?.querySelector('h1');if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});window.scrollTo(0,0);}});
});
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();});
dialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&!composing&&!event.isComposing){event.preventDefault();close();}});
window.addEventListener('hashchange',close);
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();open();}});
})();
