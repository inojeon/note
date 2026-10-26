import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const a=Number($('#theta').value),v=Math.cos(a*Math.PI/180);$('[data-dot]').textContent=fmt(v);$('[data-projection]').textContent=fmt(v);chart($('[data-plot]'),[{points:Array.from({length:181},(_,x)=>[x,Math.cos(x*Math.PI/180)]),point:[a,v]}],{xmin:0,xmax:180,ymin:-1,ymax:1,xlabel:'각도 (도)',title:'단위 벡터 내적 = cos θ'});}controls(root,context.signal,render);
}
