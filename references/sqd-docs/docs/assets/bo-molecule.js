(function(){
'use strict';
const get=id=>document.getElementById(id),node=get('boh2-data'),lab=get('boh2-lab');
if(!node||!lab||!node.textContent.trim())return;
let data;try{data=JSON.parse(node.textContent);}catch(_){return;}
if(!data.samples||!data.samples.length)return;
const samples=data.samples,grid=data.visualization,basis=data.gaussian_basis,toAng=data.bohr_to_angstrom;
const slider=get('boh2-distance'),mq=window.matchMedia('(max-width:600px)');
let index=data.default_index,viewer=null,failed=false,lastRendered=-1,pending=0;
slider.max=String(samples.length-1);slider.value=String(index);
get('boh2-isovalue').textContent=String(grid.isovalue_electrons_per_bohr3);
const text=(x,y,t,color='ink2',anchor='start')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="var(--'+color+')" font-size="12">'+t+'</text>';
const line=(x1,y1,x2,y2,color='line',dash=false)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="var(--'+color+')"'+(dash?' stroke-dasharray="4 4"':'')+'/>';
function rho(sample,x,y,z){
 const ao=sample.nuclei_bohr.map(center=>{const r2=(x-center[0])**2+(y-center[1])**2+(z-center[2])**2;return basis.coefficients.reduce((sum,c,i)=>sum+c*Math.exp(-basis.exponents_bohr_minus2[i]*r2),0);});
 const d=sample.density_matrix_ao;
 return Math.max(0,d[0][0]*ao[0]*ao[0]+(d[0][1]+d[1][0])*ao[0]*ao[1]+d[1][1]*ao[1]*ao[1]);
}
function cube(sample){
 const shape=grid.grid_shape,origin=grid.grid_origin_bohr,step=grid.grid_step_bohr;
 const rows=['H2 FCI/STO-3G electron density','electrons per bohr^3; fixed density threshold','2 '+origin.join(' ')];
 for(let axis=0;axis<3;axis++){const vector=[0,0,0];vector[axis]=step[axis];rows.push(shape[axis]+' '+vector.join(' '));}
 sample.nuclei_bohr.forEach(r=>rows.push('1 1 '+r.join(' ')));
 let values=[];
 for(let i=0;i<shape[0];i++)for(let j=0;j<shape[1];j++)for(let k=0;k<shape[2];k++){
  values.push(rho(sample,origin[0]+i*step[0],origin[1]+j*step[1],origin[2]+k*step[2]).toExponential(6));
  if(values.length===6){rows.push(values.join(' '));values=[];}
 }
 if(values.length)rows.push(values.join(' '));return rows.join('\n');
}
function slice(){
 const sample=samples[index],w=mq.matches?300:620,left=20,right=w-12,top=20,nx=96,ny=40;
 const bottom=top+(right-left)*5.4/14,h=bottom+(mq.matches?66:48);
 const xmin=grid.grid_origin_bohr[0],xmax=xmin+grid.grid_step_bohr[0]*(grid.grid_shape[0]-1),ymin=-2.7,ymax=2.7;
 const px=x=>left+(x-xmin)/(xmax-xmin)*(right-left),py=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let svg='<title>H₂의 z=0 평면 전자 밀도, 동일한 색 척도</title>';
 for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
  const x=xmin+(i+.5)*(xmax-xmin)/nx,y=ymin+(j+.5)*(ymax-ymin)/ny;
  // Logarithmic fixed colour scale makes both low-density tails and peaks legible.
  const strength=Math.min(1,Math.log1p(rho(sample,x,y,0)/0.001)/Math.log1p(1/0.001));
  svg+='<rect x="'+px(xmin+i*(xmax-xmin)/nx)+'" y="'+py(ymin+(j+1)*(ymax-ymin)/ny)+'" width="'+((right-left)/nx+.3)+'" height="'+((bottom-top)/ny+.3)+'" fill="var(--n)" opacity="'+strength.toFixed(3)+'"/>';
 }
 sample.nuclei_bohr.forEach(r=>{svg+='<circle cx="'+px(r[0])+'" cy="'+py(r[1])+'" r="4" fill="var(--ink)" stroke="var(--panel)" stroke-width="2"/>';svg+=text(px(r[0]),py(r[1])-10,'H','ink','middle');});
 [-3,0,3].forEach(a=>svg+=text(px(a/toAng),bottom+18,a+' Å','ink2','middle'));
 svg+=text(w/2,bottom+37,'핵을 잇는 x축','ink2','middle');
 if(mq.matches)svg+=text(w/2,h-7,'밀도: 0 → 1 이상 e/a₀³ · 로그 척도','ink2','middle');
 else svg+=text(right,17,'밀도: 0 → 1 이상 e/a₀³ · 로그 척도','ink2','end');
 get('boh2-slice-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('boh2-slice-fig').innerHTML=svg;
}
function curve(){
 const w=mq.matches?300:620,h=290,left=mq.matches?49:58,right=w-16,top=30,bottom=h-47;
 const series=[{key:'energy_total_hartree',color:'n',name:'합계'}];
 if(get('boh2-show-electronic').checked)series.push({key:'energy_electronic_hartree',color:'beta',name:'전자'});
 if(get('boh2-show-nuclear').checked)series.push({key:'energy_nuclear_hartree',color:'alpha',name:'핵 반발'});
 const vals=series.flatMap(s=>samples.map(p=>p[s.key])),lo=Math.min(...vals),hi=Math.max(...vals),pad=Math.max(.02,(hi-lo)*.12),ymin=lo-pad,ymax=hi+pad;
 const xlo=samples[0].r_angstrom,xhi=samples[samples.length-1].r_angstrom,px=x=>left+(x-xlo)/(xhi-xlo)*(right-left),py=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
 let svg='<title>계산한 H₂ 거리별 에너지, 하트리 단위</title>'+text(left,17,'에너지 · Ha')+line(left,top,left,bottom)+line(left,bottom,right,bottom);
 for(let i=0;i<5;i++){const y=ymin+(ymax-ymin)*i/4;svg+=line(left,py(y),right,py(y))+text(left-5,py(y)+4,y.toFixed(2),'ink2','end');}
 [xlo,1,2,xhi].forEach(x=>svg+=text(px(x),bottom+19,x.toFixed(1),'ink2','middle'));
 svg+=text((left+right)/2,h-4,'핵 사이 거리 R · Å','ink2','middle');
 svg+=line(px(samples[index].r_angstrom),top,px(samples[index].r_angstrom),bottom,'ink2',true);
 series.forEach((s,n)=>{
  svg+='<polyline data-series="'+s.key+'" points="'+samples.map(p=>px(p.r_angstrom)+','+py(p[s.key])).join(' ')+'" fill="none" stroke="var(--'+s.color+')" stroke-width="2.5"/>';
  samples.forEach((p,i)=>{svg+='<circle cx="'+px(p.r_angstrom)+'" cy="'+py(p[s.key])+'" r="'+(i===index?5:2)+'" fill="var(--'+s.color+')"'+(i===index?' stroke="var(--panel)" stroke-width="2"':'')+'/>';});
  svg+=text(right-n*(mq.matches?61:80),17,s.name,s.color,'end');
 });
 get('boh2-curve-fig').setAttribute('viewBox','0 0 '+w+' '+h);get('boh2-curve-fig').innerHTML=svg;
}
function visible(){return !lab.closest('[hidden]')&&lab.getBoundingClientRect().width>0;}
function fallback(message){failed=true;get('boh2-viewer').hidden=true;get('boh2-density').disabled=true;get('boh2-slice-panel').open=true;get('boh2-render-status').textContent=message;}
function molecule(){
 if(!visible()||failed)return;
 if(!window.$3Dmol){if(document.readyState!=='loading')fallback('3D 표시를 사용할 수 없어 같은 계산의 밀도 단면을 표시합니다. 거리와 에너지 실험은 그대로 사용할 수 있습니다.');return;}
 try{
  if(!viewer){
   if(window.$3Dmol.setSyncSurface)window.$3Dmol.setSyncSurface(true);
   viewer=window.$3Dmol.createViewer(get('boh2-viewer'),{backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),antialias:true});
   const maxR=samples[samples.length-1].r_angstrom;
   viewer.addModel('2\ncommon view bounds\nH '+(-maxR/2)+' 0 0\nH '+(maxR/2)+' 0 0','xyz');viewer.zoomTo();viewer.zoom(2.5);viewer.removeAllModels();
   get('boh2-render-status').textContent='드래그로 회전 · 두 손가락 또는 휠로 확대. 모든 거리에서 같은 밀도 기준을 씁니다.';
   get('boh2-viewer').addEventListener('webglcontextlost',event=>{event.preventDefault();fallback('3D 화면을 유지할 수 없어 같은 전자 밀도의 단면으로 전환했습니다.');},true);
  }
  viewer.setBackgroundColor(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
  if(lastRendered!==index||String(get('boh2-density').checked)!==lab.dataset.densityVisible){
   viewer.removeAllModels();viewer.removeAllShapes();viewer.removeAllLabels();
   const sample=samples[index],xyz='2\nH2 nuclear positions\n'+sample.nuclei_bohr.map(r=>'H '+r.map(v=>v*toAng).join(' ')).join('\n');
   viewer.addModel(xyz,'xyz');viewer.setStyle({},{sphere:{radius:.15,color:getComputedStyle(document.documentElement).getPropertyValue('--alpha').trim()}});
   sample.nuclei_bohr.forEach(r=>viewer.addLabel('H',{position:{x:r[0]*toAng,y:r[1]*toAng+.25,z:r[2]*toAng},fontSize:15,fontColor:getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),showBackground:false}));
   if(get('boh2-density').checked)viewer.addIsosurface(new window.$3Dmol.VolumeData(cube(sample),'cube'),{isoval:grid.isovalue_electrons_per_bohr3,color:getComputedStyle(document.documentElement).getPropertyValue('--n').trim(),opacity:.5,smoothness:1});
   lastRendered=index;lab.dataset.densityVisible=String(get('boh2-density').checked);
  }
  viewer.resize();viewer.render();lab.dataset.viewerReady='true';
 }catch(_){fallback('이 기기에서는 3D 대신 같은 전자 밀도의 단면을 표시합니다. 거리와 에너지 실험은 그대로 사용할 수 있습니다.');}
}
function schedule(){cancelAnimationFrame(pending);pending=requestAnimationFrame(molecule);}
function draw(){
 index=Math.max(0,Math.min(samples.length-1,Number(slider.value)));const p=samples[index];
 get('boh2-distance-value').textContent=p.r_angstrom.toFixed(2)+' Å';
 get('boh2-electronic').textContent=p.energy_electronic_hartree.toFixed(6);get('boh2-nuclear').textContent=p.energy_nuclear_hartree.toFixed(6);get('boh2-total').textContent=p.energy_total_hartree.toFixed(6);
 get('boh2-status').textContent='R = '+p.r_angstrom.toFixed(2)+' Å에 핵을 고정한 전자 계산입니다. '+(index===data.minimum_index?'지금은 계산한 거리들 중 합계 에너지가 가장 낮습니다.':'거리를 바꾸면 핵 배치와 그에 대응하는 전자 상태가 함께 바뀝니다.');
 curve();slice();schedule();
}
slider.addEventListener('input',draw);
get('boh2-minimum').addEventListener('click',()=>{slider.value=String(data.minimum_index);draw();});
get('boh2-reset').addEventListener('click',()=>{slider.value=String(data.default_index);draw();});
['boh2-show-electronic','boh2-show-nuclear'].forEach(id=>get(id).addEventListener('change',curve));
get('boh2-density').addEventListener('change',()=>{if(!get('boh2-density').checked)get('boh2-slice-panel').open=true;schedule();});
window.addEventListener('hashchange',schedule);window.addEventListener('resize',schedule);document.addEventListener('DOMContentLoaded',schedule);
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{lastRendered=-1;schedule();});
new MutationObserver(()=>{lastRendered=-1;schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
if(window.ResizeObserver)new ResizeObserver(schedule).observe(get('boh2-viewer'));
mq.addEventListener('change',()=>{curve();slice();});draw();
})();
