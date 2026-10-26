import { controls, fmt } from 'experiment-shared.js';
import { createPlane } from 'learning-plane.js';
export function mount(root,context){
 const $=s=>root.querySelector(s),plane=createPlane($('[data-plot]'),{extent:4});
 function render(){const degrees=Number($('#theta').value),t=degrees*Math.PI/180,x=Math.cos(t),y=Math.sin(t),a=2*x+y,b=x+2*y,cross=x*b-y*a,parallel=Math.abs(cross)<1e-8;$('[data-input]').textContent=`(${fmt(x)}, ${fmt(y)})`;$('[data-output]').textContent=`(${fmt(a)}, ${fmt(b)})`;$('[data-cross]').textContent=fmt(cross,6);$('[data-explanation]').textContent=parallel?`같은 직선에 남습니다. Av = ${fmt(x*a+y*b)}v이므로 이 입력은 고유벡터입니다.`:`입력과 출력의 방향이 다릅니다. 45도 또는 −45도에서 비교하세요.`;if(parallel)$('[data-explanation]').textContent=`같은 직선에 남습니다. Av = ${fmt(x*a+y*b)}v이므로 이 입력은 고유벡터입니다.`;plane.clear();plane.segment([0,0],[a,b],{className:'lp-result',width:5});plane.segment([0,0],[x,y],{className:'lp-v',dashed:true,width:3});plane.label([x,y],'입력 v',{dx:-50,dy:20});plane.label([a,b],'출력 Av',{dx:30,dy:-18});plane.describe(`입력 ${fmt(x)},${fmt(y)}, 출력 ${fmt(a)},${fmt(b)}. ${parallel?'같은 직선':'방향이 다름'}`);}
 controls(root,context.signal,render);root.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>{$('#theta').value=b.dataset.angle;render();},{signal:context.signal}));
}
