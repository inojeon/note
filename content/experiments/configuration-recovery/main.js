import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const p=Number($('#p').value),e=Number($('#epsilon').value),raw=[p+e,.15+e,.05+e],sum=raw.reduce((a,b)=>a+b,0),w=raw.map(x=>x/sum);$('[data-weights]').textContent=w.map(x=>fmt(x,3)).join(', ');$('[data-best]').textContent=['1100','1010','1001'][w.indexOf(Math.max(...w))];const s=$('[data-plot]');s.setAttribute('viewBox','0 0 480 260');s.innerHTML='<title>전자 추가 위치를 고르는 설명용 가중치</title>'+w.map((x,i)=>`<rect x="${65+i*140}" y="${210-x*170}" width="70" height="${x*170}" fill="var(--n)"/><text x="${100+i*140}" y="235" text-anchor="middle" fill="var(--ink)">${['1100','1010','1001'][i]}</text><text x="${100+i*140}" y="${200-x*170}" text-anchor="middle" fill="var(--ink2)">${fmt(x*100,1)}%</text>`).join('');}controls(root,context.signal,render);
}
