import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const el=id=>document.getElementById(id),f=x=>(Math.abs(x)<1e-9?0:x).toFixed(4),mq=window.matchMedia('(max-width:600px)');let yaw=-0.65,pitch=0.32,drag=null;
function drawSphere(x,z){
 const svg=el('br-bloch-fig'),w=mq.matches?320:600,h=mq.matches?350:460,cx=w/2,cy=h/2,r=mq.matches?108:162;
 const project=([a,b,c])=>{const u=Math.cos(yaw)*a-Math.sin(yaw)*b,v=Math.sin(yaw)*a+Math.cos(yaw)*b;return [cx+r*u,cy-r*(Math.cos(pitch)*c-Math.sin(pitch)*v),Math.cos(pitch)*v+Math.sin(pitch)*c];};
 const path=points=>points.map((p,i)=>{const q=project(p);return (i?'L':'M')+q[0].toFixed(2)+','+q[1].toFixed(2);}).join(' ');
 const pieces=[];
 function segment(a,b,color,width,dash){const depth=(project(a)[2]+project(b)[2])/2;pieces.push({depth,html:'<path d="'+path([a,b])+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" opacity="'+(depth<0?.32:.9)+'"'+(dash&&depth<0?' stroke-dasharray="3 4"':'')+'/>'});}
 // All meridians, the equator, orbit and axes are points in the same 3D frame.
 for(let meridian=0;meridian<6;meridian++){
  const phi=meridian*Math.PI/6;
  for(let i=0;i<96;i++){const point=t=>[Math.sin(t)*Math.cos(phi),Math.sin(t)*Math.sin(phi),Math.cos(t)];segment(point(i*Math.PI/48),point((i+1)*Math.PI/48),'var(--line)',1,true);}
 }
 for(const latitude of [-Math.PI/6,0,Math.PI/6])for(let i=0;i<96;i++){
  const point=t=>[Math.cos(latitude)*Math.cos(t),Math.cos(latitude)*Math.sin(t),Math.sin(latitude)];segment(point(i*Math.PI/48),point((i+1)*Math.PI/48),'var(--line)',latitude===0?1.8:1,true);
 }
 for(let i=0;i<128;i++){const t=i*Math.PI/64,u=(i+1)*Math.PI/64;segment([Math.sin(t),0,Math.cos(t)],[Math.sin(u),0,Math.cos(u)],'var(--beta)',2.6,true);}
 const axes=[[[1,0,0],'x'],[[0,1,0],'y'],[[0,0,1],'z · |0⟩'],[[0,0,-1],'|1⟩']];
 for(const [v]of axes)segment(v.map(n=>-1.12*n),v.map(n=>1.12*n),'var(--ink2)',1,false);
 const tip=project([x,0,z]),origin=project([0,0,0]);
 pieces.sort((a,b)=>a.depth-b.depth);
 const vector='<line x1="'+cx+'" y1="'+cy+'" x2="'+tip[0]+'" y2="'+tip[1]+'" stroke="var(--accent)" stroke-width="5" marker-end="url(#br-arrowhead)"/><circle cx="'+tip[0]+'" cy="'+tip[1]+'" r="6" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>';
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 svg.dataset.camera=JSON.stringify([yaw,pitch]);svg.dataset.tip=JSON.stringify(tip);svg.dataset.state=JSON.stringify([x,0,z]);
 svg.innerHTML='<defs><radialGradient id="br-sphere-shade" cx="32%" cy="25%" r="75%"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".16"/><stop offset="100%" stop-color="var(--accent)" stop-opacity=".02"/></radialGradient><marker id="br-arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="var(--accent)"/></marker></defs><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="url(#br-sphere-shade)" stroke="var(--line)"/>'+pieces.map(p=>p.html).join('')+vector+axes.map(([v,label])=>{const q=project(v.map(n=>n*1.27));if(Math.hypot(q[0]-cx,q[1]-cy)<r*.2)return '';return '<text x="'+q[0]+'" y="'+q[1]+'" text-anchor="middle" dominant-baseline="middle" fill="var(--ink)" font-size="14">'+label+'</text>';}).join('')+'<circle cx="'+origin[0]+'" cy="'+origin[1]+'" r="3" fill="var(--ink2)"/>';
 el('br-view-status').textContent=(Math.abs(Math.cos(pitch))<.01?'위에서 보면 z축의 두 극은 화면 중심에 겹칩니다. ':'')+'시점 조작은 보는 방향만 바꿉니다. 회로 각도와 측정 확률은 그대로입니다.';
}
function redrawView(){const t=Number(el('br-angle').value)*Math.PI/180;drawSphere(Math.sin(t),Math.cos(t));}
['sixty','double'].forEach(id=>el('br-'+id).addEventListener('click',()=>{el('br-angle').value=id==='sixty'?60:720;draw()}));const sphere=el('br-bloch-fig');
sphere.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};sphere.setPointerCapture(e.pointerId);});
sphere.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.012;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.clientY-drag.y)*.012));drag.x=e.clientX;drag.y=e.clientY;redrawView();});
function stopDrag(){drag=null;}
sphere.addEventListener('pointerup',stopDrag);sphere.addEventListener('pointercancel',stopDrag);sphere.addEventListener('lostpointercapture',stopDrag);
sphere.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){yaw=-.65;pitch=.32;}else{yaw+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.key==='ArrowUp'?.15:e.key==='ArrowDown'?-.15:0)));}redrawView();});
[['br-view-default',-.65,.32],['br-view-front',0,0],['br-view-top',0,Math.PI/2]].forEach(([id,a,b])=>el(id).addEventListener('click',()=>{yaw=a;pitch=b;redrawView();}));

function draw(){const degrees=Number(el('br-angle').value),t=degrees*Math.PI/180,a=Math.cos(t/2),b=Math.sin(t/2),x=Math.sin(t),z=Math.cos(t);el('br-square').textContent='0 확률: ('+f(a)+')² = '+(a*a).toFixed(4)+' · 1 확률: ('+f(b)+')² = '+(b*b).toFixed(4)+' · 제곱합 = '+(a*a+b*b).toFixed(4);el('br-angle-value').textContent=degrees+'°';el('br-half-angle').textContent=(degrees/2)+'°';el('br-p0').textContent=(100*a*a).toFixed(2)+'%';el('br-p1').textContent=(100*b*b).toFixed(2)+'%';el('br-bloch').textContent='('+f(x)+', 0, '+f(z)+')';el('br-bloch').dataset.values=JSON.stringify([x,0,z]);el('br-vector').dataset.values=JSON.stringify([a,b]);el('br-vector').innerHTML='<span class="math-array" role="math"><span class="math-cells" aria-hidden="true"><span class="math-row"><span>'+f(a)+'</span></span><span class="math-row"><span>'+f(b)+'</span></span></span></span>';el('br-status').textContent=degrees===360?'모든 성분의 부호가 반대가 되어도 같은 물리적 0 상태입니다.':degrees===720?'벡터의 부호까지 처음과 같아졌습니다.':degrees===180?'0 상태에서 1 상태로 바뀌었습니다.':degrees===90?'두 진폭이 같아졌고, 계산 기저 측정 확률도 각각 50%입니다.':'각도가 바뀌면 상태 벡터의 성분과 블로흐 구의 점이 함께 바뀝니다.';
drawSphere(x,z);}
el('br-angle').addEventListener('input',draw);[['br-zero',0],['br-quarter',90],['br-half',180],['br-turn',360]].forEach(([id,value])=>el(id).addEventListener('click',()=>{el('br-angle').value=value;draw()}));mq.addEventListener('change',draw);draw();})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
