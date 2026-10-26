import { createScope, loadJSON, addReset } from 'experiment-shared.js';

export async function mount(root, context) {
 const scope=createScope(root,context);
 const {document,window,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
 try {
(function(){const $=id=>document.getElementById(id),mq=window.matchMedia('(max-width:600px)');function draw(){const deg=+$('sex-theta').value,t=deg*Math.PI/180,c=Math.cos(t/2),s=Math.sin(t/2),p=c*c,q=s*s;$('sex-angle').textContent=deg+'°';$('sex-state').innerHTML='<span class=\"math-tex\" data-tex=\"\\begin{aligned}|\\psi\\rangle &amp;\\approx '+c.toFixed(3)+'|0101\\rangle\\\\ &amp;+'+s.toFixed(3)+'|1010\\rangle\\end{aligned}\">현재 진폭 '+c.toFixed(3)+', '+s.toFixed(3)+'</span>';$('sex-state').dataset.amplitudes=JSON.stringify([c,s]);$('sex-state').dataset.probabilities=JSON.stringify([p,q]);[['sex-c',c.toFixed(3)],['sex-s',s.toFixed(3)],['sex-p0',(100*p).toFixed(1)+'%'],['sex-p1',(100*q).toFixed(1)+'%']].forEach(([id,x])=>$(id).textContent=x);let w=mq.matches?320:640,h=220,svg='';[['0101',p,'궤도 0: αβ · 궤도 1: 비어 있음'],['1010',q,'궤도 0: 비어 있음 · 궤도 1: αβ']].forEach(([bits,prob,txt],i)=>{let y=26+i*104;svg+='<text x="8" y="'+y+'">'+bits+' · '+txt+'</text><rect x="8" y="'+(y+15)+'" width="'+(w-16)+'" height="24" rx="4" fill="var(--line)"/><rect x="8" y="'+(y+15)+'" width="'+((w-16)*prob)+'" height="24" rx="4" fill="var(--accent)"/><text x="8" y="'+(y+61)+'">측정 확률 '+(100*prob).toFixed(1)+'%</text>';});$('sex-fig').setAttribute('viewBox','0 0 '+w+' '+h);$('sex-fig').innerHTML=svg;} $('sex-theta').addEventListener('input',draw);document.querySelectorAll('[data-sex-angle]').forEach(b=>b.addEventListener('click',()=>{$('sex-theta').value=b.dataset.sexAngle;draw();}));mq.addEventListener('change',draw);draw();})();
 addReset(root,context.signal);
 return scope.lifecycle;
 } catch(error) {scope.lifecycle.destroy();throw error;}
}
