import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{
const get=id=>document.getElementById('hme-'+id),input=get('replacements');if(!input)return;

const mq=window.matchMedia('(max-width:600px)');
const fmt=n=>(Math.abs(n)<.000005?0:n).toFixed(5).replace('-','−');
function matrix(rows){return '<span class="math-array" role="math" aria-label="'+rows.map(r=>r.map(fmt).join(', ')).join('; ')+'"><span class="math-cells" aria-hidden="true">'+rows.map(r=>'<span class="math-row">'+r.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>').join('')+'</span></span>'}

const ref=[0,1,2],targets=[[0,1,2],[1,2,3],[2,3,4],[3,4,5]],pairs=[];for(let p=0;p<6;p++)for(let q=p+1;q<6;q++)pairs.push([p,q]);
function anti(p,q,r,s){if(p===q||r===s)return 0;const sign=(p<q?1:-1)*(r<s?1:-1),a=[Math.min(p,q),Math.max(p,q)],b=[Math.min(r,s),Math.max(r,s)],u=pairs.findIndex(x=>x[0]===a[0]&&x[1]===a[1]),v=pairs.findIndex(x=>x[0]===b[0]&&x[1]===b[1]);return sign*(u===v?.3+.02*(a[0]+a[1]):.04/(1+Math.abs(u-v)))}
const h=(p,q)=>p===q?-1+.3*p:.12/(1+Math.abs(p-q));
function draw(){const k=Number(input.value),target=targets[k];let one=0,two=0;if(k===0){one=ref.reduce((s,i)=>s+h(i,i),0);for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)two+=anti(ref[i],ref[j],ref[i],ref[j])}if(k===1){one=h(3,0);two=anti(3,1,0,1)+anti(3,2,0,2)}if(k===2)two=anti(3,4,0,1);get('count').textContent=k;get('one').textContent=fmt(one);get('two').textContent=fmt(two);get('total').textContent=fmt(one+two);get('status').textContent=['대각 성분입니다. 1전자와 2전자 에너지가 함께 기여합니다.','단일 치환입니다. 1전자 항과 공통 점유 전자를 포함한 2전자 항이 모두 기여합니다.','이중 치환입니다. 1전자 항은 0이고 2전자 항만 직접 연결합니다.','삼중 치환입니다. 1전자 항과 2전자 항 모두 직접 연결할 수 없어 정확히 0입니다.'][k];
const small=mq.matches,W=small?360:680,H=270,start=small?45:100,step=small?54:96;let z='';for(const[row,occ]of [[0,ref],[1,target]]){const y=85+row*120;z+='<text x="16" y="'+(y-37)+'" fill="var(--ink)" font-size="14">'+(row===0?'기준 D₀: 1, 2, 3':'선택 D'+k+': '+occ.map(i=>i+1).join(', '))+'</text>';for(let i=0;i<6;i++)z+='<circle cx="'+(start+i*step)+'" cy="'+y+'" r="17" fill="'+(occ.includes(i)?'var(--n)':'var(--panel)')+'" stroke="var(--n)" stroke-width="2"/><text x="'+(start+i*step)+'" y="'+(y+5)+'" text-anchor="middle" fill="'+(occ.includes(i)?'var(--panel)':'var(--ink)')+'" font-size="14">'+(i+1)+'</text>'}z+='<text x="16" y="260" fill="var(--ink2)" font-size="12">채운 원 = 전자 1개 점유 · 빈 원 = 비점유</text>';get('occupations-fig').setAttribute('viewBox','0 0 '+W+' '+H);get('occupations-fig').innerHTML=z;}
function drawAll(){try{draw()}catch(e){throw e;}}input.addEventListener('input',drawAll);mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
