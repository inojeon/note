import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const rad=d=>d*Math.PI/180,energy=d=>1-.5*Math.sin(rad(d))-.2*Math.cos(rad(d));const exact=1-Math.hypot(.5,.2),ground=Math.atan2(.5,.2)*180/Math.PI;const $=id=>document.getElementById(id);const fmt=x=>(Math.abs(x)<.0000005?0:x).toFixed(6);const mq=window.matchMedia('(max-width:600px)');
function draw(){const limit=$('va-mode').value==='restricted'?30:180;const input=$('va-angle');input.min=-limit;input.max=limit;let theta=Math.max(-limit,Math.min(limit,+input.value));input.value=theta;const best=Math.min(ground,limit),e=energy(theta);$('va-angle-value').textContent=theta.toFixed(2)+'°';$('va-c0').textContent=fmt(Math.cos(rad(theta)/2));$('va-c1').textContent=fmt(Math.sin(rad(theta)/2));$('va-energy').textContent=fmt(e);$('va-minimum').textContent=fmt(energy(best));$('va-exact').textContent=fmt(exact);$('va-gap').textContent=fmt(energy(best)-exact);$('va-status').textContent=limit===30?'':'넓은 후보에는 이 모형의 정확한 바닥상태가 포함됩니다.';if(limit===30)$('va-status').textContent='현재 후보의 최선은 θ = 30°입니다. 정확한 바닥상태의 각도 '+ground.toFixed(2)+'°는 범위 밖에 있습니다.';
const w=mq.matches?320:650,h=245,L=42,R=w-16,T=22,B=195,x=d=>L+(d+180)/360*(R-L),y=v=>B-(v-.4)/1.2*(B-T),path=(lo,hi)=>{let a=[];for(let d=lo;d<=hi;d+=1)a.push((a.length?'L':'M')+x(d).toFixed(2)+','+y(energy(d)).toFixed(2));return a.join(' ')};const svg=$('va-landscape-fig');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML=`<rect x="${x(-limit)}" y="${T}" width="${x(limit)-x(-limit)}" height="${B-T}" fill="var(--accent)" opacity=".07"/><path d="M${L},${T}V${B}H${R}" stroke="var(--ink2)" fill="none"/><path d="${path(-180,180)}" stroke="var(--ink2)" opacity=".5" fill="none" stroke-width="2"/><path d="${path(-limit,limit)}" stroke="var(--accent)" fill="none" stroke-width="3"/><path d="M${L},${y(exact)}H${R}" stroke="var(--accent)" stroke-dasharray="4 4"/><circle cx="${x(theta)}" cy="${y(e)}" r="6" fill="var(--ink)"/><text x="${L}" y="14" font-size="12" fill="var(--ink)">평균 에너지</text><text x="${L}" y="220" font-size="12" fill="var(--ink)">−180°</text><text x="${x(0)}" y="220" text-anchor="middle" font-size="12" fill="var(--ink)">0°</text><text x="${R}" y="220" text-anchor="end" font-size="12" fill="var(--ink)">180°</text><text x="${L-5}" y="${y(.5)+4}" text-anchor="end" font-size="12" fill="var(--ink)">0.5</text><text x="${L-5}" y="${y(1.5)+4}" text-anchor="end" font-size="12" fill="var(--ink)">1.5</text>`;}
$('va-angle').addEventListener('input',draw);$('va-mode').addEventListener('change',draw);$('va-best').addEventListener('click',()=>{$('va-angle').value=Math.min(ground,$('va-mode').value==='restricted'?30:180);draw()});mq.addEventListener('change',draw);draw();

})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
