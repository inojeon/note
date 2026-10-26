import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
const presets={chemical:[.8,1.2,-.5],uncoupled:[1,2,0],coupled:[1,2,.8],equal:[1,1,.8],degenerate:[1,1,0]};let groundAngle=0;
function fmt(n){return (Math.abs(n)<.00005?0:n).toFixed(4)}
function matrix(rows){return `<span class="math-array" role="math" aria-label="${rows.map(row=>row.map(fmt).join(', ')).join('; ')}"><span class="math-cells" aria-hidden="true">${rows.map(row=>`<span class="math-row">${row.map(x=>`<span>${fmt(x)}</span>`).join('')}</span>`).join('')}</span></span>`}
function draw(){
const a=Number(document.getElementById('hamiltonian-a').value),b=Number(document.getElementById('hamiltonian-b').value),g=Number(document.getElementById('hamiltonian-g').value),phi=Number(document.getElementById('hamiltonian-state').value),mid=(a+b)/2,gap=Math.hypot((a-b)/2,g),low=mid-gap,high=mid+gap,degenerate=gap<1e-12;let c1=1,c2=0;
if(!degenerate){const theta=.5*Math.atan2(2*g,a-b);c1=-Math.sin(theta);c2=Math.cos(theta);if(c1<-1e-12||(Math.abs(c1)<1e-12&&c2<0)){c1=-c1;c2=-c2}if(Math.abs(c1)<1e-12)c1=0;if(Math.abs(c2)<1e-12)c2=0}
groundAngle=Math.atan2(c2,c1)*180/Math.PI;
for(const [id,value] of [['a',a],['b',b],['g',g],['state',phi]])document.getElementById('hamiltonian-'+id+'-value').textContent=id==='state'?phi.toFixed(1)+'°':value.toFixed(1);
document.getElementById('hamiltonian-matrix').innerHTML=`H = ${matrix([[a,g],[g,b]])}`;
document.getElementById('hamiltonian-chemical-values').innerHTML=`<div><strong>왼쪽 위 · 배치 Φ₁</strong><span class="chemical-number">H₁₁ = ${fmt(a)}</span><span>⟨Φ₁|H|Φ₁⟩</span><p>전자가 Φ₁처럼 배치된 상태의 에너지 기댓값입니다.</p></div><div><strong>오른쪽 아래 · 배치 Φ₂</strong><span class="chemical-number">H₂₂ = ${fmt(b)}</span><span>⟨Φ₂|H|Φ₂⟩</span><p>전자가 Φ₂처럼 배치된 상태의 에너지 기댓값입니다.</p></div><div><strong>대각선 밖 · 두 배치의 연결</strong><span class="chemical-number">H₁₂ = H₂₁ = ${fmt(g)}</span><span>⟨Φ₁|H|Φ₂⟩ = g</span><p>두 배치가 에너지 고유상태의 조합으로 섞이는 데 관여하는 결합 행렬원소입니다. 단위는 에너지입니다. 이 실수 모형에서는 두 위치의 값이 같으며, 일반적인 복소수 행렬에서는 서로 켤레입니다.</p></div><p class="chemical-mixing-result">두 배치만 사용하는 이 공간에서, 낮은 에너지는 E₋ = ${fmt(low)}입니다. 혼합하지 않은 두 배치 중 낮은 값 ${fmt(Math.min(a,b))}보다 ${fmt(Math.min(a,b)-low)} 낮습니다.</p>`;

document.getElementById('hamiltonian-ground-vector').innerHTML=matrix([[c1],[c2]]);
const p1=c1*c1,p2=c2*c2;document.getElementById('hamiltonian-probabilities').innerHTML=`<div class="hamiltonian-probability-bar" role="img" aria-label="기저 1 ${100*p1}퍼센트, 기저 2 ${100*p2}퍼센트"><span style="width:${100*p1}%"></span><span style="width:${100*p2}%"></span></div><p>기저 1: ${(100*p1).toFixed(1)}% · 기저 2: ${(100*p2).toFixed(1)}%</p>`;
document.getElementById('hamiltonian-status').textContent=degenerate?'두 고유값이 같습니다. 바닥상태가 축퇴하여 유일한 상태 벡터를 고를 수 없습니다. 여기서는 기저 1을 한 대표로 표시합니다.':g===0?'결합이 없어서 대각 성분 a, b가 그대로 에너지 고유값입니다. 더 낮은 에너지의 기저 상태가 바닥상태입니다.':'두 상태를 연결하면 고유값은 대각 성분과 달라집니다. 낮은 고유값은 두 대각 성분 중 작은 값보다 내려가고, 바닥상태는 두 기저 상태의 조합이 됩니다.';
const hc=[a*c1+g*c2,g*c1+b*c2];document.getElementById('hamiltonian-calculation').innerHTML=`<p>E₋ = (a+b)/2 − √(((a−b)/2)²+g²) = ${fmt(low)}<br>E₊ = (a+b)/2 + √(((a−b)/2)²+g²) = ${fmt(high)}</p><div class="hamiltonian-eigencheck"><span>Hc₀ = ${matrix(hc.map(x=>[x]))}</span><span>E₋c₀ = ${matrix([[low*c1],[low*c2]])}</span></div><p>두 결과가 같고 c₀의 길이는 1입니다. 표시값은 소수 넷째 자리까지 반올림합니다.</p>`;
const rad=phi*Math.PI/180,u=Math.cos(rad),v=Math.sin(rad),expectation=a*u*u+b*v*v+2*g*u*v;document.getElementById('hamiltonian-expectation').innerHTML=`<div class="hamiltonian-eigencheck"><span>c = ${matrix([[u],[v]])}</span><span>⟨H⟩ = ${fmt(expectation)}</span></div><p>범위: ${fmt(low)} ≤ ⟨H⟩ ≤ ${fmt(high)}<br>현재 기댓값과 최소 에너지의 차이: ${fmt(expectation-low)}</p>`;
document.querySelectorAll('[data-hamiltonian-preset]').forEach(button=>button.setAttribute('aria-pressed',String(presets[button.getAttribute('data-hamiltonian-preset')].every((x,i)=>x===[a,b,g][i]))));
const small=narrow(),W=small?360:680,H=320,T=60,B=260,sy=e=>B-(e+2.5)/8*(B-T),left=W*.25,right=W*.75;
let z=`<text x="${left}" y="24" text-anchor="middle" fill="var(--ink)" font-size="13">기저 상태의 기댓값</text><text x="${right}" y="24" text-anchor="middle" fill="var(--ink)" font-size="13">H의 에너지 고유값</text>`;
for(const e of [-2,0,2,4]){z+=`<path d="M 20 ${sy(e)} H ${W-20}" stroke="var(--line)" stroke-dasharray="3 5"/><text x="10" y="${sy(e)+4}" fill="var(--ink2)" font-size="10">${e}</text>`}
function level(center,value,label,color,offset){const y=sy(value),half=small?48:90;return `<path d="M ${center-half} ${y} H ${center+half}" stroke="var(${color})" stroke-width="3"/><text x="${center}" y="${y+offset}" text-anchor="middle" fill="var(${color})" font-size="12">${label} ${fmt(value)}</text>`}
const closeBasis=Math.abs(sy(a)-sy(b))<27;z+=level(left,a,'a =','--n',closeBasis&&a<=b?17:-9)+level(left,b,'b =','--beta',closeBasis&&b<a?17:-9)+level(right,low,'E₋ =','--alpha',17)+level(right,high,'E₊ =','--accent',-9);
z+=`<text x="${W/2}" y="${H-14}" text-anchor="middle" fill="var(--ink2)" font-size="11">同じエネルギーの目盛り · 任意単位</text>`;
const svg=document.getElementById('hamiltonian-energy-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=z.replace('同じエネルギーの目盛り · 任意単位','같은 에너지 눈금 · 임의 단위');
}
function drawAll(){try{draw()}catch(e){throw e;}}
for(const id of ['a','b','g','state'])document.getElementById('hamiltonian-'+id).addEventListener('input',drawAll);document.querySelectorAll('[data-hamiltonian-preset]').forEach(button=>button.addEventListener('click',()=>{const values=presets[button.getAttribute('data-hamiltonian-preset')];['a','b','g'].forEach((id,i)=>{document.getElementById('hamiltonian-'+id).value=values[i]});drawAll()}));document.getElementById('hamiltonian-use-ground').addEventListener('click',()=>{document.getElementById('hamiltonian-state').value=(Math.round(groundAngle*10)/10).toFixed(1);drawAll()});mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
