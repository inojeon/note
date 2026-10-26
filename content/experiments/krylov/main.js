import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
const A=[[2,1,0],[1,2,1],[0,1,2]],starts={full:[1,0,0],plane:[0,1,0],eigen:[Math.SQRT1_2,0,-Math.SQRT1_2]};let selected='full';
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0),mv=v=>A.map(row=>dot(row,v)),norm=v=>Math.hypot(...v);
function fmt(n){return (Math.abs(n)<.00005?0:n).toFixed(4)}
function matrix(rows){return `<span class="math-array" role="math" aria-label="${rows.map(row=>row.map(fmt).join(', ')).join('; ')}"><span class="math-cells" aria-hidden="true">${rows.map((row,i)=>`<span class="math-row">${row.map((v,j)=>`<span class="${rows.length===row.length&&Math.abs(i-j)>1?'krylov-far':''}">${fmt(v)}</span>`).join('')}</span>`).join('')}</span></span>`}
const col=v=>matrix(v.map(x=>[x]));
function lanczos(v){const basis=[v.slice()],steps=[];let previous=[0,0,0],betaPrev=0;for(let j=0;j<3;j++){const q=basis[j],aq=mv(q),alpha=dot(q,aq);let r=aq.map((x,i)=>x-alpha*q[i]-betaPrev*previous[i]);for(let pass=0;pass<2;pass++)for(const old of basis){const coeff=dot(old,r);r=r.map((x,i)=>x-coeff*old[i])}const beta=norm(r);steps.push({aq,alpha,beta,betaPrev,r});if(beta<1e-10||j===2)break;basis.push(r.map(x=>x/beta));previous=q;betaPrev=beta}return {basis,steps}}
function minimumEigenvalue(T){const B=T.map(row=>row.slice()),n=B.length;for(let k=0;k<40;k++){let p=0,q=0,max=0;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.abs(B[i][j])>max){max=Math.abs(B[i][j]);p=i;q=j}if(max<1e-13)break;const a=B[p][p],b=B[p][q],d=B[q][q],t=.5*Math.atan2(2*b,d-a),c=Math.cos(t),s=Math.sin(t);for(let i=0;i<n;i++)if(i!==p&&i!==q){const ip=B[i][p],iq=B[i][q];B[i][p]=B[p][i]=c*ip-s*iq;B[i][q]=B[q][i]=s*ip+c*iq}B[p][p]=c*c*a-2*s*c*b+s*s*d;B[q][q]=s*s*a+2*s*c*b+c*c*d;B[p][q]=B[q][p]=0}return Math.min(...B.map((row,i)=>row[i]))}
function draw(){
const v=starts[selected],result=lanczos(v),max=result.basis.length,slider=document.getElementById('krylov-step');slider.max=max;if(Number(slider.value)>max)slider.value=max;const m=Number(slider.value),basis=result.basis.slice(0,m),Q=[0,1,2].map(i=>basis.map(q=>q[i])),T=basis.map(q=>basis.map(r=>dot(q,mv(r)))),estimate=minimumEigenvalue(T),exact=2-Math.SQRT2,step=result.steps[m-1];
const raw=[v.slice()];for(let j=1;j<m;j++)raw.push(mv(raw[j-1]));
document.getElementById('krylov-start-value').innerHTML=`시작 단위 벡터 v = ${col(v)}`;document.getElementById('krylov-step-value').textContent=m+'개';document.getElementById('krylov-back').disabled=m===1;document.getElementById('krylov-next').disabled=m===max;document.getElementById('krylov-reset').disabled=m===1;
document.querySelectorAll('[data-krylov-start]').forEach(button=>button.setAttribute('aria-pressed',String(button.getAttribute('data-krylov-start')===selected)));
let message=m===1?'현재는 시작 벡터 한 방향, 즉 직선입니다.':'현재 크릴로프 공간의 차원은 '+m+'입니다.';
if(m===max){if(max===3)message+=' 세 독립 방향을 모아 전체 3차원 공간에 도달했습니다.';else message+=' 새 방향의 길이 β가 0이므로 여기서 멈춥니다. 같은 행렬을 더 곱해도 공간은 커지지 않습니다.'}else message+=' 다음 단계에서 이미 있는 방향의 성분을 빼고 새 방향을 얻습니다.';
document.getElementById('krylov-message').textContent=message;
document.getElementById('krylov-matrices').innerHTML=`<div><strong>기저를 열로 모은 Q · 3×${m}</strong>${matrix(Q)}</div><div><strong>작은 행렬 T = QᵀAQ · ${m}×${m}</strong>${matrix(T)}<small>주대각선과 양옆 대각선만 남습니다.</small></div>`;
document.getElementById('krylov-eigenvalue').innerHTML=`<p>현재 T의 최소 고유값: <strong>${estimate.toFixed(6)}</strong><br>전체 A의 최소 고유값: ${exact.toFixed(6)}<br>차이: ${(Math.abs(estimate-exact)<1e-12?0:estimate-exact).toFixed(6)}</p>`+(selected==='eigen'?'<p>현재 공간은 고유값 2의 방향만 포함합니다. 이 값이 정확한 고유값이어도, 전체의 최소 고유값을 찾은 것은 아닙니다.</p>':'');
document.getElementById('krylov-recurrence').innerHTML=`<p>다음 방향의 후보를 r = Aqₘ − αₘqₘ − βₘ₋₁qₘ₋₁로 계산합니다. 첫 단계의 이전 벡터 항은 0입니다.</p><div class="krylov-recurrence-values"><span>Aqₘ = ${col(step.aq)}</span><span>r = ${col(step.r)}</span></div><p>αₘ = qₘᵀAqₘ = ${fmt(step.alpha)}, βₘ = ‖r‖ = ${fmt(step.beta)}.</p>`+(step.beta<1e-10?'<p>r이 0이어서 더 추가할 방향이 없습니다.</p>':`<p>r을 그 길이로 나누면 다음 단위 기저 q${m+1}을 얻습니다. ${m<max?'‘다음 방향 추가’를 누르면 확인할 수 있습니다.':''}</p>`)+'<p class="meta">이 실험은 반올림 오차를 줄이기 위해 이전 기저 성분을 다시 제거하는 재직교화도 수행합니다.</p>';
document.getElementById('krylov-raw-values').innerHTML=raw.map((v,i)=>`<div><span>${i===0?'v':i===1?'Av':'A²v'} = </span>${col(v)}</div>`).join('');
const small=narrow(),W=small?360:680,H=small?660:330,pw=small?360:340;
function panel(ox,oy,orthogonal){const cx=ox+pw/2,cy=oy+180,scale=72,project=v=>[cx+scale*(v[0]+v[1])*Math.SQRT1_2,cy+scale*(v[0]-v[1]-v[2])/Math.sqrt(3)];let z=`<text x="${ox+pw/2}" y="${oy+24}" text-anchor="middle" fill="var(--ink)" font-size="15">${orthogonal?'② 랑초스 정규직교 기저':'① 반복 벡터가 만드는 공간'}</text>`;
function path(points,color,dashed=false){return `<path d="${points.map((v,i)=>`${i?'L':'M'} ${project(v).join(' ')}`).join(' ')}" fill="none" stroke="var(${color})" ${dashed?'stroke-dasharray="4 4"':''}/>`}
if(m===1){z+=path([basis[0].map(x=>-1.6*x),basis[0].map(x=>1.6*x)],'--line')}
if(m===2){const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>basis[0].map((x,i)=>1.1*(a*x+b*basis[1][i])));z+=`<polygon points="${corners.map(p=>project(p).join(',')).join(' ')}" fill="var(--beta-soft)" fill-opacity=".6" stroke="var(--beta)"/>`}
if(m===3){for(let axis=0;axis<3;axis++)for(const a of [-1,1])for(const b of [-1,1]){const rest=[0,1,2].filter(i=>i!==axis),u=[0,0,0],v=[0,0,0];u[axis]=-1.1;v[axis]=1.1;u[rest[0]]=v[rest[0]]=a*1.1;u[rest[1]]=v[rest[1]]=b*1.1;z+=path([u,v],'--line',true)}}
for(let axis=0;axis<3;axis++){const v=[0,0,0];v[axis]=1.65;z+=path([[0,0,0],v],'--ink2',true);const [px,py]=project(v);z+=`<text x="${px+4}" y="${py-4}" fill="var(--ink2)" font-size="11">${['x','y','z'][axis]}</text>`}
const vectors=orthogonal?basis:raw.map(v=>v.map(x=>x/norm(v))),colors=['--n','--beta','--alpha'];vectors.forEach((v,j)=>{const [px,py]=project(v),a=Math.atan2(py-cy,px-cx),l=8;z+=`<path d="M ${cx} ${cy} L ${px} ${py} M ${px-l*Math.cos(a-.4)} ${py-l*Math.sin(a-.4)} L ${px} ${py} L ${px-l*Math.cos(a+.4)} ${py-l*Math.sin(a+.4)}" fill="none" stroke="var(${colors[j]})" stroke-width="2.5"/><text x="${px+7}" y="${py-7-j*3}" fill="var(${colors[j]})" font-size="12">${orthogonal?'q'+(j+1):['v','Av','A²v'][j]}</text>`});
z+=`<text x="${cx}" y="${oy+315}" text-anchor="middle" fill="var(--ink2)" font-size="12">${['','1차원 직선','2차원 평면','3차원 전체 공간'][m]}</text>`;return z;
}
const svg=document.getElementById('krylov-space-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=panel(0,0,false)+panel(small?0:340,small?330:0,true);
}
function drawAll(){try{draw()}catch(e){throw e;}}
function move(delta){const el=document.getElementById('krylov-step');el.value=Math.min(Number(el.max),Math.max(1,Number(el.value)+delta));drawAll()}
document.getElementById('krylov-step').addEventListener('input',drawAll);document.getElementById('krylov-back').addEventListener('click',()=>move(-1));document.getElementById('krylov-next').addEventListener('click',()=>move(1));document.getElementById('krylov-reset').addEventListener('click',()=>{document.getElementById('krylov-step').value=1;drawAll()});document.querySelectorAll('[data-krylov-start]').forEach(button=>button.addEventListener('click',()=>{selected=button.getAttribute('data-krylov-start');document.getElementById('krylov-step').value=1;drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
