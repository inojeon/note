import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const el=id=>document.getElementById('pec-'+id),mq=window.matchMedia('(max-width:600px)');function energy(r){const q=Math.exp(-(r-2));return (1-q)**2-1}
function draw(){const r=Number(el('r').value),q=Math.exp(-(r-2)),v=energy(r),force=-2*q*(1-q);el('r-value').textContent=r.toFixed(2);for(const [id,n,unit]of [['energy',v,'u'],['force',force,'u/ℓ'],['curvature',2,'u/ℓ²']]){el(id).textContent=n.toFixed(4)+' '+unit;el(id).dataset.value=String(n)}const w=mq.matches?360:680,h=300,left=48,right=w-20,top=22,bottom=254,x=z=>left+(right-left)*(z-.8)/5.2,y=e=>bottom-(bottom-top)*(e+1.2)/5.8;let path='';for(let i=0;i<=260;i++){const z=.8+i*.02;path+=(i?'L':'M')+x(z)+' '+y(energy(z))}let svg='<title>Morse 모형의 총 에너지</title><path d="M'+left+' '+top+'V'+bottom+'H'+right+'" fill="none" stroke="var(--ink2)"/><path d="M'+left+' '+y(0)+'H'+right+'" stroke="var(--ink2)" stroke-dasharray="5 4"/><path d="'+path+'" fill="none" stroke="var(--n)" stroke-width="3"/><circle cx="'+x(r)+'" cy="'+y(v)+'" r="5" fill="var(--alpha)"/>';for(const e of [-1,0,2,4])svg+='<text x="9" y="'+(y(e)+4)+'" fill="var(--ink2)" font-size="12">'+e+'u</text>';for(const z of [1,2,4,6])svg+='<text x="'+x(z)+'" y="277" fill="var(--ink2)" font-size="12" text-anchor="middle">'+z+'</text>';svg+='<text x="'+w/2+'" y="297" fill="var(--ink)" font-size="13">R/ℓ</text>';el('curve-fig').setAttribute('viewBox','0 0 '+w+' '+h);el('curve-fig').innerHTML=svg;el('status').textContent=Math.abs(force)<1e-12?'평형 거리입니다. 힘은 0이고 에너지는 −1u입니다.':(force>0?'양의 힘: 두 핵의 거리를 늘리는 방향입니다.':'음의 힘: 두 핵의 거리를 줄이는 방향입니다.');}
function drawAll(){try{draw()}catch(e){throw e;}}el('r').addEventListener('input',drawAll);el('equilibrium').addEventListener('click',()=>{el('r').value=2;drawAll()});mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
