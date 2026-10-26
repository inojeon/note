import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const data={"method":"RHF","molecule":"H2","bond_length_angstrom":0.74,"charge":0,"spin_2s":0,"energy_unit":"Hartree","pyscf_version":"2.14.0","rows":[{"basis":"sto-3g","spatial_functions":2,"orbital_energies_hartree":[-0.5785538598315291,0.6711434919142516],"occupations":[2.0,0.0],"total_energy_hartree":-1.1167593073964255,"max_eigen_residual":4.440892098500626e-16,"max_orthogonality_error":2.6823681330876626e-16},{"basis":"6-31g","spatial_functions":4,"orbital_energies_hartree":[-0.5958173021437561,0.23847281524135844,0.7747229944249204,1.4044120392929982],"occupations":[2.0,0.0,0.0,0.0],"total_energy_hartree":-1.1267553171969735,"max_eigen_residual":5.804245972740318e-13,"max_orthogonality_error":2.6645352591003757e-15},{"basis":"6-31g(d,p)","spatial_functions":10,"orbital_energies_hartree":[-0.5949214156671796,0.23953702804804655,0.7711766236223098,1.3105512280746705,1.9591887374263273,1.9591887374263304,2.7062558161510206,2.9311396619532895,2.931139661953294,4.534655886209233],"occupations":[2.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"total_energy_hartree":-1.1312938537238528,"max_eigen_residual":1.972644270153978e-12,"max_orthogonality_error":2.9220218981482442e-15},{"basis":"6-31++g(d,p)","spatial_functions":12,"orbital_energies_hartree":[-0.5956822268098777,0.07490246158818037,0.08850151090855796,0.30531115789029417,0.939364632122096,1.3850609338232354,1.9578124206139038,1.9578124206139071,2.722710621636771,2.9297565961777967,2.9297565961778007,4.537492121434071],"occupations":[2.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"total_energy_hartree":-1.1313677145668026,"max_eigen_residual":2.284838984678572e-13,"max_orthogonality_error":6.106226635438361e-15},{"basis":"cc-pvdz","spatial_functions":10,"orbital_energies_hartree":[-0.59241098621897,0.19744005562429223,0.4793210495820295,0.937323685351793,1.2929037086442468,1.292903708644251,1.9570225996581518,2.0435200477445963,2.0435200477446003,3.610474175342687],"occupations":[2.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"total_energy_hartree":-1.128700093556441,"max_eigen_residual":2.5790480862042386e-13,"max_orthogonality_error":4.298788668479723e-15}]},el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)');
const sets={basic:['sto-3g','6-31g','6-31g(d,p)'],extended:['6-31g(d,p)','6-31++g(d,p)','cc-pvdz']};
const names={'sto-3g':'STO-3G','6-31g':'6-31G','6-31g(d,p)':'6-31G(d,p)','6-31++g(d,p)':'6-31++G(d,p)','cc-pvdz':'cc-pVDZ'};
let comparison='basic',range='low';
function draw(){
 const rows=sets[comparison].map(name=>data.rows.find(r=>r.basis===name)),w=mq.matches?340:660,h=440,left=46,right=12,top=60,bottom=370,emin=range==='low'?-.85:-1,emax=range==='low'?1.5:5;
 const width=(w-left-right)/3,y=e=>bottom-(e-emin)/(emax-emin)*(bottom-top),svg=el('sto-levels-fig');
 let markup='<title>H2 RHF · 기저별 오비탈 에너지</title><text x="'+left+'" y="16" fill="var(--ink2)" font-size="12">오비탈 에너지 (Eh)</text>';
 const ticks=range==='low'?[-.5,0,.5,1,1.5]:[-1,0,1,2,3,4,5];
 for(const t of ticks)markup+='<line x1="'+left+'" y1="'+y(t)+'" x2="'+(w-right)+'" y2="'+y(t)+'" stroke="var(--line)"'+(t===0?' stroke-dasharray="4 4"':'')+'/><text x="'+(left-7)+'" y="'+(y(t)+4)+'" text-anchor="end" fill="var(--ink2)" font-size="11">'+t.toFixed(1)+'</text>';
 const counts=[];
 rows.forEach((row,i)=>{
  const cx=left+width*(i+.5);let shown=0,groups=[];
  row.orbital_energies_hartree.forEach((e,j)=>{if(e<emin||e>emax)return;shown++;const previous=groups.at(-1);if(previous&&Math.abs(previous.e-e)<1e-7)previous.ids.push(j);else groups.push({e,ids:[j],occupied:row.occupations[j]>0});});
  markup+='<text x="'+cx+'" y="40" text-anchor="middle" fill="var(--ink)" font-size="'+(mq.matches?10:13)+'">'+names[row.basis]+'</text>';
  for(const group of groups){const bar=mq.matches?27:52;markup+='<line data-sto-energy="'+group.e+'" data-sto-basis-name="'+row.basis+'" data-sto-multiplicity="'+group.ids.length+'" x1="'+(cx-bar/2)+'" y1="'+y(group.e)+'" x2="'+(cx+bar/2)+'" y2="'+y(group.e)+'" stroke="var(--'+(group.occupied?'n':'alpha')+')" stroke-width="'+(group.occupied?4:2)+'"><title>'+names[row.basis]+' · '+group.ids.map(j=>j+1).join(', ')+'번 · '+group.e.toFixed(6)+' Eh</title></line>';if(group.ids.length>1)markup+='<text x="'+(cx+bar/2+3)+'" y="'+(y(group.e)+4)+'" fill="var(--ink2)" font-size="10">×'+group.ids.length+'</text>';}
  counts.push(names[row.basis]+': '+shown+'/'+row.spatial_functions+'개 표시');
  markup+='<text x="'+cx+'" y="400" text-anchor="middle" fill="var(--ink2)" font-size="11">'+shown+'/'+row.spatial_functions+'개</text>';
  if(shown<row.spatial_functions)markup+='<text x="'+cx+'" y="420" text-anchor="middle" fill="var(--ink2)" font-size="10">범위 밖 '+(row.spatial_functions-shown)+'개</text>';
 });
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.dataset.range=JSON.stringify([emin,emax]);svg.dataset.bases=JSON.stringify(sets[comparison]);svg.innerHTML=markup;
 el('sto-levels-summary').textContent=counts.join(' · ')+(range==='low'?' 높은 준위는 전체 준위 보기로 확인하세요.':'');
 el('sto-level-rows').innerHTML=rows.map(row=>row.orbital_energies_hartree.map((e,j)=>'<tr><th scope="row">'+names[row.basis]+'</th><td>'+(j+1)+'</td><td>'+e.toFixed(6)+'</td><td>'+row.occupations[j]+'</td></tr>').join('')).join('');
 document.querySelectorAll('[data-sto-comparison]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stoComparison===comparison)));
 document.querySelectorAll('[data-sto-range]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stoRange===range)));
}
function render(){try{draw()}catch(error){throw error;}}
document.querySelectorAll('[data-sto-comparison]').forEach(b=>b.addEventListener('click',()=>{comparison=b.dataset.stoComparison;render()}));document.querySelectorAll('[data-sto-range]').forEach(b=>b.addEventListener('click',()=>{range=b.dataset.stoRange;render()}));mq.addEventListener('change',render);render();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
