/** Frame-local helpers. Content code owns the model; the runner owns communication. */
export function createScope(root, context) {
  const owner = root.ownerDocument, frame = owner.defaultView;
  const observers = new Set(), frames = new Map();
  let nextFrame = 1;
  const tracked = new WeakSet(); let active = true;
  const track = target => {
    if (!target || !target.addEventListener || tracked.has(target)) return target;
    tracked.add(target);
    const add = target.addEventListener.bind(target);
    target.addEventListener = (type, fn, options) => add(type, fn, { ...(typeof options === 'boolean' ? { capture: options } : options), signal: context.signal });
    return target;
  };
  const document = new Proxy(owner, { get(target, key) {
    if (key === 'getElementById') return id => track(root.querySelector('#' + CSS.escape(id)));
    if (key === 'querySelector') return selector => track(root.querySelector(selector));
    if (key === 'querySelectorAll') return selector => Array.from(root.querySelectorAll(selector), track);
    if (key === 'createElement' || key === 'createElementNS') return (...args) => track(target[key](...args));
    if (key === 'addEventListener') return (...args) => track(root).addEventListener(...args);
    const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
  }});
  const schedule = (id, item) => {
    if (!active || context.signal.aborted || item.browserID !== null) return;
    item.browserID = frame.requestAnimationFrame(time => {
      item.browserID = null;
      if (!frames.has(id)) return;
      if (active && !context.signal.aborted) { frames.delete(id); item.callback(time); }
    });
  };
  const requestAnimationFrame = callback => {
    const id = nextFrame++, item = { callback, browserID: null };
    frames.set(id, item); schedule(id, item); return id;
  };
  const cancelAnimationFrame = id => {
    const item = frames.get(id); if (item && item.browserID !== null) frame.cancelAnimationFrame(item?.browserID);
    frames.delete(id);
  };
  const window = new Proxy(frame, {get(target,key){
    if (key === 'addEventListener') return (type, fn, options) => frame.addEventListener(type, fn, {...(typeof options === 'boolean' ? {capture:options} : options), signal:context.signal});
    if (key === 'matchMedia') return query => track(frame.matchMedia(query));
    if (key === 'requestAnimationFrame') return requestAnimationFrame;
    if (key === 'cancelAnimationFrame') return cancelAnimationFrame;
    const value=Reflect.get(target,key,target); return typeof value==='function' && !['$3Dmol','ResizeObserver','MutationObserver'].includes(key) ? value.bind(target):value;
  }});
  const observer = Type => class extends Type { constructor(...args){super(...args);observers.add(this);} };
  const destroy = () => {active=false;frames.forEach(item=>{if(item.browserID!==null)frame.cancelAnimationFrame(item.browserID);});frames.clear();observers.forEach(o=>o.disconnect());observers.clear();};
  context.signal.addEventListener('abort',destroy,{once:true});
  return { document,window,requestAnimationFrame,cancelAnimationFrame,
    ResizeObserver:observer(frame.ResizeObserver),MutationObserver:observer(frame.MutationObserver),
    lifecycle:{setActive(value){
      active=value;
      frames.forEach((item,id)=>{
        if(!active && item.browserID!==null){frame.cancelAnimationFrame(item.browserID);item.browserID=null;}
        else if(active)schedule(id,item);
      });
    },destroy}
  };
}
export async function loadJSON(context, name){
 const response=await fetch(context.assetURL(name),{signal:context.signal});
 if(!response.ok)throw new Error(`실험 데이터 ${name}: HTTP ${response.status}`);
 return response.json();
}
export function addReset(root,signal){
 const inputs=Array.from(root.querySelectorAll('input,select')).map(el=>({el,value:el.value,checked:el.checked}));
 const pressed=Array.from(root.querySelectorAll('button[aria-pressed]')).map(el=>({el,value:el.getAttribute('aria-pressed')}));
 if(!inputs.length&&!pressed.length)return;
 const button=root.ownerDocument.createElement('button');button.type='button';button.className='lab-reset';button.textContent='처음 상태로';
 button.addEventListener('click',()=>{for(const {el,value,checked} of inputs){el.value=value;el.checked=checked;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}for(const {el,value} of pressed)if(el.isConnected&&el.getAttribute('aria-pressed')!==value)el.click();},{signal});root.append(button);
}
export function controls(root, signal, render) {
 const all=Array.from(root.querySelectorAll('input,select'));const initial=all.map(el=>[el,el.value,el.checked]);
 all.forEach(el=>{el.addEventListener('input',render,{signal});el.addEventListener('change',render,{signal});});
 const reset=root.querySelector('[data-reset]');if(reset)reset.addEventListener('click',()=>{initial.forEach(([el,value,checked])=>{el.value=value;el.checked=checked;});render();},{signal});render();
}
export const fmt = (x,n=3) => (Math.abs(x)<10**(-n)/2?0:x).toFixed(n);
export function chart(svg, series, options={}) {
 const w=640,h=300,l=58,r=20,t=22,b=45;const xs=series.flatMap(s=>s.points.map(p=>p[0])),ys=series.flatMap(s=>s.points.map(p=>p[1]));
 const xmin=options.xmin??Math.min(...xs),xmax=options.xmax??Math.max(...xs),ymin=options.ymin??Math.min(0,...ys),ymax=options.ymax??Math.max(...ys);
 const px=x=>l+(x-xmin)/(xmax-xmin||1)*(w-l-r),py=y=>h-b-(y-ymin)/(ymax-ymin||1)*(h-t-b);
 let html=`<title>${options.title||'계산 결과'}</title>`;
 for(let k=0;k<=4;k++){const y=ymin+(ymax-ymin)*k/4;html+=`<path d="M${l},${py(y)}H${w-r}" stroke="var(--line)"/><text x="${l-8}" y="${py(y)+4}" text-anchor="end" fill="var(--ink2)" font-size="12">${fmt(y,2)}</text>`;}
 html+=`<path d="M${l},${t}V${h-b}H${w-r}" fill="none" stroke="var(--ink2)"/>`;
 series.forEach((s,i)=>{const color=s.color||['var(--n)','var(--alpha)','var(--beta)'][i%3];html+=`<path d="${s.points.map(([x,y],j)=>`${j?'L':'M'}${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5"/>`;if(s.point){html+=`<circle cx="${px(s.point[0])}" cy="${py(s.point[1])}" r="5" fill="${color}"/>`;}});
 for(let k=0;k<=4;k++){const x=xmin+(xmax-xmin)*k/4;html+=`<text x="${px(x)}" y="${h-22}" text-anchor="middle" fill="var(--ink2)" font-size="12">${fmt(x,1)}</text>`;}
 html+=`<text x="${w/2}" y="${h-3}" text-anchor="middle" fill="var(--ink2)" font-size="12">${options.xlabel||''}</text>`;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.innerHTML=html;
}
