import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const el=id=>document.getElementById('ci-'+id),mq=window.matchMedia('(max-width:600px)'),minimum=-.7-Math.sqrt(.13),best=Math.atan2((-1-minimum)/.2,1);let angle=0;
function draw(){const c0=Math.cos(angle),c1=Math.sin(angle),p=c0*c0,e=-p-.4*c1*c1-.4*c0*c1;el('angle-value').textContent=(angle*180/Math.PI).toFixed(3)+'°';for(const [id,n]of [['energy',e],['minimum',minimum],['lowering',-1-e]]){el(id).textContent=n.toFixed(6)+' u';el(id).dataset.value=String(n)}el('coefficients').textContent='행렬식 기저의 진폭: c₀ ≈ '+c0.toFixed(4)+', c₁ ≈ '+c1.toFixed(4);el('coefficients').dataset.c0=String(c0);el('coefficients').dataset.c1=String(c1);
const w=mq.matches?360:680,bw=w-145;let svg='<title>두 행렬식의 가중치</title>';for(const [i,v]of [p,1-p].entries()){const y=25+65*i;svg+='<text x="12" y="'+(y+20)+'" fill="var(--ink)">Φ'+i+'</text><rect x="55" y="'+y+'" width="'+bw+'" height="28" fill="var(--code)"/><rect x="55" y="'+y+'" width="'+bw*v+'" height="28" fill="var('+(i?'--beta':'--n')+')"/><text x="'+(w-76)+'" y="'+(y+20)+'" fill="var(--ink)">'+(100*v).toFixed(2)+'%</text>'}el('weights-fig').setAttribute('viewBox','0 0 '+w+' 150');el('weights-fig').innerHTML=svg;el('status').textContent=Math.abs(e-minimum)<1e-12?'두 상태 공간의 변분 최솟값입니다.':'이 상태의 에너지는 최저값보다 '+(e-minimum).toFixed(6)+'u 높습니다. 기준보다 낮아진 값이 음수이면 기준보다 높은 상태입니다.';}
function drawAll(){try{draw()}catch(e){throw e;}}el('angle').addEventListener('input',()=>{angle=Number(el('angle').value)*Math.PI/180;drawAll()});el('reference').addEventListener('click',()=>{angle=0;el('angle').value=0;drawAll()});el('optimum').addEventListener('click',()=>{angle=best;el('angle').value=best*180/Math.PI;drawAll()});mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
