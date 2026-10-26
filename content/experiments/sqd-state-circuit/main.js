import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const $=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)'),gates=[{kind:'X',q:0,label:'X(q₀)'},{kind:'X',q:2,label:'X(q₂)'},{kind:'CX',q:1,label:'CNOT(q₀→q₁)'},{kind:'CX',q:2,label:'CNOT(q₀→q₂)'},{kind:'CX',q:3,label:'CNOT(q₀→q₃)'},{kind:'RY',q:0,label:'Rᵧ(−θ)(q₀)'},{kind:'CX',q:3,label:'CNOT(q₀→q₃)'},{kind:'CX',q:2,label:'CNOT(q₀→q₂)'},{kind:'CX',q:1,label:'CNOT(q₀→q₁)'}];let step=0,lastDrawnStep=-1;function state(){let a=Array(16).fill(0);a[0]=1;for(let k=0;k<step;k++){const g=gates[k],b=Array(16).fill(0);if(g.kind==='RY'){const t=-Number($('ssc-theta').value)*Math.PI/360,c=Math.cos(t),s=Math.sin(t);for(let i=0;i<16;i++){if(i&1){b[i-1]+=-s*a[i];b[i]+=c*a[i];}else{b[i]+=c*a[i];b[i+1]+=s*a[i];}}}else for(let i=0;i<16;i++)b[(g.kind==='X'||(i&1))?i^(1<<g.q):i]+=a[i];a=b;}return a;}function draw(){const deg=+$('ssc-theta').value,a=state(),w=600,y=q=>40+(3-q)*47;
let svg='<title>1단계부터 '+step+'단계까지 적용한 게이트. 강조된 마지막 게이트가 현재 단계입니다.</title>';
for(let q=3;q>=0;q--)svg+='<text x="4" y="'+(y(q)+5)+'">q'+q+'</text><line x1="30" x2="588" y1="'+y(q)+'" y2="'+y(q)+'" stroke="var(--line)" stroke-width="2"/>';
for(let i=0;i<step;i++){
 const g=gates[i],x=60+i*60,current=i===step-1,stroke=current?'var(--accent)':'var(--ink)';
 svg+='<g data-ssc-gate="'+(i+1)+'" data-current="'+current+'"><title>'+(i+1)+'단계: '+g.label+(current?' · 현재 단계':' · 적용 완료')+'</title>';
 if(current)svg+='<rect x="'+(x-29)+'" y="16" width="58" height="217" rx="8" fill="var(--nsoft)" fill-opacity="0.35" stroke="var(--accent)" stroke-dasharray="4 3"/>';
 if(g.kind==='CX')svg+='<line x1="'+x+'" x2="'+x+'" y1="'+y(0)+'" y2="'+y(g.q)+'" stroke="'+stroke+'" stroke-width="2"/><circle cx="'+x+'" cy="'+y(0)+'" r="5" fill="'+stroke+'"/><circle cx="'+x+'" cy="'+y(g.q)+'" r="12" fill="var(--panel)" stroke="'+stroke+'" stroke-width="2"/><path d="M '+(x-7)+' '+y(g.q)+' h 14 M '+x+' '+(y(g.q)-7)+' v 14" stroke="'+stroke+'"/>';
 else svg+='<rect x="'+(x-25)+'" y="'+(y(g.q)-17)+'" width="50" height="34" rx="5" fill="var(--panel)" stroke="'+stroke+'" stroke-width="2"/><text x="'+x+'" y="'+(y(g.q)+5)+'" text-anchor="middle">'+(g.kind==='X'?'X':'Rᵧ(−θ)')+'</text>';
 svg+='<text x="'+x+'" y="207" text-anchor="middle">'+(i+1)+'</text>'+(current?'<text x="'+x+'" y="224" text-anchor="middle">현재</text>':'')+'</g>';
}
if(!step)svg+='<text x="60" y="220">초기 상태 |0000⟩ · 다음 게이트를 눌러 시작하세요</text>';
$('ssc-fig').setAttribute('viewBox','0 0 '+w+' 244');$('ssc-fig').innerHTML=svg;
if(lastDrawnStep!==step){const viewport=$('ssc-circuit-scroll'),x=60+Math.max(0,step-1)*60;if(!step)viewport.scrollLeft=0;else if(x+30>viewport.scrollLeft+viewport.clientWidth)viewport.scrollLeft=x+30-viewport.clientWidth;else if(x-30<viewport.scrollLeft)viewport.scrollLeft=Math.max(0,x-30);lastDrawnStep=step;}
$('ssc-angle').textContent=deg+'°';$('ssc-stage').textContent=step+' / 9 단계 · '+(step?gates[step-1].label+' 적용 후':'초기 상태');$('ssc-stage').dataset.step=step;$('ssc-amplitudes').dataset.values=JSON.stringify(a);$('ssc-amplitudes').innerHTML=a.map((v,i)=>Math.abs(v)>1e-10?'<tr><th>'+i.toString(2).padStart(4,'0')+'</th><td>'+v.toFixed(4)+'</td><td>'+(v*v*100).toFixed(1)+'%</td></tr>':'').join('');$('ssc-explanation').textContent=step===0?'네 큐빗이 모두 0입니다. 아직 전자를 채운 기준 상태가 아닙니다.':step===2?'기준 배치 0101 준비 완료: 공간 궤도 0에 α·β 전자가 하나씩 있습니다.':step===9?'준비 완료: 0101과 1010의 진폭이 각각 cos(θ/2), sin(θ/2)입니다. 이제 측정합니다.':step===6?'회전이 두 성분의 진폭을 만들었습니다. 남은 CNOT로 전자 배치 표현을 되돌립니다.':'중간 계산 상태입니다. 마지막 단계까지 진행하여 목표 전자 배치 상태를 확인하세요.';$('ssc-back').disabled=step===0;$('ssc-next').disabled=step===9;} $('ssc-next').addEventListener('click',()=>{step=Math.min(9,step+1);draw();});$('ssc-back').addEventListener('click',()=>{step=Math.max(0,step-1);draw();});$('ssc-reset').addEventListener('click',()=>{step=0;draw();});$('ssc-finish').addEventListener('click',()=>{step=9;draw();});$('ssc-theta').addEventListener('input',draw);mq.addEventListener('change',draw);draw();})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
