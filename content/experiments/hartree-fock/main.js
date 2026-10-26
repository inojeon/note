import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{
const get=id=>document.getElementById('hf-'+id),input=get('start');if(!input)return;

const mq=window.matchMedia('(max-width:600px)');
const fmt=n=>(Math.abs(n)<.000005?0:n).toFixed(5).replace('-','−');
function matrix(rows){return '<span class="math-array" role="math" aria-label="'+rows.map(r=>r.map(fmt).join(', ')).join('; ')+'"><span class="math-cells" aria-hidden="true">'+rows.map(r=>'<span class="math-row">'+r.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>').join('')+'</span></span>'}

const h=[[-1,-.15],[-.15,-.4]],G=[[.7,.2],[.2,.7]];let angle=0,iterations=0,history=[];
function compute(t){const c=[Math.cos(t),Math.sin(t)],P=c.map(a=>c.map(b=>2*a*b)),J=P.map((row,i)=>row.map((_,j)=>i===j?P[0][0]*G[i][0]+P[1][1]*G[i][1]:0)),K=P.map((row,i)=>row.map((v,j)=>v*G[i][j])),F=h.map((row,i)=>row.map((v,j)=>v+J[i][j]-.5*K[i][j])),epsilon=(F[0][0]+F[1][1])/2-Math.hypot((F[0][0]-F[1][1])/2,F[0][1]),nextAngle=Math.atan2(F[0][0]-epsilon,-F[0][1]),next=[Math.cos(nextAngle),Math.sin(nextAngle)],nextP=next.map(a=>next.map(b=>2*a*b));let energy=0,residual2=0;for(let i=0;i<2;i++)for(let j=0;j<2;j++){energy+=P[i][j]*(h[i][j]+.5*(F[i][j]-h[i][j]));residual2+=(nextP[i][j]-P[i][j])**2}return{c,P,F,next,epsilon,nextAngle,energy,residual:Math.sqrt(residual2)}}
function draw(){const d=compute(angle);const row={iteration:iterations,input:d.P[0][0],output:2*d.next[0]*d.next[0],energy:d.energy,residual:d.residual};if(history.at(-1)?.iteration===iterations)history[history.length-1]=row;else history.push(row);get('density-change').textContent='A 지점 전자 수: 입력 '+fmt(row.input)+' → 출력 '+fmt(row.output)+' · B 지점: '+fmt(2-row.input)+' → '+fmt(2-row.output)+' (합은 각각 2)';get('history').innerHTML=history.slice(-12).map(r=>'<tr><td>'+r.iteration+'</td><td>'+fmt(r.input)+'</td><td>'+fmt(r.output)+'</td><td>'+fmt(r.energy)+'</td><td>'+r.residual.toExponential(2)+'</td></tr>').join('');get('residual').dataset.value=d.residual;get('energy').dataset.value=d.energy;get('density-change').dataset.inputA=row.input;get('density-change').dataset.outputA=row.output;get('start-value').textContent=input.value+'°';get('iteration').textContent='SCF 업데이트 '+iterations+'회 · 현재 밀도로 만든 방정식의 출력을 비교합니다.';get('density').innerHTML=matrix(d.P);get('fock').innerHTML=matrix(d.F);get('current').innerHTML=matrix(d.c.map(v=>[v]));get('next').innerHTML=matrix(d.next.map(v=>[v]));get('energy').textContent=fmt(d.energy);get('epsilon').textContent=fmt(d.epsilon);get('angle').textContent=(angle*180/Math.PI).toFixed(5)+'°';get('residual').textContent=d.residual<.00001?d.residual.toExponential(3):fmt(d.residual);get('status').textContent=d.residual<1e-10?'입력과 출력 밀도가 정해 둔 허용 오차 안에서 같습니다. 이 RHF 모형의 자기일관 해입니다.':'입력과 출력 밀도가 다릅니다. 다음 단계에서는 출력 오비탈을 점유시켜 밀도를 다시 만듭니다.';
const small=mq.matches,W=small?360:680,H=small?350:150,labels=['현재 밀도 P','폭 행렬 F[P]','최저 오비탈 c′','출력 밀도 P′'];let z='';labels.forEach((s,i)=>{const x=small?50:10+i*170,y=small?10+i*85:40,bw=small?260:150;z+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="46" rx="8" fill="var(--code)" stroke="var(--line)"/><text x="'+(x+bw/2)+'" y="'+(y+28)+'" text-anchor="middle" fill="var(--ink)" font-size="13">'+s+'</text>';if(i<3)z+='<text x="'+(small?180:x+bw+9)+'" y="'+(small?y+73:y+29)+'" text-anchor="middle" fill="var(--accent)" font-size="20">'+(small?'↓':'→')+'</text>'});get('cycle-fig').setAttribute('viewBox','0 0 '+W+' '+H);get('cycle-fig').innerHTML=z;}
function drawAll(){try{draw()}catch(e){throw e;}}function reset(){angle=Number(input.value)*Math.PI/180;iterations=0;history=[];drawAll()}input.addEventListener('input',reset);get('reset').addEventListener('click',reset);get('step').addEventListener('click',()=>{angle=compute(angle).nextAngle;iterations++;drawAll()});get('converge').addEventListener('click',()=>{for(let i=0;i<100;i++){const d=compute(angle);if(d.residual<1e-10)break;angle=d.nextAngle;iterations++;const next=compute(angle);history.push({iteration:iterations,input:next.P[0][0],output:2*next.next[0]*next.next[0],energy:next.energy,residual:next.residual})}drawAll()});mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
