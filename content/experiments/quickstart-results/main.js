import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
const d=await loadJSON(context,'data.json');function render(){const v=d.variants.find(x=>x.samples_per_batch===Number($('#batch').value)&&x.symmetrize_spin===$('#sym').checked),i=Number($('#step').value)-1,r=d.history[i];$('[data-error]').textContent=(v.final_err*1000).toExponential(4)+' mEh';$('[data-iterations]').textContent=v.iterations;$('[data-core]').textContent=fmt(d.nuclear_repulsion_energy,6)+' Eh';$('[data-energy]').textContent=fmt(r.E,8)+' Eh';$('[data-dim]').textContent=r.dim;chart($('[data-plot]'),[{points:d.history.map((x,i)=>[i+1,(x.E-d.E_exact)*1000]),point:[i+1,(r.E-d.E_exact)*1000]}],{xmin:1,xmax:7,xlabel:'기준 실행 반복',title:'기준 실행의 에너지 오차 (mEh)'});}controls(root,context.signal,render);
}
