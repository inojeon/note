import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const el=id=>document.getElementById(id), ids=['vm-bu','vm-bg','vm-au','vm-ag'];
if(!el('vm-sector'))return;
const all=Array.from({length:16},(_,i)=>i.toString(2).padStart(4,'0'));
const sum=s=>Array.from(s).reduce((a,b)=>a+Number(b),0);
const allowed=(s,mode)=>mode==='all'||(mode==='two'&&sum(s)===2)||(mode==='spin'&&sum(s.slice(0,2))===1&&sum(s.slice(2))===1)||(mode==='pair'&&(s==='0101'||s==='1010'));
function draw(){const bits=ids.map(id=>el(id).checked?'1':'0').join(''), n=sum(bits), b=sum(bits.slice(0,2)), a=sum(bits.slice(2)), mode=el('vm-sector').value, basis=all.filter(s=>allowed(s,mode));
el('vm-bits').textContent=bits.slice(0,2)+' | '+bits.slice(2);el('vm-bits').dataset.bits=bits;el('vm-electrons').textContent=n;el('vm-alpha').textContent=a;el('vm-beta').textContent=b;
el('vm-status').textContent=n!==2?'':a===1&&b===1?'전자 두 개이며 α와 β가 하나씩입니다. H₂의 고정 전자 수·스핀 투영값 조건에 맞습니다.':'전자 수는 두 개이지만 α 하나·β 하나인 조건에는 맞지 않습니다.';
if(n!==2)el('vm-status').textContent='전자 수가 '+n+'개이므로 중성 H₂의 두 전자 조건에는 맞지 않습니다.';
el('vm-status').dataset.two=String(n===2);el('vm-status').dataset.spin=String(a===1&&b===1);
el('vm-dimension').textContent='이 범위의 독립적인 기저 상태: '+basis.length+'개';el('vm-dimension').dataset.dimension=basis.length;
el('vm-basis-list').replaceChildren();basis.forEach(s=>{const li=document.createElement('li');li.textContent=s.slice(0,2)+' | '+s.slice(2);li.setAttribute('aria-current',String(s===bits));el('vm-basis-list').appendChild(li);});
const target=Number(el('vm-create').value),bitIndex=3-target,prior=bits.slice(4-target),occupied=sum(prior),sign=occupied%2?-1:1,blocked=bits[bitIndex]==='1';el('vm-parity').textContent='p='+target+'보다 작은 번호의 점유 '+occupied+'개 → '+(occupied%2?'홀수 · − 부호':'짝수 · + 부호');el('vm-created').textContent=blocked?'생성 불가: 이미 점유한 스핀 오비탈 → 영벡터 0':(sign<0?'−':'+')+'|'+bits.slice(0,bitIndex)+'1'+bits.slice(bitIndex+1)+'⟩';el('vm-created').dataset.sign=blocked?0:sign;el('vm-created').dataset.bits=blocked?'':bits.slice(0,bitIndex)+'1'+bits.slice(bitIndex+1);el('vm-create').dataset.priorCount=occupied;el('vm-membership').textContent=allowed(bits,mode)?'현재 선택한 배치는 이 범위에 포함됩니다.':'현재 선택한 배치는 이 범위에 포함되지 않습니다.';
}
el('vm-create').addEventListener('change',draw);ids.forEach(id=>el(id).addEventListener('change',draw));el('vm-sector').addEventListener('change',draw);
[['vm-preset-g','0101'],['vm-preset-u','1010'],['vm-preset-empty','0000']].forEach(([id,bits])=>el(id).addEventListener('click',()=>{ids.forEach((id,i)=>el(id).checked=bits[i]==='1');draw();}));draw();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
