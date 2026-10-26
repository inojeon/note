import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){

const select=document.getElementById('bq-state');if(!select)return;
const states={zero:['1','0',1],one:['0','1',0],plus:['1/\\sqrt2','1/\\sqrt2',.5],minus:['1/\\sqrt2','-1/\\sqrt2',.5],plusi:['1/\\sqrt2','i/\\sqrt2',.5]};
function draw(){const [a,b,p]=states[select.value];document.getElementById('bq-vector').innerHTML='<span class="math-tex" data-tex="|\\psi\\rangle=\\begin{pmatrix}'+a+'\\\\'+b+'\\end{pmatrix}">상태: '+a+', '+b+'</span>';document.getElementById('bq-p0').textContent=(100*p).toFixed(0)+'%';document.getElementById('bq-p1').textContent=(100*(1-p)).toFixed(0)+'%';document.getElementById('bq-bar0').style.width=(100*p)+'%';document.getElementById('bq-bar1').style.width=(100*(1-p))+'%';document.getElementById('bq-explain').textContent=p===.5?'0·1 측정에서는 반반입니다. +, −, +i를 비교하면 확률이 같아도 상태의 계수가 다를 수 있음을 알 수 있습니다.':'이 상태는 0·1 측정에서 한 결과만 확실하게 나옵니다.';}
select.addEventListener('change',draw);draw();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
