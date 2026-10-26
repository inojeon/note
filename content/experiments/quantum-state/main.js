import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){
'use strict';
const get=id=>document.getElementById(id), mq=window.matchMedia('(max-width:600px)'), alpha=35*Math.PI/180;
const fixed=[Math.cos(alpha),Math.sin(alpha)];
function fmt(v){return (Math.abs(v)<0.0005?0:v).toFixed(3).replace('-','−');}
function column(v){return '<span class="math-array" role="math" aria-label="'+v.map(fmt).join('; ')+'"><span class="math-cells" aria-hidden="true">'+v.map(x=>'<span class="math-row"><span>'+fmt(x)+'</span></span>').join('')+'</span></span>';}
function stateEquation(values,basis){
 const term=(v,index)=>Math.abs(v).toFixed(3)+'\\lvert '+basis+'_{'+index+'}\\rangle';
 const expression='\\lvert\\psi\\rangle\\approx '+(values[0]<0?'-':'')+term(values[0],1)+(values[1]<0?'-':'+')+term(values[1],2);
 return '<span class="math-tex" data-tex="'+expression+'">|ψ⟩ ≈ '+fmt(values[0])+basis+'₁ + ('+fmt(values[1])+')'+basis+'₂</span>';
}
function draw(){
 const degrees=Number(get('qstate-angle').value),theta=degrees*Math.PI/180,c=Math.cos(theta),s=Math.sin(theta);
 const coords=[c*fixed[0]+s*fixed[1],-s*fixed[0]+c*fixed[1]];
 get('qstate-angle-value').textContent=degrees+'°';get('qstate-alpha').textContent=Math.round(alpha*180/Math.PI)+'°';
 get('qstate-fixed').innerHTML=column(fixed);get('qstate-rotated').innerHTML=column(coords);
 get('qstate-expansion').innerHTML='<div><small>원래 기저 상태로 전개</small>'+stateEquation(fixed,'e')+'</div><div><small>회전한 기저 상태로 전개</small>'+stateEquation(coords,'b')+'</div><p class="qc-note">e₁, e₂는 원래 기저, b₁, b₂는 회전한 기저입니다. 표시 계수는 소수 세 자리 근삿값입니다.</p>';
 const norm=coords[0]*coords[0]+coords[1]*coords[1];
 get('qstate-norm').textContent='새 좌표의 제곱합: ('+fmt(coords[0])+')² + ('+fmt(coords[1])+')² ≈ '+norm.toFixed(6)+' (계산은 반올림 전 값 사용)';
 get('qstate-status').textContent=degrees===35?'상태와 첫 기저가 나란합니다. 새 좌표는 첫 성분 1, 둘째 성분 0입니다. 상태는 그대로입니다.':'새 좌표로 읽으면 '+fmt(coords[0])+'b₁ + ('+fmt(coords[1])+')b₂입니다. 기준과 숫자가 함께 바뀌어 같은 상태를 나타냅니다.';
 [['qstate-original',0],['qstate-aligned',35],['qstate-quarter',90]].forEach(p=>get(p[0]).setAttribute('aria-pressed',String(degrees===p[1])));
 const narrow=mq.matches,w=narrow?300:620,h=narrow?320:340,cx=w/2,cy=narrow?170:180,r=narrow?96:116;
 const point=v=>[cx+r*v[0],cy-r*v[1]],p=point(fixed),b1=point([c,s]),b2=point([-s,c]),p1=point([coords[0]*c,coords[0]*s]);
 const line=(a,b,color,dash,width)=>'<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="var(--'+color+')" stroke-width="'+(width||2)+'"'+(dash?' stroke-dasharray="5 4"':'')+'/>';
 const arrow=(end,color)=>{const dx=(end[0]-cx)/r,dy=(end[1]-cy)/r;return line([cx,cy],end,color,false,3)+'<polygon points="'+end[0]+','+end[1]+' '+(end[0]-10*dx+4*dy)+','+(end[1]-10*dy-4*dx)+' '+(end[0]-10*dx-4*dy)+','+(end[1]-10*dy+4*dx)+'" fill="var(--'+color+')"/>';};
 const label=(x,y,t,color)=>'<text x="'+x+'" y="'+y+'" fill="var(--'+color+')" text-anchor="middle" font-size="14">'+t+'</text>';
 let svg='<title id="qstate-fig-title">같은 상태와 회전하는 기저</title><desc id="qstate-fig-desc">고정된 회색 상태와 θ '+degrees+'도 회전한 두 기저. 새 좌표는 '+coords.map(fmt).join(', ')+'.</desc>';
 svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--line)"/>';
 svg+=line([cx-r-12,cy],[cx+r+12,cy],'line',true)+line([cx,cy-r-12],[cx,cy+r+12],'line',true);
 svg+=line(p1,p,'ink2',true)+line([cx,cy],p1,'ink2',true,5);
 svg+=arrow(b1,'n')+arrow(b2,'beta')+arrow(p,'alpha');
 svg+=label(cx,22,'회색: 고정 상태 |ψ⟩','alpha')+label(cx,44,'파랑 b₁ · 연한 파랑 b₂: 회전하는 기저','ink2');
 svg+=label(cx+(r+18)*c,cy-(r+18)*s+5,'b₁','n')+label(cx-(r+18)*s,cy-(r+18)*c+5,'b₂','beta');
 svg+=label(cx,h-10,'‖ψ‖ = '+Math.sqrt(norm).toFixed(3),'ink');
 get('qstate-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('qstate-fig').innerHTML=svg;
}
function drawAll(){try{draw();}catch(e){throw e;}}
get('qstate-angle').addEventListener('input',drawAll);
[['qstate-original',0],['qstate-aligned',35],['qstate-quarter',90]].forEach(p=>get(p[0]).addEventListener('click',()=>{get('qstate-angle').value=p[1];drawAll();}));
mq.addEventListener('change',drawAll);drawAll();
})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
