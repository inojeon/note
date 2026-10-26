import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
'use strict';

const el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)'),input=el('cfg-choice');
const choices=[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],names=['aα','aβ','bα','bβ'];
function draw(){
 const k=Number(input.value),occupied=choices[k],na=occupied.filter(i=>i<2).length,nb=2-na,ms=occupied.reduce((s,i)=>s+(i%2?-.5:.5),0),count=na===1?4:1;
 const bits=names.map((_,i)=>occupied.includes(i)?1:0).join('');el('cfg-bits').textContent='점유 비트열 '+bits+' · 전자 수 2 · Mₛ = (Nα − Nβ)/2 = '+ms;el('cfg-bits').dataset.bits=bits;el('cfg-choice-value').textContent=(k+1)+' / 6';el('cfg-spatial').textContent=na===2?'a²':nb===2?'b²':'a¹b¹';el('cfg-count').textContent=String(count);el('cfg-count').setAttribute('data-value',count);el('cfg-ms').textContent=String(ms);el('cfg-ms').setAttribute('data-value',ms);el('cfg-determinant').textContent='D['+occupied.map(i=>names[i]).join(', ')+']';
 document.querySelectorAll('[data-cfg-choice]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.cfgChoice)===k)));
 const w=mq.matches?360:600,h=mq.matches?290:190,plot=el('cfg-occupancy-fig');plot.setAttribute('viewBox','0 0 '+w+' '+h);
 let svg='<title>공간 배치 '+el('cfg-spatial').textContent+', 점유 '+occupied.map(i=>names[i]).join(', ')+'</title><g font-family="system-ui,sans-serif" fill="var(--ink)">';
 ['a','b'].forEach((name,j)=>{const x=mq.matches?40:30+j*300,y=mq.matches?22+j*130:25;svg+='<text x="'+x+'" y="'+y+'" font-size="16">공간 오비탈 '+name+' · '+(j?nb:na)+'전자</text>';[0,1].forEach(s=>{const xx=x+s*125,yy=y+20,on=occupied.includes(j*2+s);svg+='<rect x="'+xx+'" y="'+yy+'" width="105" height="65" rx="8" fill="var('+(on?'--nsoft':'--code')+')" stroke="var(--line)"/><text x="'+(xx+52)+'" y="'+(yy+43)+'" text-anchor="middle" font-size="28" fill="var('+(s?'--beta':'--alpha')+')">'+(on?(s?'↓':'↑'):'—')+'</text><text x="'+(xx+52)+'" y="'+(yy+88)+'" text-anchor="middle" font-size="14">'+name+(s?'β':'α')+'</text>'})});plot.innerHTML=svg+'</g>';
 el('cfg-status').textContent=na===1?'공간 배치는 모두 a¹b¹입니다. 가운데 네 예시를 바꾸면 공간 점유는 그대로이고 스핀 궤도 점유와 행렬식이 달라집니다.':'공간 오비탈 하나에 α, β가 함께 있습니다. 이 공간 배치에 해당하는 스핀 궤도 점유는 하나입니다.';
}
function drawAll(){try{draw()}catch(e){throw e;}}input.addEventListener('input',drawAll);document.querySelectorAll('[data-cfg-choice]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.cfgChoice;drawAll()}));mq.addEventListener('change',drawAll);drawAll();

})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
