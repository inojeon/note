import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const n=Number($('#n').value);$('[data-dense]').textContent=(n*n).toLocaleString();$('[data-sparse]').textContent=(3*n-2).toLocaleString();$('[data-bytes]').textContent=fmt(n*n*8/1024/1024,2)+' MiB';const v=Array.from({length:n},(_,i)=>Math.sin((i+1)*Math.PI/(n+1))),av=v.map((x,i)=>2*x-(v[i-1]??0)-(v[i+1]??0));$('[data-product]').textContent=av.slice(0,3).map(x=>fmt(x,6)).join(', ');chart($('[data-plot]'),[{points:v.map((y,i)=>[i+1,y])},{points:av.map((y,i)=>[i+1,y])}],{xlabel:'성분 번호',title:'벡터 v와 행렬을 생성하지 않고 계산한 Av'});}controls(root,context.signal,render);
}
