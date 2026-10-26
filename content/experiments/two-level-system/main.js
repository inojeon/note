import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){

const select=document.getElementById('bt-pair');if(!select)return;
function draw(){const ids=select.value.split(',').map(Number),names=['A','B','C'],energies=[0,1,3],other=[0,1,2].find(i=>!ids.includes(i));document.getElementById('bt-omitted').textContent='이번 계산에서 제외: '+names[other];document.getElementById('bt-basis').textContent='기저 순서: '+ids.map(i=>names[i]).join(' → ');document.getElementById('bt-matrix').innerHTML='<span class="math-tex" data-tex="H_{\\mathrm{sub}}=\\begin{pmatrix}'+energies[ids[0]]+'&amp;0\\\\0&amp;'+energies[ids[1]]+'\\end{pmatrix}">H: 대각 성분 '+ids.map(i=>energies[i]).join(', ')+'</span>';document.getElementById('bt-summary').textContent='이 부분공간의 가능한 에너지: '+ids.map(i=>energies[i]).join(', ');}
select.addEventListener('change',draw);draw();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
