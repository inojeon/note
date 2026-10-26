import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 document.getElementById("vh-data").textContent=JSON.stringify(await loadJSON(context,"vh-data.json"));
 try {

(()=>{
const el=id=>document.getElementById('vh-'+id),raw=el('data');if(!raw)return;let data;try{data=JSON.parse(raw.textContent)}catch(_){return}if(!data.samples)return;
const mq=window.matchMedia('(max-width:600px)');let index=data.default_index,theta=0,steps=0;el('distance').value=String(index);
const energy=(s,t)=>s.pauli_hartree.I+s.pauli_hartree.X*Math.sin(t)+s.pauli_hartree.Z*Math.cos(t);
const set=(id,v,digits=8)=>{el(id).textContent=v.toFixed(digits);el(id).setAttribute('data-value',String(v))};
const math=(id,tex)=>{el(id).setAttribute('data-tex',tex)};
function draw(){const s=data.samples[index],p=s.pauli_hartree,e=energy(s,theta),a=Math.cos(theta/2),b=Math.sin(theta/2);el('angle').value=String(theta*180/Math.PI);el('angle-value').textContent=(theta*180/Math.PI).toFixed(3)+'°';set('energy',e);set('exact',s.energy_fci_hartree);set('hf',s.energy_hf_hartree);set('error',(e-s.energy_fci_hartree)*1000,5);el('status').textContent=steps+'회 갱신 · 핵 위치는 고정하고 전자 상태를 조절합니다.';el('status').setAttribute('data-steps',String(steps));
math('state',String.raw`|\psi\rangle\approx ${a.toFixed(4)}|g^2\rangle${b<0?'-':'+'}${Math.abs(b).toFixed(4)}|u^2\rangle`);
math('hamiltonian',String.raw`H/\mathrm{Ha}\approx ${p.I.toFixed(4)}I${p.X<0?'-':'+'}${Math.abs(p.X).toFixed(4)}X${p.Z<0?'-':'+'}${Math.abs(p.Z).toFixed(4)}Z`);
const w=mq.matches?320:640,h=240,left=57,right=w-12,top=32,bottom=197,amp=Math.hypot(p.X,p.Z),min=p.I-amp,max=p.I+amp,x=t=>left+(t+Math.PI)/(2*Math.PI)*(right-left),y=v=>bottom-(v-min)/(max-min)*(bottom-top);let path='';for(let k=0;k<=180;k++){const t=-Math.PI+2*Math.PI*k/180;path+=(k?'L':'M')+x(t).toFixed(2)+','+y(energy(s,t)).toFixed(2)}const svg=el('energy-fig');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML=`<title>핵 사이 거리 ${s.r_angstrom} Å에서 회전각에 따른 평균 에너지</title><path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="var(--muted)"/><path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5"/><circle cx="${x(theta)}" cy="${y(e)}" r="5" fill="var(--ink)"/><g fill="var(--ink)" font-size="12"><text x="4" y="20">에너지 (Ha)</text><text x="3" y="${top+4}">${max.toFixed(2)}</text><text x="3" y="${bottom+4}">${min.toFixed(2)}</text><text x="${left}" y="221">−180°</text><text x="${x(0)}" y="221">0</text><text x="${right-30}" y="221">180°</text><text x="${w/2-32}" y="239">회전각 θ</text></g>`;
}
function step(){const p=data.samples[index].pauli_hartree;theta-=.7/Math.hypot(p.X,p.Z)*(p.X*Math.cos(theta)-p.Z*Math.sin(theta));theta=Math.atan2(Math.sin(theta),Math.cos(theta));steps++}
el('distance').addEventListener('change',()=>{index=Number(el('distance').value);theta=0;steps=0;draw()});el('angle').addEventListener('input',()=>{theta=Number(el('angle').value)*Math.PI/180;steps=0;draw()});el('step').addEventListener('click',()=>{step();draw()});el('run').addEventListener('click',()=>{for(let i=0;i<20;i++)step();draw()});el('reference').addEventListener('click',()=>{theta=data.samples[index].optimal_theta_radians;steps=0;draw()});el('reset').addEventListener('click',()=>{theta=0;steps=0;draw()});mq.addEventListener('change',draw);draw();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
