/* Shared KaTeX rendering for authored TeX and interactive column/matrix values.
 * Source cells remain available to the labs; only the visible notation changes.
 */
(function(){
'use strict';
if(typeof katex==='undefined')return;
const options={throwOnError:true,trust:false,strict:'error',output:'htmlAndMathml'};
function cellTex(node){
 if(node.nodeType===3)return node.textContent.replace(/−/g,'-').replace(/½/g,'\\frac{1}{2}').replace(/λ/g,'\\lambda ').replace(/\b(cos|sin)\b/g,'\\$1 ').replace(/θ/g,'\\theta ').replace(/√\(([^)]+)\)/g,'\\sqrt{$1}').replace(/√([\dA-Za-z]+)/g,'\\sqrt{$1}').replace(/([\d]+)\/(\\sqrt\{[^}]+\}|[\d]+)/g,'\\frac{$1}{$2}');
 if(node.dataset&&node.dataset.tex)return node.dataset.tex;
 return Array.from(node.childNodes).map(cellTex).join('');
}
function select(root,selector){
 return [...(root.matches&&root.matches(selector)?[root]:[]),...root.querySelectorAll(selector)];
}
function render(root){
 for(const el of select(root,'.math-tex')){
  if(el.closest('.math-cells'))continue;
  if(el.dataset.renderedTex===el.dataset.tex&&el.querySelector('.katex'))continue;
  const tex=(el.closest('.state-equation,.qc-equation,.formula')?'\\displaystyle ':'')+el.dataset.tex;
  katex.render(tex,el,options);
  el.dataset.renderedTex=el.dataset.tex;
 }
 for(const el of select(root,'.math-array')){
  const rows=Array.from(el.querySelectorAll('.math-row'));
  if(!rows.length)continue;
  const tex='\\begin{bmatrix}'+rows.map(r=>Array.from(r.children).map(cellTex).join(' & ')).join(' \\\\ ')+'\\end{bmatrix}';
  let output=el.querySelector('.array-render');
  if(output&&output.dataset.renderedTex===tex)continue;
  if(!output){output=document.createElement('span');output.className='array-render';el.appendChild(output);}
  katex.render(tex,output,options);output.dataset.renderedTex=tex;
  // The outer matrix already has a descriptive accessible label.
  output.setAttribute('aria-hidden','true');el.classList.add('katex-array');
 }
}
const observer=new MutationObserver(records=>{
 const roots=new Set();
 for(const record of records){
  const parent=record.target.nodeType===1?record.target:record.target.parentElement;
  if(!parent||parent.closest('svg,script,style,.katex'))continue;
  const formula=parent.closest('.math-array,.math-tex');
  if(formula)roots.add(formula);
  for(const node of record.addedNodes)if(node.nodeType===1)roots.add(node);
 }
 if(!roots.size)return;
 observer.disconnect();
 try{roots.forEach(root=>{if(root.isConnected)render(root);});}
 finally{observe();}
});
function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
render(document);observe();
})();
