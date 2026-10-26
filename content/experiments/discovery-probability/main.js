import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const p=10**Number($('#logp').value),m=Math.round(10**Number($('#logm').value)),found=-Math.expm1(m*Math.log1p(-p));$('[data-prob]').textContent=p.toExponential(2);$('[data-shots]').textContent=m.toLocaleString();$('[data-found]').textContent=fmt(found*100,2)+'%';chart($('[data-plot]'),[{points:Array.from({length:71},(_,i)=>[i/10,-Math.expm1(10**(i/10)*Math.log1p(-p))]),point:[Math.log10(m),found]}],{xmin:0,xmax:7,ymin:0,ymax:1,xlabel:'log₁₀ M',title:'발견 확률 1−(1−p)^M'});}controls(root,context.signal,render);
}
