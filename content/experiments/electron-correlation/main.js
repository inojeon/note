import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const el=id=>document.getElementById('corr-'+id),mq=window.matchMedia('(max-width:600px)');
function draw(){const u=Number(el('u').value),hf=u/2-2,exact=(u-Math.sqrt(u*u+16))/2,diff=exact-hf;el('u-value').textContent=u.toFixed(1);const double=.5*(1-u/Math.sqrt(u*u+16));el('double').textContent='같은 자리 중복 점유 확률: RHF 0.5000 · 정확한 해 '+double.toFixed(4);el('double').dataset.exact=double;el('double').dataset.hf=.5;for(const [id,n] of [['hf',hf],['exact',exact],['difference',diff]]){el(id).textContent=n.toFixed(4)+' u';el(id).dataset.value=String(n)}
const w=mq.matches?360:680,h=280,left=48,right=w-20,top=25,bottom=235,x=v=>left+(right-left)*v/8,y=v=>bottom-(bottom-top)*(v+2.3)/4.6;
let svg='<title>같은 Hubbard 모형의 RHF와 정확한 에너지</title><path d="M'+left+' '+top+'V'+bottom+'H'+right+'" fill="none" stroke="var(--ink2)"/>';
for(const v of [-2,0,2])svg+='<text x="8" y="'+(y(v)+4)+'" fill="var(--ink2)" font-size="12">'+v+'u</text><path d="M'+left+' '+y(v)+'H'+right+'" stroke="var(--line)"/>';
for(const exactLine of [false,true]){let path='';for(let i=0;i<=80;i++){const z=i/10,e=exactLine?(z-Math.sqrt(z*z+16))/2:z/2-2;path+=(i?'L':'M')+x(z)+' '+y(e)}const color=exactLine?'--n':'--alpha';svg+='<path d="'+path+'" fill="none" stroke="var('+color+')" stroke-width="3" stroke-dasharray="'+(exactLine?'':'6 4')+'"/><circle cx="'+x(u)+'" cy="'+y(exactLine?exact:hf)+'" r="5" fill="var('+color+')"/>'}
svg+='<text x="'+left+'" y="265" fill="var(--ink2)" font-size="12">0</text><text x="'+(right-18)+'" y="265" fill="var(--ink2)" font-size="12">8</text><text x="'+w/2+'" y="265" fill="var(--ink)">U/u</text>';el('energies-fig').setAttribute('viewBox','0 0 '+w+' '+h);el('energies-fig').innerHTML=svg;el('status').textContent='U = '+u.toFixed(1)+'u에서 정확한 에너지는 RHF보다 '+(-diff).toFixed(4)+'u 낮습니다.';}
function drawAll(){try{draw()}catch(e){throw e;}}el('u').addEventListener('input',drawAll);document.querySelectorAll('[data-corr-u]').forEach(b=>b.addEventListener('click',()=>{el('u').value=b.dataset.corrU;drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
