import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const get=id=>document.getElementById(id), a=get('bp-a'),b=get('bp-b');if(!a)return;const f=x=>(Math.abs(x)<.0000005?0:x).toFixed(6);function vector(id,values){const e=get(id);e.dataset.tex='\\begin{pmatrix}'+values.map(f).join('\\\\')+'\\end{pmatrix}';e.textContent=values.map(f).join('; ');}function draw(){const aa=Number(a.value)*Math.PI/360,bb=Number(b.value)*Math.PI/360,A=[Math.cos(aa),Math.sin(aa)],B=[Math.cos(bb),Math.sin(bb)],v=A.flatMap(x=>B.map(y=>x*y));get('bp-a-value').textContent=a.value+'°';get('bp-b-value').textContent=b.value+'°';vector('bp-va',A);vector('bp-vb',B);vector('bp-vab',v);v.forEach((x,i)=>{get('bp-p'+i).textContent=(100*x*x).toFixed(2)+'%';get('bp-bar-'+i).style.width=(100*x*x)+'%';});get('bp-lab').dataset.coefficients=JSON.stringify(v);get('bp-status').textContent='확률 합 '+(100*v.reduce((s,x)=>s+x*x,0)).toFixed(2)+'% · 두 큐빗은 독립적인 곱 상태입니다.';}a.addEventListener('input',draw);b.addEventListener('input',draw);draw();})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
