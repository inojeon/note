(function(){
const triggers=Array.from(document.querySelectorAll('.term-trigger'));if(!triggers.length)return;let active=null,pinned=false,timer,suppressFocus=false;
function position(){
if(!active)return;
const box=document.getElementById(active.getAttribute('aria-controls')),rect=active.getBoundingClientRect(),gap=12;
box.style.width=Math.min(380,window.innerWidth-32)+'px';
box.style.maxHeight=(window.innerHeight-32)+'px';
const height=box.getBoundingClientRect().height,below=window.innerHeight-16-rect.bottom-gap,above=rect.top-gap-16;
const useBelow=height<=below||(height>above&&below>=above);
box.style.maxHeight=Math.max(80,useBelow?below:above)+'px';
const bounds=box.getBoundingClientRect();
box.style.left=Math.max(16,Math.min(rect.left,window.innerWidth-bounds.width-16))+'px';
box.style.top=Math.max(16,Math.min(useBelow?rect.bottom+gap:rect.top-gap-bounds.height,window.innerHeight-bounds.height-16))+'px';
}
function close(){clearTimeout(timer);const previous=active;active=null;pinned=false;suppressFocus=true;if(previous){previous.setAttribute('aria-expanded','false');const box=document.getElementById(previous.getAttribute('aria-controls'));if(box.matches(':popover-open'))box.hidePopover()}queueMicrotask(()=>{suppressFocus=false});}
function open(button){clearTimeout(timer);if(active!==button){close();active=button}const box=document.getElementById(button.getAttribute('aria-controls'));if(!box.matches(':popover-open'))box.showPopover();button.setAttribute('aria-expanded','true');position();}
function scheduleClose(){clearTimeout(timer);timer=setTimeout(()=>{if(!pinned)close()},160)}
triggers.forEach(button=>{const box=document.getElementById(button.getAttribute('aria-controls'));
button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')open(button)});
button.addEventListener('pointerleave',scheduleClose);
button.addEventListener('focus',()=>{if(!suppressFocus&&button.matches(':focus-visible'))open(button)});
button.addEventListener('blur',()=>{if(!pinned)scheduleClose()});
button.addEventListener('click',event=>{event.preventDefault();if(active===button&&pinned)close();else{open(button);pinned=true}});
box.addEventListener('pointerenter',()=>clearTimeout(timer));box.addEventListener('pointerleave',scheduleClose);
box.addEventListener('toggle',()=>{if(!box.matches(':popover-open')){button.setAttribute('aria-expanded','false');if(active===button){active=null;pinned=false}}});
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
document.addEventListener('click',event=>{if(active&&!active.contains(event.target)&&!document.getElementById(active.getAttribute('aria-controls')).contains(event.target))close()});
window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});window.addEventListener('hashchange',close);
})();
