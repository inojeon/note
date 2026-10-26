import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(()=>{const $=id=>document.getElementById('lh-'+id);const cases=[[4,2],[20,10],[40,20],[60,30]];let selected=2;function choose(m,n){let c=1n;for(let i=1;i<=Math.min(n,m-n);i++)c=c*BigInt(m-i+1)/BigInt(i);return c}function fmt(n){return n.toLocaleString('en-US')}function size(bytes){const units=['B','KB','MB','GB','TB','PB','EB'];let value=Number(bytes),i=0;while(value>=1000&&i<units.length-1){value/=1000;i++}return value.toFixed(2)+' '+units[i]}function draw(){const [m,n]=cases[selected],d=choose(m,n),spin=choose(m/2,n/2)**2n,two=BigInt(m)**4n;$('matrix-entries').textContent=fmt(d*d);$('matrix-entries').dataset.value=String(d*d);$('matrix-memory').textContent='같은 실수 8바이트 가정의 조밀 행렬: '+size(d*d*8n)+'. 상태 벡터 하나의 저장과 구별합니다.';$('selection').textContent='M = '+m+'개 스핀 궤도 · N = '+n+'개 전자';[['one',BigInt(m)**2n],['two',two],['configurations',d],['spin-configurations',spin]].forEach(([id,v])=>{$(id).textContent=fmt(v);$(id).dataset.value=String(v)});$('memory').textContent='실수 8바이트를 모두 저장한다면: 2전자 적분 계수 약 '+size(two*8n)+' / 전자 수만 고정한 상태 계수 벡터 하나 약 '+size(d*8n)+'. (십진 단위)';document.querySelectorAll('[data-lh-case]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.lhCase===selected)))}document.querySelectorAll('[data-lh-case]').forEach(b=>b.addEventListener('click',()=>{selected=+b.dataset.lhCase;draw()}));draw()})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
