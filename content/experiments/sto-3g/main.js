import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const data=[{"basis": "sto-3g", "hydrogen_spatial_functions": 1, "h2_spatial_functions": 2, "h2_spin_orbitals": 4, "description": "수소마다 최소한의 s형 함수 하나입니다. H₂에서는 두 원자 중심 함수를 섞어 오비탈을 만듭니다."}, {"basis": "6-31g", "hydrogen_spatial_functions": 2, "h2_spatial_functions": 4, "h2_spin_orbitals": 8, "description": "수소마다 s형 함수 두 개입니다. 전자 분포의 크기를 바꿀 자유도가 늘어납니다."}, {"basis": "6-31g(d,p)", "hydrogen_spatial_functions": 5, "h2_spatial_functions": 10, "h2_spin_orbitals": 20, "description": "수소마다 s형 두 개와 p형 세 개입니다. 결합 환경에 따른 방향 변형을 표현할 수 있습니다."}, {"basis": "6-31++g(d,p)", "hydrogen_spatial_functions": 6, "h2_spatial_functions": 12, "h2_spin_orbitals": 24, "description": "수소마다 앞의 다섯 함수에 퍼진 s형 함수 하나가 추가됩니다. 먼 곳의 전자 분포를 표현할 여지가 늘어납니다."}, {"basis": "cc-pvdz", "hydrogen_spatial_functions": 5, "h2_spatial_functions": 10, "h2_spin_orbitals": 20, "description": "수소마다 s형 두 개와 p형 세 개입니다. 함수 수는 6-31G(d,p)와 같지만 함수의 모양과 구성은 다릅니다."}];const buttons=Array.from(document.querySelectorAll('[data-sto-basis]'));function show(name){const row=data.find(r=>r.basis===name);document.getElementById('sto-per-atom').textContent=row.hydrogen_spatial_functions+'개';document.getElementById('sto-total').textContent=row.h2_spatial_functions+'개';document.getElementById('sto-description').textContent=row.description;
document.getElementById('sto-spin-count').textContent=row.h2_spin_orbitals+'개';document.getElementById('sto-spin-count').dataset.value=row.h2_spin_orbitals;
const types=row.hydrogen_spatial_functions===1?['s']:row.hydrogen_spatial_functions===2?['s₁','s₂']:row.hydrogen_spatial_functions===5?['s₁','s₂','pₓ','pᵧ','p_z']:['s₁','s₂','pₓ','pᵧ','p_z','퍼진 s'];
const svg=document.getElementById('sto-functions');svg.setAttribute('viewBox','0 0 360 190');svg.innerHTML='<title>'+name+'의 수소당 공간 함수 '+types.length+'개</title>'+[0,1].map((atom)=>'<text x="12" y="'+(20+atom*90)+'" fill="var(--ink)">수소 '+(atom?'B':'A')+'</text>'+types.map((t,j)=>'<rect x="'+(12+j*56)+'" y="'+(30+atom*90)+'" width="50" height="36" rx="4" fill="var(--panel)" stroke="var(--accent)"/><text x="'+(37+j*56)+'" y="'+(53+atom*90)+'" text-anchor="middle" fill="var(--ink)" font-size="12">'+t+'</text>').join('')).join('');buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stoBasis===name)));}buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.stoBasis)));show('sto-3g');})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
