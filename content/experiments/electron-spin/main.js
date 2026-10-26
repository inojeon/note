import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
'use strict';
const get=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)');
const txt=(x,y,t,color='ink',anchor='start')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="var(--'+color+')" font-size="14">'+t+'</text>';
const line=(x1,y1,x2,y2,color='line',dash=false)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--'+color+')"'+(dash?' stroke-dasharray="4 4"':'')+'/>';
function draw(){
 const degrees=Number(get('spin-axis').value),t=degrees*Math.PI/180,p=Math.cos(t/2)**2,minus=1-p,mean=0.5*Math.cos(t);
 get('spin-axis-value').textContent=degrees+'°';get('spin-plus').textContent=(100*p).toFixed(1)+'%';get('spin-minus').textContent=(100*minus).toFixed(1)+'%';get('spin-mean').textContent=(Math.abs(mean)<1e-8?0:mean).toFixed(3);
 get('spin-status').textContent='측정축을 '+degrees+'° 돌리면 양의 결과 확률은 '+(100*p).toFixed(1)+'%입니다. 축을 바꾸어도 가능한 측정값은 양·음의 ℏ/2 두 개입니다.';
 [['spin-same',0],['spin-perpendicular',90],['spin-opposite',180]].forEach(a=>get(a[0]).setAttribute('aria-pressed',String(degrees===a[1])));
 const narrow=mq.matches,w=narrow?300:620,h=narrow?465:280,cx=narrow?150:150,cy=narrow?160:165,r=86,bx=narrow?45:355,by=narrow?335:115,bw=narrow?210:220;
 let svg='<title>준비 상태 고정, 측정축 회전</title>'+txt(cx,25,'준비: z축 양의 상태','ink','middle');
 svg+=line(cx-r-8,cy,cx+r+8,cy)+line(cx,cy+r,cx,cy-r,'ink2');
 svg+=txt(cx+8,cy-r-10,'z','ink2')+txt(cx+r+4,cy+20,'x','ink2');
 const end=[cx+r*Math.sin(t),cy-r*Math.cos(t)],dx=Math.sin(t),dy=-Math.cos(t);
 svg+=line(cx,cy,end[0],end[1],'accent')+'<polygon points="'+end[0]+','+end[1]+' '+(end[0]-12*dx+5*dy)+','+(end[1]-12*dy-5*dx)+' '+(end[0]-12*dx-5*dy)+','+(end[1]-12*dy+5*dx)+'" fill="var(--accent)"/>';
 svg+=txt(cx,narrow?281:273,'파랑 화살표: 측정축','accent','middle');
 svg+=txt(bx+bw/2,by-20,'결과 확률','ink','middle');
 [p,minus].forEach((v,i)=>{const y=by+62*i,color=i?'beta':'alpha';svg+=txt(bx-25,y+18,i?'−':'+',color)+'<rect x="'+bx+'" y="'+y+'" width="'+bw+'" height="25" rx="3" fill="var(--code)" stroke="var(--line)"/><rect x="'+bx+'" y="'+y+'" width="'+v*bw+'" height="25" rx="3" fill="var(--'+color+')"/>'+txt(bx,y+45,(100*v).toFixed(1)+'%',color);});
 get('spin-axis-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('spin-axis-fig').innerHTML=svg;
}
function drawAll(){try{draw();}catch(e){throw e;}}
get('spin-axis').addEventListener('input',drawAll);[['spin-same',0],['spin-perpendicular',90],['spin-opposite',180]].forEach(a=>get(a[0]).addEventListener('click',()=>{get('spin-axis').value=a[1];drawAll();}));mq.addEventListener('change',drawAll);drawAll();

})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
