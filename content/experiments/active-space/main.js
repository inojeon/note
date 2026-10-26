import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
const el=id=>document.getElementById('cas-'+id),mq=window.matchMedia('(max-width:600px)');function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-k+i)/i;return Math.round(v)}
function draw(){const no=Number(el('orbitals').value);let ne=Math.min(Number(el('electrons').value),2*no);el('electrons').max=String(Math.min(8,2*no));el('electrons').value=String(ne);const fixed=choose(no,ne/2)**2,all=choose(2*no,ne);el('orbitals-value').textContent=no;el('electrons-value').textContent=ne;el('label').textContent='CAS('+ne+', '+no+')';el('fixed').textContent=fixed;el('all').textContent=all;
const w=mq.matches?360:680,h=mq.matches?340:230;let svg='<title>활성 오비탈 '+no+'개와 고정 점유 영역</title>';const groups=[['비활성: 1개',1,'↑↓','--ink2'],['활성: '+no+'개',no,'','--n'],['외부 가상: 2개',2,'비어 있음','--beta']];groups.forEach((g,i)=>{const x=mq.matches?20:18+i*(w/3),y=mq.matches?25+i*105:30,gw=mq.matches?320:w/3-30;svg+='<text x="'+x+'" y="'+y+'" fill="var('+g[3]+')" font-size="15">'+g[0]+'</text>';const step=Math.min(35,gw/g[1]);for(let j=0;j<g[1];j++){const xx=x+j*step;svg+='<path d="M'+xx+' '+(y+45)+'h'+(step-5)+'" stroke="var('+g[3]+')" stroke-width="3"/>'}svg+='<text x="'+x+'" y="'+(y+72)+'" fill="var(--ink2)" font-size="13">'+(i===1?ne+'전자 · 점유 변화 허용':g[2])+'</text>'});el('orbitals-fig').setAttribute('viewBox','0 0 '+w+' '+h);el('orbitals-fig').innerHTML=svg;el('status').textContent='전체 전자 '+(ne+2)+'개, 전체 공간 오비탈 '+(no+3)+'개 중 활성 부분을 계산합니다. α·β 각각 '+ne/2+'개인 활성 구역에는 '+fixed+'개의 행렬식이 있습니다.';}
function drawAll(){try{draw()}catch(e){throw e;}}for(const id of ['orbitals','electrons'])el(id).addEventListener('input',drawAll);mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
