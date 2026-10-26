import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
const N=12,S=Math.SQRT1_2;
function fmt(n){return (Math.abs(n)<.0000005?0:n).toFixed(6)}
function col(x,y){return `<span class="math-array" role="math" aria-label="${fmt(x)}; ${fmt(y)}"><span class="math-cells" aria-hidden="true"><span class="math-row"><span>${fmt(x)}</span></span><span class="math-row"><span>${fmt(y)}</span></span></span></span>`}
function history(angle){let x=Math.cos(angle*Math.PI/180),y=Math.sin(angle*Math.PI/180);if(angle===45){x=S;y=S}if(angle===-45){x=S;y=-S}const rows=[];for(let k=0;k<=N;k++){const alpha=(x+y)*S,beta=(x-y)*S;rows.push({x,y,alpha,beta,rayleigh:x*(2*x+y)+y*(x+2*y),error:Math.atan2(Math.abs(beta),Math.abs(alpha))*180/Math.PI});const ax=2*x+y,ay=x+2*y,norm=Math.hypot(ax,ay);x=ax/norm;y=ay/norm}return rows}
function draw(){
const angle=Number(document.getElementById('power-angle').value),k=Number(document.getElementById('power-iteration').value),rows=history(angle),current=rows[k],small=narrow(),W=small?360:680,H=small?640:340;
document.getElementById('power-angle-value').textContent=angle+'°';document.getElementById('power-iteration-value').textContent=k+'회';document.getElementById('power-vector-value').innerHTML=col(current.x,current.y);document.getElementById('power-eigenvalue').textContent=current.rayleigh.toFixed(6);
let message=k===0?'아직 곱하지 않은 시작 벡터입니다. ‘한 번 곱하고 정규화’를 눌러 보세요.':`${k}번 반복했습니다. 큰 고유방향과의 각도는 ${current.error.toFixed(4)}°입니다.`;
if(angle===-45)message='고유값 1의 고유벡터에서 시작했습니다. 이 방향은 계속 그대로이고, 레일리 몫도 1입니다. 큰 고유방향의 시작 성분이 0이기 때문입니다.';
if(angle===45)message='이미 고유값 3의 고유벡터입니다. 곱할 때마다 길이는 3배가 되지만, 정규화하면 같은 단위 벡터로 돌아옵니다.';
if(angle===-44)message+= ' 큰 고유방향의 시작 성분은 아주 작지만 0은 아닙니다. 반복 횟수를 늘려 보세요.';
document.getElementById('power-message').textContent=message;
document.getElementById('power-back').disabled=k===0;document.getElementById('power-next').disabled=k===N;document.getElementById('power-reset').disabled=k===0;
document.querySelectorAll('[data-power-angle]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.getAttribute('data-power-angle'))===angle)));
const svg=document.getElementById('power-direction-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
const cx=small?180:170,cy=178,R=100;
let z=`<text x="${cx}" y="22" text-anchor="middle" fill="var(--ink)" font-size="15">① 벡터의 방향 · 길이는 항상 1</text><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line)"/><path d="M ${cx-125} ${cy} H ${cx+125} M ${cx} ${cy-125} V ${cy+125}" stroke="var(--line)"/>`;
for(const [dx,dy,name,color] of [[S,S,'λ = 3','--beta'],[S,-S,'λ = 1','--alpha']]){z+=`<path d="M ${cx-120*dx} ${cy+120*dy} L ${cx+120*dx} ${cy-120*dy}" stroke="var(${color})" stroke-dasharray="4 4"/><text x="${cx+120*dx+3}" y="${cy-120*dy}" fill="var(${color})" font-size="12">${name}</text>`;}
function arrow(row,opacity,width){const px=cx+R*row.x,py=cy-R*row.y,a=Math.atan2(py-cy,px-cx),l=8;return `<path d="M ${cx} ${cy} L ${px} ${py} M ${px-l*Math.cos(a-.4)} ${py-l*Math.sin(a-.4)} L ${px} ${py} L ${px-l*Math.cos(a+.4)} ${py-l*Math.sin(a+.4)}" fill="none" stroke="var(--n)" stroke-width="${width}" opacity="${opacity}"/>`}
for(let j=0;j<k;j++)z+=arrow(rows[j],.22,1.5);z+=arrow(current,1,3);
const ox=small?0:340,oy=small?320:0,L=ox+48,T=oy+65,B=oy+275,graphW=250,graphH=B-T;
z+=`<text x="${ox+(small?180:170)}" y="${oy+22}" text-anchor="middle" fill="var(--ink)" font-size="15">② 大きい固有方向との角度</text>`;
for(const degrees of [0,30,60,90]){const yy=B-degrees/90*graphH;z+=`<path d="M ${L} ${yy} H ${L+graphW}" stroke="var(--line)"/><text x="${L-8}" y="${yy+4}" text-anchor="end" fill="var(--ink2)" font-size="11">${degrees}°</text>`;}
z+=`<path d="M ${L} ${T} V ${B} H ${L+graphW}" fill="none" stroke="var(--ink2)"/>`;
for(let j=0;j<=N;j+=3)z+=`<text x="${L+j/N*graphW}" y="${B+18}" text-anchor="middle" fill="var(--ink2)" font-size="11">${j}</text>`;
z+=`<text x="${L+graphW}" y="${B+38}" text-anchor="end" fill="var(--ink2)" font-size="11">반복 횟수 k</text><path d="${rows.slice(0,k+1).map((row,j)=>`${j?'L':'M'} ${L+j/N*graphW} ${B-row.error/90*graphH}`).join(' ')}" fill="none" stroke="var(--n)" stroke-width="2"/><circle cx="${L+k/N*graphW}" cy="${B-current.error/90*graphH}" r="4" fill="var(--n)"/>`;
svg.innerHTML=z.replace('大きい固有方向との角度','큰 고유방향과의 각도');
if(k===0){document.getElementById('power-step-calculation').innerHTML='<p>0회는 시작 벡터입니다. 한 단계를 진행하면 곱셈 직후의 값과 정규화 결과가 나타납니다.</p>'}
else{const prev=rows[k-1],ax=2*prev.x+prev.y,ay=prev.x+2*prev.y,norm=Math.hypot(ax,ay);document.getElementById('power-step-calculation').innerHTML=`<div class="power-step-grid"><div><small>① 이전 단위 벡터 vₖ₋₁</small>${col(prev.x,prev.y)}</div><div><small>② A를 곱한 직후</small>${col(ax,ay)}</div><div><small>③ 길이 ${norm.toFixed(6)}로 나눈 vₖ</small>${col(current.x,current.y)}</div></div><p>곱셈은 방향과 길이를 바꿀 수 있습니다. 정규화는 길이만 다시 1로 맞추며 방향은 그대로 둡니다.</p>`}
document.getElementById('power-component-values').innerHTML=`<p>현재 vₖ = αₖq₁ + βₖq₂에서 αₖ = ${fmt(current.alpha)}, βₖ = ${fmt(current.beta)}입니다.</p><p>레일리 몫은 vₖᵀAvₖ / (vₖᵀvₖ) = ${current.rayleigh.toFixed(6)}입니다. 이 예에서는 큰 고유방향으로 수렴할 때 3에 접근합니다.</p>`;
}
function drawAll(){try{draw()}catch(e){throw e;}}
function move(delta){const slider=document.getElementById('power-iteration');slider.value=Math.min(N,Math.max(0,Number(slider.value)+delta));drawAll()}
document.getElementById('power-angle').addEventListener('input',()=>{document.getElementById('power-iteration').value=0;drawAll()});document.getElementById('power-iteration').addEventListener('input',drawAll);document.getElementById('power-back').addEventListener('click',()=>move(-1));document.getElementById('power-next').addEventListener('click',()=>move(1));document.getElementById('power-reset').addEventListener('click',()=>{document.getElementById('power-iteration').value=0;drawAll()});document.querySelectorAll('[data-power-angle]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('power-angle').value=button.getAttribute('data-power-angle');document.getElementById('power-iteration').value=0;drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
