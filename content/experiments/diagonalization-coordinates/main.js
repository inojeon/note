import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
function fmt(n){return (Math.abs(n)<.0005?0:n).toFixed(2)}
function array(rows,classes=''){return `<span class="math-array ${classes}" role="math" aria-label="${rows.map(row=>row.map(fmt).join(', ')).join('; ')}"><span class="math-cells" aria-hidden="true">${rows.map((row,i)=>`<span class="math-row">${row.map((v,j)=>`<span class="${rows[0].length===2&&i!==j?'diagonal-off':''}">${fmt(v)}</span>`).join('')}</span>`).join('')}</span></span>`}
function draw(){
const theta=Number(document.getElementById('diagonal-basis').value),alpha=Number(document.getElementById('diagonal-input').value),t=theta*Math.PI/180,r=alpha*Math.PI/180,c=Math.cos(t),s=Math.sin(t),x=Math.cos(r),y=Math.sin(r),wx=2*x+y,wy=x+2*y;
const b11=2+Math.sin(2*t),b12=Math.cos(2*t),b22=2-Math.sin(2*t),u=c*x+s*y,v=-s*x+c*y,d1=b11*u+b12*v,d2=b12*u+b22*v,backX=c*d1-s*d2,backY=s*d1+c*d2,aligned=Math.abs(b12)<1e-10;
document.getElementById('diagonal-basis-value').textContent=theta+'°';document.getElementById('diagonal-input-value').textContent=alpha+'°';
document.getElementById('diagonal-matrix-value').innerHTML=array([[b11,b12],[b12,b22]],aligned?'diagonal-aligned':'');
document.getElementById('diagonal-status').textContent=aligned?'대각선 밖이 0입니다. 첫 좌표는 3배, 둘째 좌표는 1배. 좌표끼리 섞이지 않고 계산됩니다.':`대각선 밖 성분은 ${fmt(b12)}입니다. 첫 출력에 둘째 입력이, 둘째 출력에 첫 입력이 섞여 들어갑니다.`;
const small=narrow(),W=small?360:680,panelW=small?360:340,panelH=340,H=small?680:340,scale=38;
function panel(ox,oy,local){const cx=ox+panelW/2,cy=oy+180;
 function P(a,b){return [cx+scale*a,cy-scale*b]}
 let z=`<text x="${ox+panelW/2}" y="${oy+24}" text-anchor="middle" fill="var(--ink)" font-size="15">${local?'② 새 좌표에서 본 같은 벡터':'① 원래 좌표의 벡터와 새 축'}</text>`;
 for(let k=-3;k<=3;k++){const [gx,gy]=P(k,k);z+=`<path d="M ${gx} ${cy-3*scale} V ${cy+3*scale} M ${cx-3*scale} ${gy} H ${cx+3*scale}" stroke="var(--line)" stroke-width=".6"/>`;if(k!==0)z+=`<text x="${gx}" y="${cy+13}" text-anchor="middle" font-size="10" fill="var(--ink2)">${k}</text>`;}
 z+=`<path d="M ${cx-122} ${cy} H ${cx+122} M ${cx} ${cy-122} V ${cy+122}" stroke="var(--ink2)"/>`;
 function arrow(a,b,color){const [px,py]=P(a,b),angle=Math.atan2(py-cy,px-cx),l=8;return `<path d="M ${cx} ${cy} L ${px} ${py}" stroke="var(${color})" stroke-width="3"/><path d="M ${px-l*Math.cos(angle-.4)} ${py-l*Math.sin(angle-.4)} L ${px} ${py} L ${px-l*Math.cos(angle+.4)} ${py-l*Math.sin(angle+.4)}" fill="none" stroke="var(${color})" stroke-width="3"/>`}
 if(!local){for(const [a,b,label] of [[c,s,'q₁'],[-s,c,'q₂']]){const [a1,b1]=P(-3*a,-3*b),[a2,b2]=P(3*a,3*b),[tx,ty]=P(2.7*a,2.7*b);z+=`<path d="M ${a1} ${b1} L ${a2} ${b2}" stroke="var(--beta)" stroke-dasharray="5 4"/><text x="${tx}" y="${ty-8}" font-size="13" text-anchor="middle" fill="var(--beta)">${label}</text>`;}}
 z+=arrow(local?d1:wx,local?d2:wy,'--alpha')+arrow(local?u:x,local?v:y,'--n');
 z+=`<text x="${cx+130}" y="${cy+4}" fill="var(--ink2)" font-size="12">${local?'q₁':'x'}</text><text x="${cx+4}" y="${cy-130}" fill="var(--ink2)" font-size="12">${local?'q₂':'y'}</text>`;
 return z;
}
const svg=document.getElementById('diagonal-basis-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=panel(0,0,false)+panel(small?0:340,small?340:0,true);
document.getElementById('diagonal-calculation').innerHTML=`<div><strong>1. 새 좌표로 읽기</strong><span>c = Qᵀv = ${array([[u],[v]])}</span></div><div><strong>2. 새 행렬로 계산</strong><span>Bc = ${array([[d1],[d2]])}</span></div><div><strong>3. 원래 좌표로 복원</strong><span>Q(Bc) = ${array([[backX],[backY]])}</span></div><div><strong>직접 계산과 비교</strong><span>Av = ${array([[wx],[wy]])}</span></div>`;
document.getElementById('diagonal-check').textContent='두 경로의 결과가 같습니다. 표시값은 소수 둘째 자리까지 반올림했습니다.';
document.querySelectorAll('[data-diagonal-basis]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.getAttribute('data-diagonal-basis'))===theta)));
}
function drawAll(){try{draw()}catch(e){throw e;}}
document.getElementById('diagonal-basis').addEventListener('input',drawAll);document.getElementById('diagonal-input').addEventListener('input',drawAll);document.querySelectorAll('[data-diagonal-basis]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('diagonal-basis').value=button.getAttribute('data-diagonal-basis');drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
