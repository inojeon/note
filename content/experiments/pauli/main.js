import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
'use strict';
const get=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)');
const txt=(x,y,t,color='ink',anchor='start')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="var(--'+color+')" font-size="14">'+t+'</text>';
const line=(x1,y1,x2,y2,color='line',dash=false)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--'+color+')"'+(dash?' stroke-dasharray="4 4"':'')+'/>';
const occupied=[0,0,0,0],names=['A의 α','A의 β','B의 α','B의 β'];let message='모두 비어 있습니다. 스핀 오비탈 하나를 골라 전자를 추가해 보세요.';
function draw(){
 get('pauli-bits').textContent='점유 순서 (Aα, Aβ, Bα, Bβ): '+occupied.join('')+' · 각 자리 0 또는 1';get('pauli-bits').dataset.occupancy=occupied.join('');get('pauli-a-count').textContent=String(occupied[0]+occupied[1]);get('pauli-b-count').textContent=String(occupied[2]+occupied[3]);get('pauli-total').textContent=String(occupied.reduce((a,b)=>a+b,0));get('pauli-status').textContent=message;
 const narrow=mq.matches,w=narrow?300:620,h=narrow?335:235,boxW=narrow?90:106,boxH=78;
 let svg='<title>고정된 네 스핀 오비탈의 점유수</title>'+txt(w/2,25,'각 스핀 오비탈: 최대 1전자','ink','middle');
 [0,1].forEach(group=>{const gx=narrow?47:55+group*310,gy=narrow?65+group*145:75;
 svg+=txt(narrow?150:gx+110,gy-15,'공간 오비탈 '+(group?'B':'A'),'ink','middle');
 [0,1].forEach(s=>{const index=2*group+s,x=gx+s*(boxW+15),color=s?'beta':'alpha';svg+='<rect x="'+x+'" y="'+gy+'" width="'+boxW+'" height="'+boxH+'" rx="7" fill="var(--panel)" stroke="var(--'+color+')"/>';
 svg+=txt(x+boxW/2,gy+25,s?'β':'α',color,'middle')+txt(x+boxW/2,gy+58,occupied[index]?(s?'↓  1':'↑  1'):'비어 있음 · 0',color,'middle');});});
 get('pauli-occupation-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('pauli-occupation-fig').innerHTML=svg;
}
function drawAll(){try{draw();}catch(e){throw e;}}
['aa','ab','ba','bb'].forEach((name,i)=>get('pauli-add-'+name).addEventListener('click',()=>{if(occupied[i])message=names[i]+'는 이미 점유되어 있습니다. 같은 스핀 오비탈에 두 번째 전자를 추가할 수 없습니다.';else{occupied[i]=1;message=names[i]+'를 점유했습니다. 같은 공간 오비탈의 반대 스핀 자리는 서로 다른 스핀 오비탈입니다.';}drawAll();}));
document.querySelectorAll('[data-pauli-preset]').forEach(b=>b.addEventListener('click',()=>{const patterns={pair:[1,1,0,0],parallel:[1,0,1,0],full:[1,1,1,1]};occupied.splice(0,4,...patterns[b.dataset.pauliPreset]);message=b.dataset.pauliPreset==='pair'?'공간은 같아도 스핀이 달라 두 전자를 허용합니다.':b.dataset.pauliPreset==='parallel'?'스핀이 같아도 공간 함수가 달라 두 전자를 허용합니다.':'네 스핀 오비탈을 각각 한 번 점유했습니다.';drawAll();}));document.querySelectorAll('[data-pauli-remove]').forEach(b=>b.addEventListener('click',()=>{occupied[Number(b.dataset.pauliRemove)]=0;message=names[Number(b.dataset.pauliRemove)]+'를 비웠습니다.';drawAll();}));get('pauli-reset').addEventListener('click',()=>{occupied.fill(0);message='네 스핀 오비탈을 모두 비웠습니다.';drawAll();});mq.addEventListener('change',drawAll);drawAll();

})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
