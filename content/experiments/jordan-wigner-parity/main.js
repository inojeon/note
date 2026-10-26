import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
function render(){const bits=Array.from(root.querySelectorAll('[data-bit]'),e=>e.checked?1:0),j=Number($('#target').value),n=bits.slice(0,j).reduce((a,b)=>a+b,0),sign=bits[j]?0:(n%2?-1:1),out=bits.slice();out[j]=1;$('[data-bits]').textContent=bits.join('');$('[data-parity]').textContent=n;$('[data-sign]').textContent=String(sign);$('[data-state]').textContent=sign===0?'0 (이미 점유됨)':(sign<0?'−':' +')+'|'+out.join('')+'⟩';}controls(root,context.signal,render);root.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{const mode=button.dataset.example;root.querySelectorAll('[data-bit]').forEach((input,i)=>input.checked=i===0||(mode==='even'&&i===1)||(mode==='occupied'&&i===2));$('#target').value=2;render();},{signal:context.signal}));
}
