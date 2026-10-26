import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){

const select=document.getElementById('bc-preset');if(!select)return;
const presets={zero:['1','0',1,'0 상태에 1, 1 상태에 0을 곱합니다.','0: 100%, 1: 0%'],one:['0','1',1,'0 상태에 0, 1 상태에 1을 곱합니다.','0: 0%, 1: 100%'],plus:['1/\\sqrt2','1/\\sqrt2',1,'두 기저 상태에 각각 1/√2를 곱합니다.','0: 50%, 1: 50%'],null:['0','0',0,'두 기저 상태에 모두 0을 곱한 영벡터입니다.','']};
function draw(){const [a,b,n,ex,probs]=presets[select.value];document.getElementById('bc-vector').innerHTML='<span class="math-tex" data-tex="\\mathbf c=\\begin{pmatrix}'+a+'\\\\'+b+'\\end{pmatrix}">계수: '+a+', '+b+'</span>';document.getElementById('bc-coeff').textContent=ex;document.getElementById('bc-norm').textContent=String(n);document.getElementById('bc-verdict').textContent=n?'정규화된 양자 상태를 표현합니다.':'유효한 양자 상태가 아닙니다. 상태 이름 0과 영벡터는 다릅니다.';document.getElementById('bc-probs').textContent=n?'계산 기저 측정 확률 — '+probs:'측정 확률을 정의할 수 없습니다.';}
select.addEventListener('change',draw);draw();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
