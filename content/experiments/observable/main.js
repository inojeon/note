import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)'),input=el('obs-p');
function column(values){return '<span class="math-array" role="math" aria-label="열벡터: '+values.join('; ')+'"><span class="math-cells" aria-hidden="true">'+values.map(v=>'<span class="math-row"><span>'+v+'</span></span>').join('')+'</span></span>'}
function draw(){
const p=Number(input.value)/100,mean=3-2*p,variance=4*p*(1-p);el('obs-p-value').textContent=(p*100).toFixed(0)+'%';
el('obs-state').innerHTML=column([Math.sqrt(p).toFixed(3),Math.sqrt(1-p).toFixed(3)]);el('obs-mean').textContent=mean.toFixed(2)+'u';el('obs-variance').textContent=variance.toFixed(2)+'u²';
document.querySelectorAll('[data-obs-p]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.obsP)===p*100)));
const w=mq.matches?360:600,h=mq.matches?310:300,left=55,right=w-35,baseline=205,top=45,energyX=e=>left+(e-.5)/3*(right-left),plot=el('obs-distribution-fig');plot.setAttribute('viewBox','0 0 '+w+' '+h);
let svg='<title>에너지 측정: 1u는 '+(p*100).toFixed(0)+'%, 3u는 '+((1-p)*100).toFixed(0)+'%, 평균 '+mean.toFixed(2)+'u</title><g font-family="system-ui,sans-serif" fill="var(--ink)" font-size="14">';
svg+='<text x="'+left+'" y="20">측정 확률</text><line x1="'+left+'" y1="'+baseline+'" x2="'+right+'" y2="'+baseline+'" stroke="var(--ink2)"/>';
[0,.5,1].forEach(q=>{const y=baseline-(baseline-top)*q;svg+='<line x1="'+left+'" y1="'+y+'" x2="'+right+'" y2="'+y+'" stroke="var(--line)" stroke-dasharray="3 4"/><text x="'+(left-8)+'" y="'+(y+5)+'" text-anchor="end" fill="var(--ink2)">'+(q*100)+'%</text>'});
[p,1-p].forEach((v,i)=>{const x=energyX(i?3:1),bh=(baseline-top)*v;svg+='<rect x="'+(x-19)+'" y="'+(baseline-bh)+'" width="38" height="'+bh+'" rx="3" fill="var('+(i?'--beta':'--n')+')"/><text x="'+x+'" y="'+(baseline-bh-10)+'" text-anchor="middle">'+(v*100).toFixed(0)+'%</text>'});
[1,2,3].forEach(e=>{const x=energyX(e);svg+='<text x="'+x+'" y="'+(baseline+23)+'" text-anchor="middle">'+e+'u</text>'});
const mx=energyX(mean);svg+='<path d="M '+mx+' '+(baseline+30)+' l -6 12 h 12 Z" fill="var(--alpha)"/><text x="'+(w/2)+'" y="'+(baseline+67)+'" text-anchor="middle" fill="var(--alpha)">▲ 평균 '+mean.toFixed(2)+'u</text></g>';plot.innerHTML=svg;
el('obs-status').textContent='1u가 나올 확률 '+(p*100).toFixed(0)+'%, 3u가 나올 확률 '+((1-p)*100).toFixed(0)+'%. '+(p===0||p===1?'에너지 고유상태이므로 결과가 '+mean.toFixed(0)+'u로 확정됩니다.':'기댓값은 '+mean.toFixed(2)+'u이지만 한 번 측정하면 1u 또는 3u만 나옵니다.');
}
function drawAll(){try{draw()}catch(error){throw error;}}input.addEventListener('input',drawAll);document.querySelectorAll('[data-obs-p]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.obsP;drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
