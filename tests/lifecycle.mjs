import assert from 'node:assert/strict';
import { createScope } from '../site/assets/experiment-shared.js';

// A deterministic browser frame clock tests observable lifecycle behavior without
// duplicating a model's formula or relying on the host machine's refresh rate.
const queued = new Map(); let next = 0;
class Observer { disconnect() {} }
const frame = {
  requestAnimationFrame(callback) { const id=++next; queued.set(id,callback); return id; },
  cancelAnimationFrame(id) { queued.delete(id); },
  ResizeObserver:Observer, MutationObserver:Observer
};
const controller=new AbortController();
const scope=createScope({ownerDocument:{defaultView:frame}},{signal:controller.signal});
let ticks=0;
function step(){ticks++;scope.requestAnimationFrame(step);}
function repaint(){const callbacks=[...queued.values()];queued.clear();for(const callback of callbacks)callback(16);}
scope.requestAnimationFrame(step);repaint();assert.equal(ticks,1);
scope.lifecycle.setActive(false);repaint();assert.equal(ticks,1,'offscreen animation must pause');
scope.lifecycle.setActive(true);repaint();assert.equal(ticks,2,'returning onscreen must resume');
scope.lifecycle.setActive(true);repaint();assert.equal(ticks,3,'repeated activation must not duplicate the animation');
controller.abort();scope.lifecycle.setActive(true);repaint();assert.equal(ticks,3,'disposed instances must never resume');
scope.lifecycle.destroy();scope.lifecycle.destroy();assert.equal(queued.size,0);
console.log('PASS: animation pause, resume, repeated activation and abort cleanup');
