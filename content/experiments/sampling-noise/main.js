import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
const data=await loadJSON(context,'data.json');function render(){const i=Number($('#sample').value),r=data.noise[i];$('[data-q]').textContent=fmt(r.q*100,1)+'%';$('[data-pass]').textContent=fmt(r.pass*100,2)+'%';$('[data-intact]').textContent=fmt(r.pass_and_intact*100,2)+'%';$('[data-wrong]').textContent=fmt((r.pass-r.pass_and_intact)*100,2)+'%';chart($('[data-plot]'),[{points:data.noise.map(x=>[x.q,x.pass]),point:[r.q,r.pass]},{points:data.noise.map(x=>[x.q,x.pass_and_intact]),point:[r.q,r.pass_and_intact]}],{xmin:0,xmax:.1,ymin:0,ymax:1,xlabel:'비트 반전 확률',title:'전자 수 보존 검사와 실제 배치 보존은 다릅니다.'});}controls(root,context.signal,render);
}
