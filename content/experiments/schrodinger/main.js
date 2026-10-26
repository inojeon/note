import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{
const get=id=>document.getElementById('sch-'+id),slider=get('angle');if(!slider)return;
const mq=window.matchMedia('(max-width:600px)'),delta=Math.hypot(.2,.5),low=1-delta,high=1+delta,ground=Math.atan2((.8-low)/.5,1),excited=ground-Math.PI/2;
let angle=0,selection='trial';
const f=n=>(Math.abs(n)<.00005?0:n).toFixed(4).replace('-','−');
function matrix(rows){return '<span class="math-array" role="math" aria-label="'+rows.map(row=>row.map(f).join(', ')).join('; ')+'"><span class="math-cells" aria-hidden="true">'+rows.map(row=>'<span class="math-row">'+row.map(n=>'<span>'+f(n)+'</span>').join('')+'</span>').join('')+'</span></span>'}
function vector(id,v){get(id).innerHTML=matrix(v.map(n=>[n]))}
function draw(){
const c=[Math.cos(angle),Math.sin(angle)],hc=[.8*c[0]-.5*c[1],-.5*c[0]+1.2*c[1]],energy=c[0]*hc[0]+c[1]*hc[1],ec=c.map(n=>energy*n),r=hc.map((n,i)=>n-ec[i]),norm=Math.hypot(...r);
get('angle-value').textContent=(angle*180/Math.PI).toFixed(3)+'°';
get('selected').textContent=selection==='ground'?'바닥 고유상태 · 표시 각도는 근삿값이며 내부 계산은 반올림 전 각도입니다.':selection==='excited'?'들뜬 고유상태 · 표시 각도는 근삿값이며 내부 계산은 반올림 전 각도입니다.':'슬라이더로 고른 시험 상태입니다.';
get('h').innerHTML='H = '+matrix([[.8,-.5],[-.5,1.2]]);vector('c',c);vector('hc',hc);vector('ec',ec);vector('r',r);
get('residual-calculation').textContent='잔차의 길이 제곱: ('+f(r[0])+')² + ('+f(r[1])+')² ≈ '+f(norm*norm)+'. 정규화된 이 상태의 에너지 분산과 같습니다.';get('energy').dataset.value=energy;get('residual').dataset.value=norm;get('energy').textContent=f(energy);get('residual').textContent=norm===0?'0':norm<.00001?norm.toExponential(2):f(norm);
get('spectrum').textContent=f(low)+' (바닥), '+f(high)+' (들뜬)';
get('status').textContent=norm<1e-12?'두 벡터가 일치합니다. 계산 정밀도 안에서 Hc = E(c)c를 만족하는 에너지 고유상태입니다.':'두 끝점이 다릅니다. E(c)는 평균 에너지이지만, 이 상태는 에너지가 확정된 고유상태가 아닙니다.';
for(const id of ['trial','ground','excited'])get(id).setAttribute('aria-pressed',String(selection===id));
const small=mq.matches,W=small?360:680,H=330,ox=W/2,oy=180,scale=small?80:105,xy=v=>[ox+scale*v[0],oy-scale*v[1]],p=xy(hc),q=xy(ec),svg=get('vectors-fig');
svg.setAttribute('viewBox','0 0 '+W+' '+H);
let z='<defs><marker id="sch-hc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--n)"/></marker><marker id="sch-ec-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--alpha)"/></marker><marker id="sch-r-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--beta)"/></marker></defs>';
z+='<text x="16" y="22" fill="var(--n)" font-size="14">━━ Hc</text><text x="'+(small?116:190)+'" y="22" fill="var(--alpha)" font-size="14">┄┄ E(c)c</text><text x="'+(small?260:390)+'" y="22" fill="var(--beta)" font-size="14">→ 잔차 r</text>';
z+='<path d="M'+(ox-1.5*scale)+' '+oy+'H'+(ox+1.5*scale)+' M'+ox+' '+(oy-1.4*scale)+'V'+(oy+1.1*scale)+'" fill="none" stroke="var(--line)"/>';
for(const t of [-1,1]){z+='<path d="M'+(ox+t*scale)+' '+(oy-3)+'v6 M'+(ox-3)+' '+(oy-t*scale)+'h6" stroke="var(--ink2)"/><text x="'+(ox+t*scale)+'" y="'+(oy+19)+'" text-anchor="middle" fill="var(--ink2)" font-size="11">'+t+'</text><text x="'+(ox-10)+'" y="'+(oy-t*scale+4)+'" text-anchor="end" fill="var(--ink2)" font-size="11">'+t+'</text>'}
z+='<text x="'+(ox+1.5*scale)+'" y="'+(oy-10)+'" text-anchor="end" fill="var(--ink2)" font-size="11">첫째 성분</text><text x="'+(ox+10)+'" y="'+(oy-1.4*scale)+'" fill="var(--ink2)" font-size="11">둘째 성분</text>';
z+='<line x1="'+ox+'" y1="'+oy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="var(--n)" stroke-width="7" marker-end="url(#sch-hc-arrow)"/><line x1="'+ox+'" y1="'+oy+'" x2="'+q[0]+'" y2="'+q[1]+'" stroke="var(--alpha)" stroke-width="3" stroke-dasharray="7 4" marker-end="url(#sch-ec-arrow)"/>';
if(norm>1e-12)z+='<line x1="'+q[0]+'" y1="'+q[1]+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="var(--beta)" stroke-width="3" marker-end="url(#sch-r-arrow)"/>';
z+='<circle cx="'+ox+'" cy="'+oy+'" r="3" fill="var(--ink)"/><text x="'+(W/2)+'" y="315" text-anchor="middle" fill="var(--ink2)" font-size="12">같은 에너지 눈금 · 임의 단위</text>';
svg.innerHTML=z;
}
function drawAll(){try{draw()}catch(error){throw error;}}
slider.addEventListener('input',()=>{angle=Number(slider.value)*Math.PI/180;selection='custom';drawAll()});
for(const id of ['trial','ground','excited'])get(id).addEventListener('click',()=>{selection=id;angle=id==='ground'?ground:id==='excited'?excited:0;slider.value=angle*180/Math.PI;drawAll()});
mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
