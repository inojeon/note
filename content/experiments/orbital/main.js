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
function draw(){
 const n=Number(get('orb-n').value),edge=Number(get('orb-edge').value),prob=edge-Math.sin(2*n*Math.PI*edge)/(2*n*Math.PI);
 const sign=get('orb-flip').checked?-1:1;get('orb-probability').dataset.value=prob;get('orb-n-value').textContent=String(n);get('orb-edge-value').textContent=edge.toFixed(2);get('orb-probability').textContent=(100*prob).toFixed(2)+'%';get('orb-nodes').textContent=String(n-1);
 get('orb-status').textContent='왼쪽 끝부터 우물 길이의 '+(100*edge).toFixed(0)+'% 지점까지 찾을 확률은 '+(100*prob).toFixed(2)+'%입니다. 파동함수는 부호를 갖지만 밀도는 음수가 되지 않습니다.';
 const w=mq.matches?300:620,h=mq.matches?400:400,left=42,right=w-18,px=u=>left+u*(right-left),waveY=v=>112-v*40,densY=v=>325-v*44;
 let svg='<title>1차원 우물의 파동함수와 확률 밀도</title>'+txt(w/2,22,'파동함수 · 무차원화','ink','middle')+txt(w/2,225,'확률 밀도 · 무차원화','ink','middle');
 svg+='<rect x="'+left+'" y="245" width="'+(px(edge)-left)+'" height="80" fill="var(--nsoft)"/>';
 svg+=line(left,112,right,112)+line(left,325,right,325)+line(left,45,left,180)+line(left,245,left,325);
 let wave=[],dens=[],area=[left+',325'];for(let i=0;i<=240;i++){const u=i/240,v=sign*Math.sqrt(2)*Math.sin(n*Math.PI*u);wave.push(px(u)+','+waveY(v));dens.push(px(u)+','+densY(v*v));}
 for(let i=0;i<=120;i++){const u=edge*i/120,v=sign*Math.sqrt(2)*Math.sin(n*Math.PI*u);area.push(px(u)+','+densY(v*v));}area.push(px(edge)+',325');
 svg+='<polygon points="'+area.join(' ')+'" fill="var(--beta-soft)"/>';
 svg+='<polyline points="'+wave.join(' ')+'" fill="none" stroke="var(--alpha)" stroke-width="3"/><polyline points="'+dens.join(' ')+'" fill="none" stroke="var(--beta)" stroke-width="3"/>';
 svg+=line(px(edge),245,px(edge),325,'accent',true);
 [0,0.5,1].forEach(u=>{svg+=txt(px(u),197,String(u),'ink2','middle')+txt(px(u),351,String(u),'ink2','middle');});svg+=txt(w/2,380,'위치 x/L','ink','middle');
 [-1,0,1].forEach(v=>svg+=txt(left-7,waveY(v)+4,String(v),'ink2','end'));[0,1,2].forEach(v=>svg+=txt(left-7,densY(v)+4,String(v),'ink2','end'));
 get('orb-density-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('orb-density-fig').innerHTML=svg;
}
function drawAll(){try{draw();}catch(e){throw e;}}
['orb-n','orb-edge','orb-flip'].forEach(id=>get(id).addEventListener('input',drawAll));document.querySelectorAll('[data-orb-region]').forEach(b=>b.addEventListener('click',()=>{get('orb-edge').value=b.dataset.orbRegion;drawAll();}));mq.addEventListener('change',drawAll);drawAll();

})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
