import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
'use strict';

const el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)'),input=el('bset-size');
function math(tex,alt){return '<span class="math-tex" data-tex="'+tex+'">'+alt+'</span>'}
function l(x){return [Math.SQRT1_2,Math.sqrt(1.5)*x,Math.sqrt(2.5)*(3*x*x-1)/2]}
function draw(){
 const m=Number(input.value),d=[2/Math.sqrt(6),1/Math.sqrt(6),1/Math.sqrt(6)],c=m===1?[d[0]]:m===2?[1/Math.sqrt(6),1/Math.sqrt(3)]:[1/Math.sqrt(6),1/Math.sqrt(3),1/Math.sqrt(6)],err=m===1?1/3:m===2?1/6:0,norm=1-err,sum=c.reduce((s,x)=>s+x*x,0);
 el('bset-size-value').textContent=String(m);el('bset-main-error').textContent=m===1?'1/3':m===2?'1/6':'0';el('bset-main-error').dataset.value=err;el('bset-missing').textContent=['기울기와 곡률 성분을 아직 표현하지 못합니다.','곡률 성분을 아직 표현하지 못합니다.','이 목표 함수의 모든 성분을 표현합니다.'][m-1];for(const [id,value] of [['bset-error',err],['bset-norm',norm],['bset-square-sum',sum]]){el(id).textContent=value.toFixed(6);el(id).setAttribute('data-value',value)}
 const cc=m===1?'2/\\sqrt6':m===2?'1/\\sqrt6\\\\1/\\sqrt3':'1/\\sqrt6\\\\1/\\sqrt3\\\\1/\\sqrt6',ss=m===1?'1':m===2?'1&1/\\sqrt2\\\\1/\\sqrt2&1':'1&1/\\sqrt2&0\\\\1/\\sqrt2&1&0\\\\0&0&1';
 el('bset-coefficients').innerHTML=math('\\mathbf c=\\begin{bmatrix}'+cc+'\\end{bmatrix}','비직교 기저의 계수 열벡터: '+c.map(x=>x.toFixed(6)).join('; '));el('bset-overlap').innerHTML=math('S=\\begin{bmatrix}'+ss+'\\end{bmatrix}','겹침 행렬, χ1과 χ2의 겹침은 1/√2');
 document.querySelectorAll('[data-bset-size]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.bsetSize)===m)));
 const w=mq.matches?360:600,h=mq.matches?300:290,left=42,right=w-20,top=38,bottom=h-45,xp=x=>left+(x+1)/2*(right-left),yp=y=>bottom-(y+1)/3.5*(bottom-top),plot=el('bset-approximation-fig');plot.setAttribute('viewBox','0 0 '+w+' '+h);
 let svg='<title>'+m+'개 함수로 근사한 오차 제곱 '+err.toFixed(6)+'</title><g font-family="system-ui,sans-serif" fill="var(--ink)" font-size="13"><text x="'+left+'" y="20" fill="var(--ink2)">목표 f · 점선</text><text x="'+(w/2+5)+'" y="20" fill="var(--beta)">근사 f̃ · 실선</text>';
 [-1,0,1,2].forEach(y=>{svg+='<line x1="'+left+'" y1="'+yp(y)+'" x2="'+right+'" y2="'+yp(y)+'" stroke="var(--line)"/><text x="'+(left-8)+'" y="'+(yp(y)+4)+'" text-anchor="end">'+y+'</text>'});[-1,0,1].forEach(x=>svg+='<text x="'+xp(x)+'" y="'+(h-18)+'" text-anchor="middle">'+x+'</text>');svg+='<text x="'+right+'" y="'+(h-2)+'" text-anchor="end">x</text>';
 for(const [target,color,dash] of [[true,'--ink2','6 4'],[false,'--beta','']]){let curve='';for(let i=0;i<=160;i++){const x=-1+2*i/160,v=l(x),y=d.reduce((s,z,j)=>s+(target||j<m?z*v[j]:0),0);curve+=(i?'L':'M')+xp(x).toFixed(2)+','+yp(y).toFixed(2)}svg+='<path d="'+curve+'" fill="none" stroke="var('+color+')" stroke-width="'+(target?2:3)+'" stroke-dasharray="'+dash+'"/>'}plot.innerHTML=svg+'</g>';
 el('bset-status').textContent=m===1?'상수 함수만으로는 기울기와 곡률을 표현하지 못합니다. 함수를 추가하면 빠진 성분을 표현할 수 있습니다.':m===2?'기울기 성분을 표현했지만 휘어진 성분이 남습니다. 계수 제곱 합과 함수의 노름 제곱이 다릅니다.':'이 목표는 세 함수의 공간 안에 있으므로 오차가 0입니다. 노름 제곱은 1이지만 계수 제곱 합은 2/3이므로 계수 제곱은 서로 배타적인 결과의 확률이 아닙니다.';
}
function drawAll(){try{draw()}catch(e){throw e;}}input.addEventListener('input',drawAll);document.querySelectorAll('[data-bset-size]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.bsetSize;drawAll()}));mq.addEventListener('change',drawAll);drawAll();

})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
