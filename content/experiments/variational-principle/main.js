import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{
const get=id=>document.getElementById('var-'+id),angleInput=get('angle'),scaleInput=get('scale');if(!angleInput||!scaleInput)return;

const mq=window.matchMedia('(max-width:600px)');
const fmt=n=>(Math.abs(n)<.000005?0:n).toFixed(5).replace('-','−');
function matrix(rows){return '<span class="math-array" role="math" aria-label="'+rows.map(r=>r.map(fmt).join(', ')).join('; ')+'"><span class="math-cells" aria-hidden="true">'+rows.map(r=>'<span class="math-row">'+r.map(n=>'<span>'+fmt(n)+'</span>').join('')+'</span>').join('')+'</span></span>'}

const delta=Math.hypot(.2,.5),e0=1-delta,bestAngle=Math.atan2((.8-e0)/.5,1);let angle=0,mode='basis';get('h').innerHTML='H = '+matrix([[.8,-.5],[-.5,1.2]]);const energyAt=t=>.8*Math.cos(t)**2-Math.cos(t)*Math.sin(t)+1.2*Math.sin(t)**2;
function draw(){const s=Number(scaleInput.value),e=energyAt(angle),norm=s*s,numerator=norm*e;get('angle-value').textContent=(angle*180/Math.PI).toFixed(3)+'°';get('scale-value').textContent=fmt(s);for(const[k,n]of Object.entries({norm,numerator,energy:e,gap:Math.max(0,e-e0)}))get(k).textContent=fmt(n);get('basis').setAttribute('aria-pressed',String(mode==='basis'));get('best').setAttribute('aria-pressed',String(mode==='best'));get('status').textContent=(mode==='basis'?'첫째 기저만 허용한 공간의 에너지입니다.':mode==='best'?'두 기저를 허용한 모형의 정확한 바닥상태입니다.':'두 기저의 혼합을 탐색하고 있습니다.')+' 정확한 모형 E₀ = '+fmt(e0)+'. '+(numerator<e0?'분자는 E₀보다 작지만, 정규화한 에너지는 상계를 지킵니다.':'배율 s를 바꾸어도 정규화한 에너지는 같습니다.');
const small=mq.matches,W=small?360:680,H=310,L=50,R=W-22,T=25,B=260,x=t=>L+(t+Math.PI/2)/Math.PI*(R-L),y=e=>B-e/1.65*(B-T);let path='';for(let i=0;i<=180;i++){const t=(-90+i)*Math.PI/180;path+=(i?'L':'M')+x(t)+' '+y(energyAt(t))}let z='<path d="M'+L+' '+T+'V'+B+'H'+R+'" fill="none" stroke="var(--line)"/><line x1="'+L+'" y1="'+y(e0)+'" x2="'+R+'" y2="'+y(e0)+'" stroke="var(--beta)" stroke-dasharray="6 4"/><path d="'+path+'" fill="none" stroke="var(--n)" stroke-width="3"/><circle cx="'+x(angle)+'" cy="'+y(e)+'" r="6" fill="var(--alpha)"/><text x="'+L+'" y="'+(y(e0)-10)+'" fill="var(--beta)" font-size="12">E₀ = '+fmt(e0)+'</text><text x="'+L+'" y="18" fill="var(--ink2)" font-size="12">정규화한 에너지</text>';for(const deg of[-90,0,90])z+='<text x="'+x(deg*Math.PI/180)+'" y="285" text-anchor="middle" fill="var(--ink2)" font-size="12">'+deg+'°</text>';get('bound-fig').setAttribute('viewBox','0 0 '+W+' '+H);get('bound-fig').innerHTML=z;}
function drawAll(){try{draw()}catch(e){throw e;}}angleInput.addEventListener('input',()=>{angle=Number(angleInput.value)*Math.PI/180;mode='custom';drawAll()});scaleInput.addEventListener('input',drawAll);for(const id of['basis','best'])get(id).addEventListener('click',()=>{angle=id==='basis'?0:bestAngle;mode=id;angleInput.value=angle*180/Math.PI;drawAll()});mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
