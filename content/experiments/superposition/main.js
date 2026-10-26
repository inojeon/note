import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const el=id=>document.getElementById(id), mq=window.matchMedia('(max-width:600px)'), angle=el('phase-angle');
const clean=x=>Math.abs(x)<0.0005?0:x;
const num=x=>clean(x).toFixed(3).replace('-', '−');
function complex(re,im){re=clean(re);im=clean(im);return num(re)+(im<0?' − ':' + ')+Math.abs(im).toFixed(3)+'i'}
function column(values){return '<span class="math-array" role="math" aria-label="열벡터: '+values.join('; ')+'"><span class="math-cells" aria-hidden="true">'+values.map(v=>'<span class="math-row"><span>'+v+'</span></span>').join('')+'</span></span>'}
function draw(){
const degrees=Number(angle.value), radians=degrees*Math.PI/180, co=clean(Math.cos(radians)), si=clean(Math.sin(radians)), plus=(1+co)/2, minus=1-plus;
el('phase-angle-value').textContent=degrees+'°';
el('phase-original-coeff').innerHTML=column([complex(Math.SQRT1_2,0),complex(co*Math.SQRT1_2,si*Math.SQRT1_2)]);
el('phase-rotated-coeff').innerHTML=column([complex((1+co)/2,si/2),complex((1-co)/2,-si/2)]);
document.querySelectorAll('[data-phase-angle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.phaseAngle)===degrees%360)));
const width=mq.matches?360:600, height=mq.matches?350:190, plot=el('phase-probability-fig');plot.setAttribute('viewBox','0 0 '+width+' '+height);
let svg='<title>위상 '+degrees+'도: 원래 기저는 각각 50%, 새 기저 +는 '+(plus*100).toFixed(1)+'%, −는 '+(minus*100).toFixed(1)+'%</title>';
function panel(x,y,w,title,labels,values){svg+='<g transform="translate('+x+' '+y+')" font-family="system-ui,sans-serif"><text x="0" y="20" fill="var(--ink)" font-size="15" font-weight="600">'+title+'</text>';values.forEach((p,i)=>{const yy=45+58*i,bw=w-100;svg+='<text x="0" y="'+(yy+17)+'" fill="var(--ink)" font-size="15">'+labels[i]+'</text><rect x="44" y="'+yy+'" width="'+bw+'" height="24" rx="4" fill="var(--code)"/><rect x="44" y="'+yy+'" width="'+(bw*p)+'" height="24" rx="4" fill="var('+(i?'--beta':'--n')+')"/><text x="'+(w-48)+'" y="'+(yy+17)+'" fill="var(--ink)" font-size="14">'+(p*100).toFixed(0)+'%</text>'});svg+='</g>'}
if(mq.matches){panel(12,8,336,'원래 기저 · |1⟩, |2⟩',['|1⟩','|2⟩'],[.5,.5]);panel(12,178,336,'새 기저 · |+⟩, |−⟩',['|+⟩','|−⟩'],[plus,minus])}else{panel(8,10,280,'원래 기저',['|1⟩','|2⟩'],[.5,.5]);panel(312,10,280,'새 기저',['|+⟩','|−⟩'],[plus,minus])}
plot.innerHTML=svg;el('phase-status').textContent='φ = '+degrees+'°: 원래 기저에서는 50%, 50%. 새 기저에서는 P(+) = '+(100*plus).toFixed(1)+'%, P(−) = '+(100*minus).toFixed(1)+'%입니다.';
}
function drawAll(){try{draw()}catch(error){throw error;}}
angle.addEventListener('input',drawAll);document.querySelectorAll('[data-phase-angle]').forEach(b=>b.addEventListener('click',()=>{angle.value=b.dataset.phaseAngle;drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
