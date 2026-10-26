import { controls, fmt, chart, loadJSON } from 'experiment-shared.js';
export async function mount(root,context){
const $=s=>root.querySelector(s);
const u=await loadJSON(context,'ucj.json'),c=await loadJSON(context,'circuit.json');function render(){const name=$('#circuit').value,reps=Number($('#reps').value),shots=Number($('#shots').value),r=u.rows.find(x=>x.circuit===name&&x.n_reps===reps),s=c.sqd.find(x=>x.circuit===name&&x.shots===shots);$('[data-params]').textContent=r.n_params;$('[data-init]').textContent=fmt(r.err_init_mHa,3)+' mEh';$('[data-depth]').textContent=c.circuits[name].depth+' (1회 회로)';$('[data-error]').textContent=fmt(s.err_mHa,3)+' mEh (1회 회로)';chart($('[data-plot]'),[{points:u.rows.filter(x=>x.circuit===name).map(x=>[x.n_reps,x.err_init_mHa]),point:[reps,r.err_init_mHa]}],{xmin:1,xmax:2,xlabel:'반복 횟수 (최적화 전 초기값)',title:'매개변수를 늘려도 초기 에너지가 반드시 내려가지는 않습니다.'});}controls(root,context.signal,render);
}
