import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{
const get=id=>document.getElementById('int-'+id),input=get('angle');if(!input)return;

const mq=window.matchMedia('(max-width:600px)');
const fmt=n=>(Math.abs(n)<.000005?0:n).toFixed(5).replace('-','−');
function matrix(rows){return '<span class="math-array" role="math" aria-label="'+rows.map(r=>r.map(fmt).join(', ')).join('; ')+'"><span class="math-cells" aria-hidden="true">'+rows.map(r=>'<span class="math-row">'+r.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>').join('')+'</span></span>'}

get('model').innerHTML='T = '+matrix([[1,-.2],[-.2,1]])+' V = '+matrix([[-2,0],[0,-1]])+' G = '+matrix([[1,.4],[.4,1]]);
function draw(){const theta=Number(input.value)*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta),a=c*c,b=s*s,t=1-.4*c*s,v=-2*a-b,h=t+v,parts=[a*a,.8*a*b,b*b],j=parts.reduce((x,y)=>x+y,0);get('angle-value').textContent=input.value+'°';for(const[k,n]of Object.entries({t,v,h,j,energy:2*h+j}))get(k).textContent=fmt(n);get('status').textContent='지점 밀도 A = '+fmt(a)+', B = '+fmt(b)+'입니다. 밀도를 옮기면 핵 인력과 반발이 함께 달라집니다.';
const small=mq.matches,W=small?360:680,H=small?340:290,x=small?115:210,bw=small?210:400;let z='';const bars=[['A 밀도',a,'var(--n)'],['B 밀도',b,'var(--beta)'],['AA 반발',parts[0],'var(--alpha)'],['AB+BA 반발',parts[1],'var(--alpha)'],['BB 반발',parts[2],'var(--alpha)']];bars.forEach((r,i)=>{const y=35+i*(small?58:47);z+='<text x="'+(x-10)+'" y="'+(y+15)+'" text-anchor="end" fill="var(--ink)" font-size="13">'+r[0]+'</text><rect x="'+x+'" y="'+y+'" width="'+bw+'" height="23" rx="3" fill="var(--code)"/><rect x="'+x+'" y="'+y+'" width="'+Math.max(0,bw*r[1])+'" height="23" rx="3" fill="'+r[2]+'"/><text x="'+x+'" y="'+(y+40)+'" fill="var(--ink2)" font-size="12">'+fmt(r[1])+'</text>'});get('density-fig').setAttribute('viewBox','0 0 '+W+' '+H);get('density-fig').innerHTML=z;}
function drawAll(){try{draw()}catch(e){throw e;}}input.addEventListener('input',drawAll);mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
