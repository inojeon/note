import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const s=Number($('#s').value),c=[3,4-3*s];$('[data-coords]').textContent=`(${fmt(c[0],1)}, ${fmt(c[1],1)})`;$('[data-rebuild]').textContent='(3, 4)';const p=$('[data-plot]');p.setAttribute('viewBox','0 0 480 330');const P=(x,y)=>[180+40*x,240-40*y],o=P(0,0),end=P(3,4),b=P(1,s),e=P(0,1);p.innerHTML=`<title>기저를 바꾸어도 벡터 (3,4)는 같습니다.</title><path d="M20,240H460 M180,20V320" stroke="var(--line)"/><path d="M${o}L${end}" stroke="var(--n)" stroke-width="4"/><path d="M${o}L${b} M${o}L${e}" stroke="var(--alpha)" stroke-width="3"/><circle cx="${end[0]}" cy="${end[1]}" r="5" fill="var(--n)"/><text x="${end[0]+10}" y="${end[1]}" fill="var(--ink)">v=(3,4)</text><text x="${b[0]+10}" y="${b[1]}" fill="var(--ink2)">b₁=(1,${fmt(s,1)})</text>`;}controls(root,context.signal,render);
}
