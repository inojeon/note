import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {

(()=>{const g=id=>document.getElementById('bm-'+id);if(!g('state'))return;const mq=window.matchMedia('(max-width:600px)'),s=Math.SQRT1_2;const states={zero:[1,0,0],one:[0,1,0],plus:[s,s,0],minus:[s,-s,0],plusi:[s,0,s]},labels={Z:['0','1'],X:['+','−'],Y:['+i','−i']},coords={zero:['1','0'],one:['0','1'],plus:['1/√2','1/√2'],minus:['1/√2','−1/√2'],plusi:['1/√2','i/√2']};function draw(){const state=Object.prototype.hasOwnProperty.call(states,g('state').value)?g('state').value:'plus',basis=Object.prototype.hasOwnProperty.call(labels,g('basis').value)?g('basis').value:'Z',[a,br,bi]=states[state],q=basis==='Z'?a*a:basis==='X'?(1+2*a*br)/2:(1+2*a*bi)/2,p=Math.max(0,Math.min(1,q)),ls=labels[basis];g('c0').textContent=coords[state][0];g('c1').textContent=coords[state][1];g('basis-description').textContent='측정 기준: '+basis+' · '+ls[0]+' 상태와 '+ls[1]+' 상태를 구분합니다.';g('label-first').textContent=ls[0]+' 결과 확률';g('label-second').textContent=ls[1]+' 결과 확률';g('p-first').textContent=(p*100).toFixed(3)+'%';g('p-second').textContent=((1-p)*100).toFixed(3)+'%';g('status').textContent=p>1-1e-10?ls[0]+' 결과가 확실히 나옵니다.':p<1e-10?ls[1]+' 결과가 확실히 나옵니다.':'두 결과가 각각의 확률로 나옵니다. 준비한 상태는 준비 상태 버튼에서만 바뀝니다.';const w=mq.matches?300:600;g('probability-fig').setAttribute('viewBox','0 0 '+w+' 220');g('probability-fig').innerHTML='<title>측정 결과 확률</title>'+[p,1-p].map((v,i)=>{const x=w*(i?.72:.28),y=170-120*v;return '<rect x="'+(x-30)+'" y="'+y+'" width="60" height="'+(120*v)+'" fill="var(--'+(i?'alpha':'n')+')"/><text x="'+x+'" y="'+(y-12)+'" text-anchor="middle" fill="var(--ink)" font-size="14">'+(v*100).toFixed(1)+'%</text><text x="'+x+'" y="198" text-anchor="middle" fill="var(--ink2)" font-size="14">'+ls[i]+' 결과</text>';}).join('');}function render(){try{draw()}catch(e){throw e;}}g('state').addEventListener('change',render);g('basis').addEventListener('change',render);mq.addEventListener('change',render);render();})();


(function(){
const el=id=>document.getElementById('bm-'+id),mq=window.matchMedia('(max-width:600px)');
const states={zero:[0,0,1],one:[0,0,-1],plus:[1,0,0],minus:[-1,0,0],plusi:[0,1,0]};
const bases={X:{n:[1,0,0],u:[0,1,0],v:[0,0,1],labels:['+','−'],plane:'y–z'},Y:{n:[0,1,0],u:[1,0,0],v:[0,0,1],labels:['+i','−i'],plane:'x–z'},Z:{n:[0,0,1],u:[1,0,0],v:[0,1,0],labels:['0','1'],plane:'x–y'}};
let yaw=-.65,pitch=.32,drag=null;
const scale=(v,a)=>v.map(x=>a*x),dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
function draw(){
 const state=states[el('state').value]||states.plus,basis=bases[el('basis').value]||bases.Z,n=basis.n,d=dot(state,n),svg=el('bloch-fig');
 const w=mq.matches?320:600,h=mq.matches?360:450,cx=w/2,cy=h/2,r=mq.matches?106:155;
 function project([x,y,z]){const a=Math.cos(yaw)*x-Math.sin(yaw)*y,b=Math.sin(yaw)*x+Math.cos(yaw)*y;return [cx+r*a,cy-r*(Math.cos(pitch)*z-Math.sin(pitch)*b),Math.cos(pitch)*b+Math.sin(pitch)*z];}
 const path=points=>points.map((v,i)=>{const p=project(v);return (i?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' ');
 const pieces=[];
 function line(a,b,color,width=1,dashed=false){const depth=(project(a)[2]+project(b)[2])/2;pieces.push({depth,html:'<path d="'+path([a,b])+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" opacity="'+(depth<0?.35:.9)+'"'+(dashed?' stroke-dasharray="4 3"':'')+'/>'});}
 for(let k=0;k<6;k++)for(let i=0;i<72;i++){
  const point=t=>[Math.sin(t)*Math.cos(k*Math.PI/6),Math.sin(t)*Math.sin(k*Math.PI/6),Math.cos(t)];line(point(i*Math.PI/36),point((i+1)*Math.PI/36),'var(--line)');
 }
 for(let i=0;i<72;i++)line([Math.cos(i*Math.PI/36),Math.sin(i*Math.PI/36),0],[Math.cos((i+1)*Math.PI/36),Math.sin((i+1)*Math.PI/36),0],'var(--line)');
 const circle=Array.from({length:97},(_,i)=>basis.u.map((u,j)=>u*Math.cos(i*Math.PI/48)+basis.v[j]*Math.sin(i*Math.PI/48)));
 // Depth-sort disk triangles together with the sphere wire frame.
 for(let i=0;i<96;i++)pieces.push({depth:(project(circle[i])[2]+project(circle[i+1])[2])/3,html:'<path d="'+path([[0,0,0],circle[i],circle[i+1]])+' Z" fill="var(--alpha)" fill-opacity=".18" stroke="none"/>'});
 for(let i=0;i<96;i++)line(circle[i],circle[i+1],'var(--alpha)',2);
 for(let j=0;j<3;j++){const v=[0,0,0];v[j]=1.08;line(scale(v,-1),v,'var(--line)');}
 pieces.sort((a,b)=>a.depth-b.depth);
 const endpoint=project(state),positive=project(scale(n,1.08)),negative=project(scale(n,-1.08)),projection=project(scale(n,d));
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.dataset.state=JSON.stringify(state);svg.dataset.normal=JSON.stringify(n);svg.dataset.plane=JSON.stringify([basis.u,basis.v]);svg.dataset.dot=String(d);svg.dataset.camera=JSON.stringify([yaw,pitch]);svg.dataset.tip=JSON.stringify(endpoint);
 svg.innerHTML='<defs><marker id="bm-axis-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="var(--alpha)"/></marker><marker id="bm-state-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="var(--accent)"/></marker></defs><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="var(--accent)" fill-opacity=".04" stroke="var(--line)"/>'+pieces.map(p=>p.html).join('')+'<path d="'+path([scale(n,-1.08),scale(n,1.08)])+'" fill="none" stroke="var(--alpha)" stroke-width="3" marker-end="url(#bm-axis-arrow)"/><path d="'+path([state,scale(n,d)])+'" fill="none" stroke="var(--beta)" stroke-width="2" stroke-dasharray="4 4"/><circle cx="'+projection[0]+'" cy="'+projection[1]+'" r="4" fill="var(--beta)"/><path d="'+path([[0,0,0],state])+'" fill="none" stroke="var(--accent)" stroke-width="5" marker-end="url(#bm-state-arrow)"/><circle cx="'+endpoint[0]+'" cy="'+endpoint[1]+'" r="5" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>'+[1,-1].map((sign,i)=>{const p=project(scale(n,sign*1.3));if(Math.hypot(p[0]-cx,p[1]-cy)<r*.2)return '';return '<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" dominant-baseline="middle" fill="var(--alpha)" font-size="14">'+basis.labels[i]+' 상태</text>';}).join('')+[[[1,0,0],'x'],[[0,1,0],'y'],[[0,0,1],'z']].filter(([v])=>dot(v,n)===0).map(([v,label])=>{const p=project(scale(v,1.15));return '<text x="'+p[0]+'" y="'+p[1]+'" text-anchor="middle" fill="var(--ink2)" font-size="13">'+label+'</text>';}).join('');
 el('plane-description').textContent='회색 '+basis.plane+' 평면은 '+el('basis').value+' 측정 축에 수직입니다. 파란 화살표 끝이 이 평면에 있으면 두 결과는 각각 50%입니다.';
 el('projection-description').textContent='측정 축 방향 성분 r·n = '+d.toFixed(2)+' → '+basis.labels[0]+' 결과: '+((1+d)*50).toFixed(1)+'%, '+basis.labels[1]+' 결과: '+((1-d)*50).toFixed(1)+'%';
}
function render(){try{draw();}catch(error){throw error;}}
const svg=el('bloch-fig');
svg.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};svg.setPointerCapture(e.pointerId);});
svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.012;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.clientY-drag.y)*.012));drag.x=e.clientX;drag.y=e.clientY;render();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,()=>{drag=null;});
svg.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){yaw=-.65;pitch=.32;}else{yaw+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.key==='ArrowUp'?.15:e.key==='ArrowDown'?-.15:0)));}render();});
el('view-reset').addEventListener('click',()=>{yaw=-.65;pitch=.32;render();});
el('state').addEventListener('change',render);el('basis').addEventListener('change',render);mq.addEventListener('change',render);render();
})();

 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
