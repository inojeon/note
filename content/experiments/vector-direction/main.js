import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
const input=$('#angle');input.dataset.role='angle';
function render(){const deg=Number(input.value),a=deg*Math.PI/180,x=Math.cos(a),y=Math.sin(a);$('[data-angle]').textContent=deg+'°';$('[data-x]').textContent=fmt(x);$('[data-y]').textContent=fmt(y);$('[data-norm]').textContent=fmt(Math.hypot(x,y),6);const p=$('[data-plot]'),cx=210,cy=165,r=120,px=cx+r*x,py=cy-r*y;p.setAttribute('viewBox','0 0 420 330');p.innerHTML=`<title>단위 벡터 (${fmt(x)}, ${fmt(y)})</title><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)"/><path d="M45,${cy}H375 M${cx},15V315" stroke="var(--line)"/><path d="M${cx},${cy}H${px}V${py}" fill="none" stroke="var(--beta)" stroke-width="2" stroke-dasharray="5 4"/><path d="M${cx},${cy}L${px},${py}" stroke="var(--n)" stroke-width="4"/><circle cx="${px}" cy="${py}" r="6" fill="var(--n)"/><text x="380" y="160" fill="var(--ink2)">x</text><text x="220" y="20" fill="var(--ink2)">y</text>`;p.dataset.componentX=x;p.dataset.componentY=y;}
controls(root,context.signal,render);
}
