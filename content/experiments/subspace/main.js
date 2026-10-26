import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(function(){
const mq=window.matchMedia('(max-width:600px)');function narrow(){return mq.matches}
function fmt(n){return (Math.abs(n)<.00005?0:n).toFixed(2)}
function array(rows){return `<span class="math-array" role="math" aria-label="${rows.map(row=>row.map(fmt).join(', ')).join('; ')}"><span class="math-cells" aria-hidden="true">${rows.map(row=>`<span class="math-row">${row.map(v=>`<span>${fmt(v)}</span>`).join('')}</span>`).join('')}</span></span>`}
function col(v){return array(v.map(x=>[x]))}
const presets={xy:[2,3,4,0],inside:[2,3,0,0],tilt:[2,3,4,30],zero:[0,0,0,0]};
function draw(){
const x=Number(document.getElementById('subspace-x').value),y=Number(document.getElementById('subspace-y').value),z=Number(document.getElementById('subspace-z').value),theta=Number(document.getElementById('subspace-tilt').value),delta=Number(document.getElementById('subspace-offset').value),t=theta*Math.PI/180,c=Math.cos(t),s=Math.sin(t),v=[x,y,z],w=c*y+s*z,p=[x,c*w,s*w],r=[0,y-p[1],z-p[2]],h=[x+delta,p[1],p[2]],distance=Math.hypot(...r),candidateDistance=Math.hypot(delta,...r),nearestOpen=document.getElementById('subspace-nearest').open;
for(const [id,value] of [['x',x],['y',y],['z',z],['tilt',theta],['offset',delta]])document.getElementById('subspace-'+id+'-value').textContent=id==='tilt'?theta+'°':String(value);
document.getElementById('subspace-original').innerHTML=col(v);document.getElementById('subspace-projected').innerHTML=col(p);document.getElementById('subspace-residual').innerHTML=col(r);
document.getElementById('subspace-status').textContent=distance<1e-10?'벡터가 평면 안에 있습니다. 투영 결과가 원래 벡터와 같고, 차이의 길이는 0입니다.':`평면까지의 거리는 ‖r‖ = ${distance.toFixed(4)}입니다. 차이는 평면의 두 기저 방향 모두와 직교합니다.`;
document.getElementById('subspace-formula-values').innerHTML=`<div class="subspace-equation"><span>Q = ${array([[1,0],[0,c],[0,s]])}</span><span>Qᵀv = ${col([x,w])}</span><span>p = QQᵀv = ${col(p)}</span></div><p>q₁·r = ${fmt(r[0])}, q₂·r = ${fmt(c*r[1]+s*r[2])}. 두 내적이 모두 0이므로 차이는 평면 전체에 수직입니다.</p>`;
document.getElementById('subspace-distance-values').textContent=`투영 거리 ‖v−p‖ = ${distance.toFixed(4)} / 다른 후보까지 ‖v−h‖ = ${candidateDistance.toFixed(4)}. ‖v−h‖² = ‖v−p‖² + δ²입니다.`;
document.querySelectorAll('[data-subspace-preset]').forEach(button=>{const vals=presets[button.getAttribute('data-subspace-preset')];button.setAttribute('aria-pressed',String(vals.every((n,i)=>n===[x,y,z,theta][i])))});
const small=narrow(),W=small?360:680,H=small?400:480,cx=W/2,cy=H/2,scale=small?17:25;
function project(a){return [cx+scale*(a[0]+a[1])*Math.SQRT1_2,cy+scale*(a[0]-a[1]-a[2])/Math.sqrt(3)]}
function points(a){return a.map(q=>project(q).join(',')).join(' ')}
const corners=[[-6,-6*c,-6*s],[6,-6*c,-6*s],[6,6*c,6*s],[-6,6*c,6*s]];
let scene=`<polygon points="${points(corners)}" fill="var(--beta-soft)" fill-opacity=".65" stroke="var(--beta)" stroke-width="1"/>`;
function line(a,b,color,dashed=false,width=1){const [x1,y1]=project(a),[x2,y2]=project(b);return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="var(${color})" stroke-width="${width}" ${dashed?'stroke-dasharray="4 4"':''}/>`}
for(let k=-4;k<=4;k+=2)scene+=line([-6,k*c,k*s],[6,k*c,k*s],'--beta',false,.5)+line([k,-6*c,-6*s],[k,6*c,6*s],'--beta',false,.5);
for(const [axis,label] of [[[6.5,0,0],'x'],[[0,6.5,0],'y'],[[0,0,6.5],'z']]){scene+=line([0,0,0],axis,'--ink2',true);const [px,py]=project(axis);scene+=`<text x="${px+5}" y="${py-5}" fill="var(--ink2)" font-size="12">${label}</text>`;}
function arrow(a,b,color){const [x1,y1]=project(a),[x2,y2]=project(b),angle=Math.atan2(y2-y1,x2-x1),l=8;if(Math.hypot(x2-x1,y2-y1)<.01)return `<circle cx="${x2}" cy="${y2}" r="4" fill="var(${color})"/>`;return `<path d="M ${x1} ${y1} L ${x2} ${y2} M ${x2-l*Math.cos(angle-.4)} ${y2-l*Math.sin(angle-.4)} L ${x2} ${y2} L ${x2-l*Math.cos(angle+.4)} ${y2-l*Math.sin(angle+.4)}" fill="none" stroke="var(${color})" stroke-width="3"/>`}
scene+=arrow([0,0,0],p,'--beta')+arrow(p,v,'--alpha')+arrow([0,0,0],v,'--n');
for(const [a,label,color,dy] of [[v,'v','--n',-9],[p,'p','--beta',15]]){const [px,py]=project(a);scene+=`<text x="${px+8}" y="${py+dy}" fill="var(${color})" font-size="14">${label}</text>`;}
const mid=p.map((a,i)=>(a+v[i])/2),[mx,my]=project(mid);if(distance>1e-10)scene+=`<text x="${mx+8}" y="${my}" fill="var(--alpha)" font-size="13">r</text>`;
if(nearestOpen){scene+=line(v,h,'--ink2',true,2);const [hx,hy]=project(h);scene+=`<circle cx="${hx}" cy="${hy}" r="4" fill="var(--ink)"/><text x="${hx-12}" y="${hy+14}" fill="var(--ink)" font-size="13">h</text>`;}
const [ox,oy]=project([0,0,0]);scene+=`<circle cx="${ox}" cy="${oy}" r="2.5" fill="var(--ink2)"/><text x="${ox-16}" y="${oy+16}" fill="var(--ink2)" font-size="12">O</text>`;
const svg=document.getElementById('subspace-projection-fig');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML=scene;
}
function drawAll(){try{draw()}catch(e){throw e;}}
for(const id of ['x','y','z','tilt','offset'])document.getElementById('subspace-'+id).addEventListener('input',drawAll);document.getElementById('subspace-nearest').addEventListener('toggle',drawAll);
document.querySelectorAll('[data-subspace-preset]').forEach(button=>button.addEventListener('click',()=>{const vals=presets[button.getAttribute('data-subspace-preset')];['x','y','z','tilt'].forEach((id,i)=>{document.getElementById('subspace-'+id).value=vals[i]});drawAll()}));mq.addEventListener('change',drawAll);drawAll();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
