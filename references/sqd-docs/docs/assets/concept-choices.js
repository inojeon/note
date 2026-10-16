/* Visible button choices share values and events with existing experiment models. */
(function(){
'use strict';
if(!document.querySelectorAll||!document.createElement)return;
const controls=[];
for(const select of document.querySelectorAll('select')){
 if(select.multiple||select.dataset.buttonChoices)continue;
 const label=select.labels&&select.labels[0],group=document.createElement('div');
 group.className='choice-buttons';group.dataset.choiceFor=select.id;group.setAttribute('role','group');
 if(label){if(!label.id)label.id=select.id+'-choice-label';group.setAttribute('aria-labelledby',label.id);}
 else group.setAttribute('aria-label',select.getAttribute('aria-label')||'선택');
 const buttons=Array.from(select.options).map(option=>{
  const button=document.createElement('button');button.type='button';
  button.textContent=option.textContent.trim();button.dataset.value=option.value;
  button.addEventListener('click',()=>{
   if(select.value===option.value)return;
   select.value=option.value;
   select.dispatchEvent(new Event('input',{bubbles:true}));
   select.dispatchEvent(new Event('change',{bubbles:true}));sync();
  });group.appendChild(button);return button;
 });
 function sync(){buttons.forEach((button,i)=>{
  button.setAttribute('aria-pressed',String(select.value===select.options[i].value));
  button.disabled=select.disabled||select.options[i].disabled;
 });}
 // Buttons outside labels avoid activating a second control on click.
 const anchor=label&&label.contains(select)?label:select;
 anchor.insertAdjacentElement('afterend',group);
 select.hidden=true;select.dataset.buttonChoices='true';
 select.addEventListener('input',sync);select.addEventListener('change',sync);
 controls.push(sync);sync();
}
if(!controls.length)return;
// Reset/preset controls may assign select.value directly.
for(const type of ['click','input','change','reset'])document.addEventListener(type,()=>{
 queueMicrotask(()=>controls.forEach(sync=>sync()));
});
})();
