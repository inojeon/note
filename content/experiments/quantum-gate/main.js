import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const el=id=>document.getElementById(id),s=Math.SQRT1_2,states={'0':[[1,0],[0,0]],'1':[[0,0],[1,0]],plus:[[s,0],[s,0]],minus:[[s,0],[-s,0]],plusi:[[s,0],[0,s]]},gates={X:[[0,1],[1,0]],Z:[[1,0],[0,-1]],H:[[s,s],[s,-s]]};
const f=x=>(Math.abs(x)<.0000001?0:x).toFixed(4);function complex(z){return Math.abs(z[1])<1e-9?f(z[0]):Math.abs(z[0])<1e-9?f(z[1])+'i':f(z[0])+(z[1]<0?' − ':' + ')+f(Math.abs(z[1]))+'i'}
function array(rows){return '<span class="math-array" role="math"><span class="math-cells" aria-hidden="true">'+rows.map(row=>'<span class="math-row">'+row.map(x=>'<span>'+x+'</span>').join('')+'</span>').join('')+'</span></span>'}
function draw(){const input=states[el('bg-input').value]||states['0'],key=el('bg-gate').value||'X',m=gates[key]||gates.X,apply=v=>m.map(row=>[row[0]*v[0][0]+row[1]*v[1][0],row[0]*v[0][1]+row[1]*v[1][1]]),first=apply(input),out=el('bg-times').value==='2'?apply(first):first,norm=v=>v.reduce((a,z)=>a+z[0]**2+z[1]**2,0);el('bg-first').textContent='한 번 적용한 중간 진폭: ('+first.map(complex).join(', ')+')';el('bg-in-vector').innerHTML=array(input.map(z=>[complex(z)]));el('bg-out-vector').innerHTML=array(out.map(z=>[complex(z)]));el('bg-matrix').innerHTML=array(m.map(row=>row.map(f)));el('bg-gate-name').textContent=key==='H'?'H_gate · 하다마드':'게이트 '+key;el('bg-p0').textContent=(100*norm([out[0]])).toFixed(2)+'%';el('bg-p1').textContent=(100*norm([out[1]])).toFixed(2)+'%';el('bg-in-norm').textContent=f(norm(input));el('bg-out-norm').textContent=f(norm(out));el('bg-out-vector').dataset.values=JSON.stringify(out);el('bg-status').textContent=el('bg-times').value==='2'?'X², Z², H_gate²는 모두 I입니다. 중간에 측정하지 않고 두 번 적용해 원래 입력으로 돌아왔습니다.':key==='Z'?'Z는 둘째 성분의 부호를 바꾸지만, 0·1 측정 확률은 바꾸지 않습니다. + 입력에서는 − 상태가 되어 다른 측정 기저에서 차이가 드러납니다.':key==='X'?'X는 두 성분을 교환합니다. 0 입력이면 1 출력, 1 입력이면 0 출력입니다.':'하다마드는 0을 +로, 1을 −로 바꿉니다. + 입력에 적용하면 0 상태로 돌아옵니다.';}
el('bg-times').addEventListener('change',draw);el('bg-input').addEventListener('change',draw);el('bg-gate').addEventListener('change',draw);draw();})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
