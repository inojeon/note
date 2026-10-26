import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const p=Number($('#p').value),m=Number($('#m').value),s=Math.sqrt(p*(1-p)/m);$('[data-p]').textContent=fmt(p);$('[data-error]').textContent=fmt(s,5);$('[data-expect]').textContent=fmt(m*p,1);chart($('[data-plot]'),[{points:Array.from({length:100},(_,i)=>{const n=(i+1)*100;return[n,Math.sqrt(p*(1-p)/n)];}),point:[m,s]}],{xmin:0,xmax:10000,xlabel:'샷 수 M',title:'독립 베르누이 측정의 표준 오차'});}controls(root,context.signal,render);
}
