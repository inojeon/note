import { createScope, addReset } from 'experiment-shared.js';
export function mount(root, context) {
 const scope=createScope(root,context); const {document,window}=scope;
 try {
 const get=id=>document.getElementById('bt-'+id),names=['A','B','C'],energies=[0,1,3];
 function render(){const selected=get('pair').value.split(',').map(Number),other=[0,1,2].find(i=>!selected.includes(i)),leak=Number(get('leak').value)/100,p=[0,0,0];p[selected[0]]=.36*(1-leak);p[selected[1]]=.64*(1-leak);p[other]=leak;
 get('leak-value').textContent=(100*leak).toFixed(0)+'%';get('probabilities').innerHTML=p.map((x,i)=>'<tr><th>'+names[i]+'</th><td>'+energies[i]+'</td><td>'+(100*x).toFixed(1)+'%</td></tr>').join('');get('probabilities').dataset.values=JSON.stringify(p);get('omitted').textContent='제외한 상태: '+names[other];get('basis').textContent='기저 순서: '+selected.map(i=>names[i]).join(', ');get('matrix').textContent='H = [['+energies[selected[0]]+', 0], [0, '+energies[selected[1]]+']]';get('retained').textContent=(100*(1-leak)).toFixed(1)+'%';get('retained').dataset.value=1-leak;get('energy').textContent=p.reduce((s,x,i)=>s+x*energies[i],0).toFixed(4);get('summary').textContent=leak?'두 성분만으로 표현한 확률 합이 1보다 작습니다. 공간 안의 36:64는 남아 있는 경우에 조건을 둔 비율입니다.':'전체 확률이 선택한 공간에 있습니다. 두 기준의 계수 3/5, 4/5만으로 표현할 수 있습니다.';
 }
 get('pair').addEventListener('change',render);get('leak').addEventListener('input',render);document.querySelectorAll('[data-bt-leak]').forEach(b=>b.addEventListener('click',()=>{get('leak').value=b.dataset.btLeak;render()}));render();
 addReset(root,context.signal);return scope.lifecycle;
 } catch(error){scope.lifecycle.destroy();throw error;}
}
