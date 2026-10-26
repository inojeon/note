import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
const d=await loadJSON(context,'data.json');function render(){const i=Number($('#iteration').value)-1,b=Number($('#batch').value)-1,r=d.iterations[i],e=r.E[b];$('[data-energy]').textContent=fmt(e,9)+' Eh';$('[data-error]').textContent=fmt((e-d.E_CASCI)*1000,5)+' mEh';$('[data-dim]').textContent=r.dims[b].join(' × ');$('[data-occupancy]').textContent='α 평균 점유도 (반올림값): '+r.occ_alpha.map(x=>fmt(x,3)).join(', ');chart($('[data-plot]'),[0,1,2].map(j=>({points:d.iterations.map((x,k)=>[k+1,(x.E[j]-d.E_CASCI)*1000]),...(j===b?{point:[i+1,(e-d.E_CASCI)*1000]}:{})})),{xmin:1,xmax:8,xlabel:'반복 번호',title:'배치별 에너지 오차 (mEh)'});}controls(root,context.signal,render);
}
