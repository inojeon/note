const body = document.body;
const root = document.querySelector('[data-experiment-root]') || document.querySelector('.experiment-content');
const status = document.querySelector('.experiment-local-status');
const framed = parent !== window;
const token = new URLSearchParams(location.search).get('instance');
const controller = new AbortController();
let instance, disposed = false, failed = false, active = true;
if (framed) document.documentElement.classList.add('embedded');
const send = (type, extra = {}) => { if (framed) parent.postMessage({ channel: 'learning-experiment', type, token, ...extra }, location.origin); };
function dispose() { if (disposed) return; disposed = true; controller.abort(); try { instance?.setActive?.(false); instance?.destroy?.(); } catch (e) { console.error(e); } }
function fail(error) { if (failed || disposed) return; failed = true; status.textContent = '실험을 불러오지 못했어요. 설명을 읽거나 다시 시도해 주세요.'; console.error(`[${body.dataset.experimentId}]`, error); send('error'); dispose(); }
window.addEventListener('error', event => fail(event.error || new Error(event.message)));
window.addEventListener('unhandledrejection', event => fail(event.reason));
window.addEventListener('pagehide', event => {
  if (event.persisted) instance?.setActive?.(false);
  else dispose();
});
window.addEventListener('pageshow', event => {
  if (event.persisted && !disposed) instance?.setActive?.(active && !document.hidden);
});
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== parent) return;
  const data = event.data;
  if (data?.channel !== 'learning-experiment' || data.token !== token) return;
  if (data.type === 'theme' && ['light', 'dark'].includes(data.theme)) document.documentElement.dataset.theme = data.theme;
  if (data.type === 'active' && typeof data.active === 'boolean') { active = data.active; instance?.setActive?.(active && !document.hidden); }
  if (data.type === 'dispose') dispose();
});
document.addEventListener('visibilitychange', () => instance?.setActive?.(active && !document.hidden));
try {
  if (body.dataset.mathModule) {
    const { observeMath } = await import(body.dataset.mathModule);
    observeMath(root, controller.signal);
  }
  const module = await import(body.dataset.module);
  if (typeof module.mount !== 'function') throw new Error('mount 함수를 찾을 수 없습니다.');
  const mounted = await module.mount(root, { signal: controller.signal, assetURL(path) {
    const base = new URL(body.dataset.assetBase, location.origin); const url = new URL(path, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('실험 폴더 밖의 자산 경로입니다.');
    return url.href;
  } });
  if (disposed) { mounted?.destroy?.(); } else {
    instance = mounted; body.dataset.state = 'ready'; status.textContent = '';
    instance?.setActive?.(active && !document.hidden);
    send('ready');
    let last = 0, frame = 0;
    const reportSize = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
      const height = Math.ceil(document.querySelector('.experiment-content').getBoundingClientRect().height + 24);
      if (Math.abs(height - last) > 2) { last = height; send('resize', { height }); }
    }); };
    const observer = new ResizeObserver(reportSize); observer.observe(document.querySelector('.experiment-content')); reportSize();
    controller.signal.addEventListener('abort', () => { observer.disconnect(); cancelAnimationFrame(frame); }, { once: true });
  }
} catch (error) { fail(error); }
