import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const b=Number($('#b').value),d=Math.hypot(.5,b),angle=.5*Math.atan2(2*b,1),v1=[Math.cos(angle),Math.sin(angle)],v2=[-Math.sin(angle),Math.cos(angle)];$('[data-values]').textContent=`${fmt(1.5+d)}, ${fmt(1.5-d)}`;$('[data-dot]').textContent=fmt(v1[0]*v2[0]+v1[1]*v2[1],6);const p=$('[data-plot]');p.setAttribute('viewBox','0 0 400 300');p.innerHTML='<title>실수 대칭 행렬의 서로 수직인 고유방향</title><circle cx="200" cy="150" r="100" fill="none" stroke="var(--line)"/>'+[v1,v2].map((v,i)=>`<path d="M${200-110*v[0]},${150+110*v[1]}L${200+110*v[0]},${150-110*v[1]}" stroke="var(--${i?'alpha':'n'})" stroke-width="3"/>`).join('');}controls(root,context.signal,render);
}
