import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
'use strict';

const el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)');let duplicate=false,exchanged=false;
function math(tex,alt){return '<span class="math-tex" data-tex="'+tex+'">'+alt+'</span>'}
function draw(){
 const sign=exchanged?-1:1,amp=duplicate?0:sign*Math.SQRT1_2,prob=amp*amp,norm=duplicate?0:1,a=exchanged?[.6,.8]:[.8,.6],b=duplicate?a:(exchanged?[.8,-.6]:[-.6,.8]);
 const first=a[0]*b[1],second=b[0]*a[1];el('sdet-products').textContent='첫 곱 '+a[0]+' × '+b[1]+' = '+first.toFixed(2)+' · 둘째 곱 '+b[0]+' × '+a[1]+' = '+second.toFixed(2)+' → 차이 '+(first-second).toFixed(2)+' → √2로 나눈 진폭 '+amp.toFixed(6);el('sdet-distinct').setAttribute('aria-pressed',String(!duplicate));el('sdet-duplicate').setAttribute('aria-pressed',String(duplicate));el('sdet-exchange').setAttribute('aria-pressed',String(exchanged));
 el('sdet-amplitude').textContent=(amp<0?'−':'')+Math.abs(amp).toFixed(6);el('sdet-amplitude').setAttribute('data-value',amp);el('sdet-probability').textContent=prob.toFixed(3);el('sdet-probability').setAttribute('data-value',prob);el('sdet-norm').textContent=norm.toFixed(1);el('sdet-norm').setAttribute('data-value',norm);el('sdet-validity').textContent=duplicate?'영함수이므로 정규화할 수 없습니다.':'정규화된 두 전자 상태입니다.';
 const matrix='\\Psi('+ (exchanged?'R,L':'L,R')+')=\\frac{1}{\\sqrt{2}}\\begin{vmatrix}'+a[0]+'&'+b[0]+'\\\\'+a[1]+'&'+b[1]+'\\end{vmatrix}';el('sdet-matrix').innerHTML=math(matrix,'지정한 좌표 쌍의 2×2 행렬식 나누기 루트2');
 const w=mq.matches?360:600,h=260,mid=125,scale=95,plot=el('sdet-amplitudes-fig');plot.setAttribute('viewBox','0 0 '+w+' '+h);let svg='<title>교환 '+(exchanged?'후':'전')+' 진폭: LL 0, LR '+amp.toFixed(3)+', RL '+(-amp).toFixed(3)+', RR 0</title><g font-family="system-ui,sans-serif" fill="var(--ink)" font-size="14"><text x="16" y="20">진폭 · 위 + / 아래 −</text><line x1="25" y1="'+mid+'" x2="'+(w-15)+'" y2="'+mid+'" stroke="var(--ink2)"/>';
 [0,amp,-amp,0].forEach((v,i)=>{const x=45+i*(w-80)/3,bh=Math.abs(v)*scale;svg+='<rect x="'+(x-16)+'" y="'+(v>=0?mid-bh:mid)+'" width="32" height="'+bh+'" rx="3" fill="var('+(v<0?'--beta':'--n')+')"/><text x="'+x+'" y="'+(v>=0?mid-bh-10:mid+bh+20)+'" text-anchor="middle">'+v.toFixed(3).replace('-','−')+'</text><text x="'+x+'" y="240" text-anchor="middle">'+['LL','LR','RL','RR'][i]+'</text>'});plot.innerHTML=svg+'</g>';
 el('sdet-status').textContent=duplicate?'중복된 두 열은 서로 상쇄됩니다. 모든 진폭이 0이라서 두 전자 상태가 만들어지지 않습니다.':exchanged?'전자 좌표를 교환해 LR과 RL의 진폭 부호가 뒤집혔습니다. 각 확률은 0.5로 그대로입니다.':'LR과 RL의 진폭은 크기가 같고 부호가 반대입니다. 좌표 이름을 교환해 보세요.';
}
function drawAll(){try{draw()}catch(e){throw e;}}el('sdet-distinct').addEventListener('click',()=>{duplicate=false;drawAll()});el('sdet-duplicate').addEventListener('click',()=>{duplicate=true;drawAll()});el('sdet-exchange').addEventListener('click',()=>{exchanged=!exchanged;drawAll()});mq.addEventListener('change',drawAll);drawAll();

})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
