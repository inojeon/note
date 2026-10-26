import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 document.getElementById("h2h-data").textContent=JSON.stringify(await loadJSON(context,"h2h-data.json"));
 try {

(()=>{const $=id=>document.getElementById('h2h-'+id);if(!$('data'))return;let data;try{data=JSON.parse($('data').textContent)}catch(_){return}const samples=data.samples,mq=matchMedia('(max-width:600px)');let index=data.default_index,cell=0,mode='a',theta=0;const f=x=>x.toFixed(6).replace('-','−');
$('distances').innerHTML=samples.map((s,i)=>'<button type="button" data-h2h-distance="'+i+'">'+s.r_angstrom+' Å</button>').join('');
function draw(){const s=samples[index],H=s.hamiltonian_even_hartree,c=[Math.cos(theta/2),Math.sin(theta/2)],parts=[c[0]**2*H[0][0],c[1]**2*H[1][1],2*c[0]*c[1]*H[0][1]],energy=parts.reduce((a,b)=>a+b,0);$('distance').textContent='R = '+s.r_angstrom+' Å · 기저 순서 A(0101), B(1010)';$('distance').dataset.index=index;
['aa','ab','ba','bb'].forEach((id,i)=>{$(id).textContent=f(H[Math.floor(i/2)][i%2]);$(id).dataset.value=H[Math.floor(i/2)][i%2]});
$('cell-explanation').textContent=cell===0?'HAA: A만 준비했을 때의 평균 에너지입니다. 전자 두 개의 기여와 핵 반발을 포함합니다.':cell===3?'HBB: B만 준비했을 때의 평균 에너지입니다. 반결합성 궤도에 전자 둘을 배치한 상태를 평가합니다.':'H'+(cell===1?'AB':'BA')+': A와 B 사이의 결합입니다. 이 실수 대칭 행렬에서는 HAB = HBA입니다. 확률이나 A·B의 에너지 차이가 아닙니다.';
$('angle').textContent=(theta*180/Math.PI).toFixed(2)+'°';$('theta').value=theta*180/Math.PI;$('state').dataset.coefficients=JSON.stringify(c);$('state').innerHTML='<span class="math-tex" data-tex="\\begin{aligned}|\\psi\\rangle &amp;\\approx '+c[0].toFixed(4)+'|A\\rangle\\\\ &amp;'+(c[1]<0?'-':'+')+Math.abs(c[1]).toFixed(4)+'|B\\rangle\\end{aligned}">현재 상태의 배치 계수</span>';
$('probabilities').textContent='A 측정 확률 '+(100*c[0]**2).toFixed(2)+'% · B 측정 확률 '+(100*c[1]**2).toFixed(2)+'%';$('probabilities').dataset.values=JSON.stringify(c.map(v=>v*v));[['energy',energy],['ground',s.energy_fci_hartree],['electronic',energy-s.energy_nuclear_hartree],['nuclear',s.energy_nuclear_hartree]].forEach(([id,v])=>{$(id).textContent=f(v)+' Eₕ';$(id).dataset.value=v});
$('reading').textContent=mode==='flip'?'바닥상태와 같은 배치 확률이지만 상대 부호를 바꿨습니다. 결합 항의 부호가 바뀌어 에너지가 올라갑니다.':mode==='ground'?'A만 사용할 때보다 낮은 에너지입니다. 두 배치의 계수는 이 행렬의 최저 고유벡터로 정했습니다.':mode==='a'||mode==='b'?'한 배치만 있으므로 결합 기여가 0입니다. 에너지는 해당 대각 원소와 같습니다.':'각도를 바꾸어도 H는 고정입니다. 상태의 두 계수와 결합 기여가 바뀝니다.';
document.querySelectorAll('[data-h2h-distance]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.h2hDistance===index)));document.querySelectorAll('[data-h2h-cell]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.h2hCell===cell)));document.querySelectorAll('[data-h2h-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.h2hState===mode)));
const w=mq.matches?288:620,mid=w*.55,scale=(w*.24)/Math.max(.1,...parts.map(Math.abs));let svg='<title>대각과 결합 항의 합이 평균 에너지입니다.</title><line x1="'+mid+'" x2="'+mid+'" y1="10" y2="144" stroke="var(--line)"/>';
parts.forEach((v,i)=>{const y=20+i*42;svg+='<text x="0" y="'+(y+14)+'">'+['A 대각 기여','B 대각 기여','결합 기여'][i]+'</text><rect x="'+(mid+Math.min(0,v)*scale)+'" y="'+y+'" width="'+Math.abs(v)*scale+'" height="20" fill="var(--'+(i===2?'alpha':'accent')+')"/><text x="'+(w-1)+'" y="'+(y+14)+'" text-anchor="end">'+v.toFixed(4)+'</text>'});$('contributions-fig').setAttribute('viewBox','0 0 '+w+' 150');$('contributions-fig').innerHTML=svg;$('contributions-fig').dataset.values=JSON.stringify(parts);}
function selectMode(m){mode=m;theta=m==='a'?0:m==='b'?Math.PI:m==='ground'?samples[index].optimal_theta_radians:-samples[index].optimal_theta_radians;draw()}
document.querySelectorAll('[data-h2h-state]').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.h2hState)));document.querySelectorAll('[data-h2h-cell]').forEach(b=>b.addEventListener('click',()=>{cell=+b.dataset.h2hCell;draw()}));document.querySelectorAll('[data-h2h-distance]').forEach(b=>b.addEventListener('click',()=>{index=+b.dataset.h2hDistance;if(mode==='ground'||mode==='flip')selectMode(mode);else draw()}));$('theta').addEventListener('input',()=>{theta=+$('theta').value*Math.PI/180;mode='custom';draw()});mq.addEventListener('change',draw);draw();})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
