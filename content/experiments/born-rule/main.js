import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
'use strict';
const get=id=>document.getElementById(id), mq=window.matchMedia('(max-width:600px)');
function fmt(v){return (Math.abs(v)<0.0005?0:v).toFixed(3).replace('-','−');}
function draw(){
 const degrees=Number(get('born-angle').value),theta=degrees*Math.PI/180,values=[Math.cos(theta),Math.sin(theta)],probs=values.map(v=>v*v);
 get('born-angle-value').textContent=degrees.toFixed(3)+'°';
 get('born-vector').innerHTML='<span class="math-array" role="math" aria-label="'+values.map(fmt).join('; ')+'"><span class="math-cells" aria-hidden="true">'+values.map(v=>'<span class="math-row"><span>'+fmt(v)+'</span></span>').join('')+'</span></span>';
 ['zero','one'].forEach((name,i)=>get('born-result-'+name).textContent='진폭 '+fmt(values[i])+' → 확률 '+(100*probs[i]).toFixed(1)+'%');
 get('born-result-zero').dataset.probability=probs[0];get('born-result-one').dataset.probability=probs[1];get('born-total').textContent='p₀ + p₁ = '+probs[0].toFixed(6)+' + '+probs[1].toFixed(6)+' = '+(probs[0]+probs[1]).toFixed(6);
 get('born-status').textContent=degrees===30||degrees===150?'30°와 150°는 첫 진폭의 부호만 다릅니다. 이 측정에서 두 상태 모두 결과 0의 확률은 '+(100*probs[0]).toFixed(1)+'%, 결과 1은 '+(100*probs[1]).toFixed(1)+'%입니다.':'진폭의 부호와 관계없이 확률은 0 이상입니다. 두 확률의 합은 1이며, 이 값은 반복 측정의 이론 확률입니다.';
 [['born-rational',Math.atan2(4,3)*180/Math.PI],['born-rational-negative',180-Math.atan2(4,3)*180/Math.PI],['born-positive',30],['born-negative',150],['born-certain',90]].forEach(p=>get(p[0]).setAttribute('aria-pressed',String(degrees===p[1])));
 const narrow=mq.matches,w=narrow?280:620,h=narrow?410:230,panel=narrow?280:300,ampX=narrow?142:150,half=narrow?85:96,probX=narrow?44:358,probY=narrow?260:80,probWidth=narrow?190:214;
 const text=(x,y,t,color,anchor)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'start')+'" fill="var(--'+(color||'ink')+')" font-size="14">'+t+'</text>';
 let svg='<title id="born-fig-title">진폭의 절댓값 제곱이 측정 확률</title><desc id="born-fig-desc">진폭 '+values.map(fmt).join(', ')+'에서 결과 확률 '+probs.map(p=>(100*p).toFixed(1)+'%').join(', ')+'.</desc>';
 svg+=text(panel/2,25,'진폭 · 부호를 유지','ink','middle')+text(narrow?panel/2:470,narrow?220:25,'확률 · 0 이상','ink','middle');
 [-1,0,1].forEach(t=>svg+=text(ampX+t*half,52,String(t),'ink2','middle'));
 svg+='<line x1="'+ampX+'" y1="64" x2="'+ampX+'" y2="172" stroke="var(--ink2)" stroke-width="1"/>';
 [0,1].forEach(i=>{
  const color=i?'beta':'n',y=80+i*62,bar=values[i]*half;
  svg+=text(10,y+17,String(i),color)+ '<rect x="'+(ampX+Math.min(0,bar))+'" y="'+y+'" width="'+Math.abs(bar)+'" height="26" rx="3" fill="var(--'+color+')"/>';
  svg+=text(panel/2,y+44,fmt(values[i]),color,'middle');
  const py=probY+i*62;
  svg+=text(probX-28,py+18,String(i),color)+'<rect x="'+probX+'" y="'+py+'" width="'+probWidth+'" height="26" rx="3" fill="var(--code)" stroke="var(--line)"/>';
  svg+='<rect x="'+probX+'" y="'+py+'" width="'+probs[i]*probWidth+'" height="26" rx="3" fill="var(--'+color+')"/>'+text(probX,py+45,(100*probs[i]).toFixed(1)+'%',color);
 });
 svg+=text(probX,probY-13,'0%','ink2')+text(probX+probWidth,probY-13,'100%','ink2','end');
 get('born-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('born-fig').innerHTML=svg;
}
function drawAll(){try{draw();}catch(e){throw e;}}
get('born-angle').addEventListener('input',drawAll);
[['born-rational',Math.atan2(4,3)*180/Math.PI],['born-rational-negative',180-Math.atan2(4,3)*180/Math.PI],['born-positive',30],['born-negative',150],['born-certain',90]].forEach(p=>get(p[0]).addEventListener('click',()=>{get('born-angle').value=p[1];drawAll();}));
mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
