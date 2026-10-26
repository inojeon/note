import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const t=Number($('#theta').value)*Math.PI/180,x=Math.cos(t),y=Math.sin(t),a=2*x+y,b=x+2*y,cross=x*b-y*a;$('[data-input]').textContent=`(${fmt(x)},${fmt(y)})`;$('[data-output]').textContent=`(${fmt(a)},${fmt(b)})`;$('[data-cross]').textContent=fmt(cross,6);const p=$('[data-plot]');p.setAttribute('viewBox','0 0 420 330');p.innerHTML=`<title>입력과 출력 벡터: 외적 ${fmt(cross)}</title><path d="M20,165H400 M210,15V315" stroke="var(--line)"/>`+[[x,y,'alpha'],[a,b,'n']].map(([u,v,c])=>`<path d="M210,165L${210+50*u},${165-50*v}" stroke="var(--${c})" stroke-width="4"/><circle cx="${210+50*u}" cy="${165-50*v}" r="5" fill="var(--${c})"/>`).join('');}controls(root,context.signal,render);
}
