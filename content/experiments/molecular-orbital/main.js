import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
'use strict';

const el=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)'),distance=el('mo-distance');let mode=1,rephase=false;
const gaussian=(x,center)=>Math.pow(Math.PI,-.25)*Math.exp(-(x-center)*(x-center)/2);
function draw(){
 const R=Number(distance.value),S=Math.exp(-R*R/4),N=1/Math.sqrt(2*(1+mode*S)),bSign=rephase?-1:1,cb=mode*bSign*N,centerDensity=mode===1?4*N*N*gaussian(0,-R/2)**2:0;
 el('mo-distance-value').textContent=R.toFixed(1);el('mo-plus').setAttribute('aria-pressed',String(mode===1));el('mo-minus').setAttribute('aria-pressed',String(mode===-1));el('mo-rephase').setAttribute('aria-pressed',String(rephase));
 el('mo-overlap').textContent=(bSign*S).toFixed(6).replace('-','−');el('mo-overlap').setAttribute('data-value',bSign*S);el('mo-central-density').textContent=centerDensity.toFixed(6);el('mo-central-density').setAttribute('data-value',centerDensity);el('mo-norm').textContent='1.000000';el('mo-norm').setAttribute('data-value',1);el('mo-expansion').setAttribute('data-coefficient-a',N);el('mo-expansion').setAttribute('data-coefficient-b',cb);
 const basis=rephase?'\\chi_B^\\prime':'\\chi_B',formula='\\psi_'+(mode===1?'+':'-')+'\\approx '+N.toFixed(4)+'\\chi_A'+(cb<0?'-':'+')+Math.abs(cb).toFixed(4)+basis;el('mo-expansion').innerHTML='<span class="math-tex" data-tex="'+formula+'">분자 오비탈 ≈ '+N.toFixed(4)+' χA '+(cb<0?'−':'+')+' '+Math.abs(cb).toFixed(4)+(rephase?' χB′':' χB')+'</span>';
 const w=mq.matches?360:600,h=mq.matches?490:450,left=45,right=w-16,domain=5.5,xp=x=>left+(x+domain)/(2*domain)*(right-left),plot=el('mo-combination-fig');plot.setAttribute('viewBox','0 0 '+w+' '+h);
 let svg='<title>'+(mode===1?'대칭':'반대칭')+' 분자 오비탈. 거리 '+R.toFixed(1)+', 중앙 밀도 '+centerDensity.toFixed(4)+'</title><g font-family="system-ui,sans-serif" fill="var(--ink)" font-size="13">';
 function panel(top,height,density){const low=density?0:-.85,high=density?.9:.95,yp=y=>top+height-(y-low)/(high-low)*height;svg+='<text x="'+left+'" y="'+(top-15)+'" font-size="15">'+(density?'확률 밀도 |ψ|²':'진폭 ψ · A/B는 점선')+'</text><line x1="'+left+'" y1="'+yp(0)+'" x2="'+right+'" y2="'+yp(0)+'" stroke="var(--line)"/>';[-4,-2,0,2,4].forEach(x=>svg+='<text x="'+xp(x)+'" y="'+(top+height+18)+'" text-anchor="middle">'+x+'</text>');[-R/2,R/2].forEach((x,i)=>{svg+='<line x1="'+xp(x)+'" y1="'+top+'" x2="'+xp(x)+'" y2="'+(top+height)+'" stroke="var(--line)" stroke-dasharray="3 4"/><text x="'+xp(x)+'" y="'+(top+height+36)+'" text-anchor="middle">'+(i?'B':'A')+'</text>'});
 const curves=density?[['--beta','',x=>(N*(gaussian(x,-R/2)+mode*gaussian(x,R/2)))**2]]:[['--n','4 4',x=>gaussian(x,-R/2)],['--alpha','4 4',x=>bSign*gaussian(x,R/2)],['--beta','',x=>N*(gaussian(x,-R/2)+mode*gaussian(x,R/2))]];
 curves.forEach(([color,dash,fn])=>{let d='';for(let i=0;i<=220;i++){const x=-domain+2*domain*i/220;d+=(i?'L':'M')+xp(x).toFixed(2)+','+yp(fn(x)).toFixed(2)}svg+='<path d="'+d+'" fill="none" stroke="var('+color+')" stroke-width="'+(dash?1.7:3)+'" stroke-dasharray="'+dash+'"/>'});svg+='<text x="'+(left-8)+'" y="'+(yp(0)+5)+'" text-anchor="end">0</text><text x="'+right+'" y="'+(top+height+36)+'" text-anchor="end">x</text>'}
 const ph=mq.matches?145:130;panel(40,ph,false);panel(mq.matches?280:260,ph,true);plot.innerHTML=svg+'</g>';
 el('mo-status').textContent=(mode===1?'대칭 조합은 중앙에 진폭과 밀도가 남습니다.':'반대칭 조합은 중앙에 마디가 있어 밀도가 0입니다.')+(rephase?' B 기저의 부호와 계수를 함께 바꿨으므로 실선 ψ와 밀도는 바뀌지 않습니다.':' 정규화에는 두 함수의 겹침이 들어갑니다.');
}
function drawAll(){try{draw()}catch(e){throw e;}}distance.addEventListener('input',drawAll);el('mo-plus').addEventListener('click',()=>{mode=1;drawAll()});el('mo-minus').addEventListener('click',()=>{mode=-1;drawAll()});el('mo-rephase').addEventListener('click',()=>{rephase=!rephase;drawAll()});mq.addEventListener('change',drawAll);drawAll();

})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
