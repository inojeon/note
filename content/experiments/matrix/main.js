import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
function col(a,b,cls=''){return `<span class="math-array ${cls}" role="math" aria-label="${a}; ${b}"><span class="math-cells" aria-hidden="true"><span class="math-row"><span>${a}</span></span><span class="math-row"><span>${b}</span></span></span></span>`}
function fmt(n){return String(Number(n.toFixed(2)))}
function draw(){
const x=Number(document.getElementById('input-x').value),y=Number(document.getElementById('input-y').value),a=2*x+y,b=x+2*y,small=narrow(),W=small?360:680,panelW=small?360:340,panelH=310,H=small?620:310,scale=18;
document.getElementById('matrix-x-value').textContent=fmt(x);document.getElementById('matrix-y-value').textContent=fmt(y);
document.getElementById('matrix-equation').innerHTML=`<div><small>입력</small>${col(fmt(x),fmt(y))}</div><span>→ A →</span><div><small>두 열을 배수만큼 더하기</small><div class="matrix-sum"><span class="column-one">${fmt(x)} × ${col(2,1)}</span><span>+</span><span class="column-two">${fmt(y)} × ${col(1,2)}</span></div></div><span>=</span><div><small>출력</small>${col(fmt(a),fmt(b),'matrix-output')}</div>`;
const svg=document.getElementById('transform-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
function panel(ox,oy,title,output){
 const cx=ox+panelW/2,cy=oy+175,P=(u,v)=>[cx+u*scale,cy-v*scale];
 let z=`<text x="${ox+panelW/2}" y="${oy+24}" text-anchor="middle" fill="var(--ink)" font-size="16">${title}</text>`;
 for(let k=-6;k<=6;k++){
  const [gx,gy]=P(k,k);z+=`<path d="M ${gx} ${cy-6*scale} V ${cy+6*scale} M ${cx-6*scale} ${gy} H ${cx+6*scale}" stroke="var(--line)" stroke-width="0.6"/>`;
  if(k!==0&&k%2===0)z+=`<text x="${gx}" y="${cy+14}" text-anchor="middle" fill="var(--ink2)" font-size="10">${k}</text><text x="${cx-6}" y="${gy-3}" text-anchor="end" fill="var(--ink2)" font-size="10">${k}</text>`;
 }
 z+=`<path d="M ${cx-120} ${cy} H ${cx+120} M ${cx} ${cy-120} V ${cy+120}" stroke="var(--ink2)"/><text x="${cx+126}" y="${cy+4}" fill="var(--ink2)" font-size="12">x</text><text x="${cx+5}" y="${cy-125}" fill="var(--ink2)" font-size="12">y</text>`;
 function arrow(u1,v1,u2,v2,color,dashed=false){const [x1,y1]=P(u1,v1),[x2,y2]=P(u2,v2),angle=Math.atan2(y2-y1,x2-x1),l=8;if(Math.hypot(x2-x1,y2-y1)<.01)return `<circle cx="${x1}" cy="${y1}" r="3" fill="var(${color})"/>`;return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="var(${color})" stroke-width="2.5" ${dashed?'stroke-dasharray="4 3"':''}/><path d="M ${x2-l*Math.cos(angle-.4)} ${y2-l*Math.sin(angle-.4)} L ${x2} ${y2} L ${x2-l*Math.cos(angle+.4)} ${y2-l*Math.sin(angle+.4)}" fill="none" stroke="var(${color})" stroke-width="2.5"/>`}
 if(output){z+=arrow(0,0,2*x,x,'--n')+arrow(2*x,x,a,b,'--beta',true)+arrow(0,0,a,b,'--alpha');}
 else{z+=arrow(0,0,x,0,'--n')+arrow(x,0,x,y,'--beta',true)+arrow(0,0,x,y,'--ink');}
 return z;
}
svg.innerHTML=panel(0,0,'① 입력：기준 방향을 조합',false)+panel(small?0:340,small?310:0,'② 출력：변환된 방향을 조합',true);
let message=`첫째 열을 ${fmt(x)}배 하면 가로 ${fmt(2*x)}, 세로 ${fmt(x)}. 둘째 열을 ${fmt(y)}배 하면 가로 ${fmt(y)}, 세로 ${fmt(2*y)}. 둘을 더해 가로 ${fmt(a)}, 세로 ${fmt(b)}가 됩니다.`;
if(x===1&&y===0)message='오른쪽 한 칸만 넣으면 첫째 열이 그대로 나옵니다. 행렬의 첫째 열은 이 기준 방향의 변환 결과입니다.';
if(x===0&&y===1)message='위로 한 칸만 넣으면 둘째 열이 그대로 나옵니다. 행렬의 둘째 열은 이 기준 방향의 변환 결과입니다.';
if(x===1&&y===1)message='첫째 열과 둘째 열을 한 번씩 더합니다. 가로는 2 + 1 = 3, 세로는 1 + 2 = 3이 됩니다.';
if(x===1&&y===-1)message='둘째 열을 빼는 것은 연한 파랑 방향을 뒤집어 더하는 일입니다. 가로는 2 − 1 = 1, 세로는 1 − 2 = −1이 됩니다.';
if(x===0&&y===0)message='두 열을 모두 0배 하면 출력도 영벡터(Zero Vector)입니다. 선형변환은 원점을 그대로 둡니다.';
document.getElementById('transform-result').textContent=message;
document.querySelectorAll('[data-matrix-x]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.getAttribute('data-matrix-x'))===x&&Number(button.getAttribute('data-matrix-y'))===y)));
}
function drawAll(){try{draw()}catch(e){throw e;}}
document.getElementById('input-x').addEventListener('input',drawAll);document.getElementById('input-y').addEventListener('input',drawAll);
document.querySelectorAll('[data-matrix-x]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('input-x').value=button.getAttribute('data-matrix-x');document.getElementById('input-y').value=button.getAttribute('data-matrix-y');drawAll()}));
mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
