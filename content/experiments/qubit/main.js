import { createScope, addReset } from 'experiment-shared.js';
export function mount(root, context) {
 const scope=createScope(root,context); const {document,window}=scope;
 try {
const g=id=>document.getElementById('bq-'+id),s=Math.SQRT1_2,states={zero:[1,0,0],one:[0,1,0],threefour:[.6,.8,0],plus:[s,s,0],minus:[s,-s,0],plusi:[s,0,s]};
 function render(){const [a,b,c]=states[g('state').value],basis=g('basis').value,p=basis==='Z'?a*a:((a+b)**2+c*c)/2;g('vector').textContent='('+a.toFixed(4)+', '+(c?c.toFixed(4)+'i':b.toFixed(4))+')';g('vector').dataset.values=JSON.stringify([a,b,c]);g('label0').textContent=basis==='Z'?'0의 확률':'+의 확률';g('label1').textContent=basis==='Z'?'1의 확률':'−의 확률';g('p0').textContent=(100*p).toFixed(2)+'%';g('p1').textContent=(100*(1-p)).toFixed(2)+'%';g('p0').dataset.value=p;g('bar0').style.width=100*p+'%';g('bar1').style.width=100*(1-p)+'%';g('calculation').textContent=basis==='Z'?'확률: 첫 진폭의 절댓값 제곱, 둘째 진폭의 절댓값 제곱':'첫 확률: (첫째 진폭 + 둘째 진폭)/√2의 절댓값 제곱';g('explain').textContent=basis==='Z'?'상대 부호가 달라도 제곱한 Z 확률은 같을 수 있습니다.':'X 기준에서는 진폭을 더하고 빼므로 상대 부호의 차이가 드러납니다.';}
 g('state').addEventListener('change',render);g('basis').addEventListener('change',render);document.querySelectorAll('[data-bq-example]').forEach(b=>b.addEventListener('click',()=>{const [state,basis]=b.dataset.bqExample.split(',');g('state').value=state;g('basis').value=basis;render()}));render();
 addReset(root,context.signal);return scope.lifecycle;
 } catch(error){scope.lifecycle.destroy();throw error;}
}
