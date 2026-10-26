import { required, inputNumber } from 'learning-plane.js';
export function mount(root,{signal}) {
 const p=required(root,'[data-p]'),out=required(root,'[data-result]'),plot=required(root,'[data-plot]');
 const fmt=x=>Number(x.toFixed(3));
 function render(){const v=inputNumber(p),q=1-v,mean=v+3*q;Object.assign(out.dataset,{probability:String(v),mean:String(mean)});out.textContent=`P(1) = ${fmt(v)}, P(3) = ${fmt(q)} · 합 = 1`;
 required(root,'[data-calculation]').textContent=`평균 = 1 × ${fmt(v)} + 3 × ${fmt(q)} = ${fmt(mean)}점`;
 required(root,'[data-explanation]').textContent=mean===1||mean===3?'가능한 결과 하나에 확률이 모두 모여 있습니다.':'평균은 1과 3 사이의 값입니다. 한 번의 추첨 결과는 여전히 1 또는 3입니다.';
 plot.setAttribute('viewBox','0 0 460 330');plot.innerHTML=`<title>1점 확률 ${fmt(v)}, 3점 확률 ${fmt(q)}, 평균 ${fmt(mean)}점</title><path class="math-axis" d="M55 30V240H420"/><text x="18" y="40">1</text><text x="18" y="245">0</text><text x="55" y="20">확률</text><path class="math-axis" d="M55 135H420" stroke-dasharray="4 4"/><text x="12" y="140">½</text><rect class="math-bar" x="110" y="${240-210*v}" width="90" height="${210*v}"/><rect class="math-second" x="280" y="${240-210*q}" width="90" height="${210*q}"/><text x="155" y="265" text-anchor="middle">1점: ${fmt(v)}</text><text x="325" y="265" text-anchor="middle">3점: ${fmt(q)}</text><text x="230" y="310" text-anchor="middle">확률로 가중한 평균 ${fmt(mean)}점</text>`;
 }
 p.addEventListener('input',render,{signal});root.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{p.value=b.dataset.preset;render();},{signal}));required(root,'[data-reset]').addEventListener('click',()=>{p.value=.25;render();},{signal});render();
}
