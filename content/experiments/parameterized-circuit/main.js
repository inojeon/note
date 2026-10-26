import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const rad=d=>d*Math.PI/180,energy=d=>1-.5*Math.sin(rad(d))-.2*Math.cos(rad(d));const exact=1-Math.hypot(.5,.2),ground=Math.atan2(.5,.2)*180/Math.PI;const $=id=>document.getElementById(id);const fmt=x=>(Math.abs(x)<.0000005?0:x).toFixed(6);const mq=window.matchMedia('(max-width:600px)');
function draw(){const theta=+$('vpc-angle').value,t=rad(theta)/2,c=Math.cos(t),s=Math.sin(t);$('vpc-angle-value').textContent=theta.toFixed(2)+'°';$('vpc-c0').textContent=fmt(c);$('vpc-c1').textContent=fmt(s);$('vpc-p0').textContent=(100*c*c).toFixed(2)+'%';$('vpc-p1').textContent=(100*s*s).toFixed(2)+'%';$('vpc-energy').textContent=fmt(energy(theta));$('vpc-status').textContent='같은 회로로 상태를 반복 준비하면, 0과 1의 측정 비율이 위 확률에 가까워집니다. 회전각은 '+theta.toFixed(2)+'°입니다.';const w=mq.matches?320:650,h=125,cx=w/2;const svg=$('vpc-circuit-fig');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML=`<path d="M55,58H${w-55}" fill="none" stroke="var(--ink)" stroke-width="2"/><rect x="${cx-48}" y="27" width="96" height="62" rx="9" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/><text x="22" y="64" fill="var(--ink)" font-size="19">|0⟩</text><text x="${cx}" y="53" fill="var(--ink)" font-size="18" text-anchor="middle">Ry(θ)</text><text x="${cx}" y="76" fill="var(--ink)" font-size="14" text-anchor="middle">${theta.toFixed(1)}°</text><text x="${w-40}" y="64" fill="var(--ink)" font-size="19" text-anchor="middle">|ψ⟩</text><text x="${cx}" y="115" fill="var(--ink2)" font-size="13" text-anchor="middle">시작 상태 → 회전 게이트 → 출력 상태</text>`;}
$('vpc-angle').addEventListener('input',draw);[['vpc-zero',0],['vpc-plus',90],['vpc-one',180]].forEach(([id,value])=>$(id).addEventListener('click',()=>{$('vpc-angle').value=value;draw()}));mq.addEventListener('change',draw);draw();

})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
