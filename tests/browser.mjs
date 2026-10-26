import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { runExperimentSemantics, runDynamicMathChecks } from './experiment-semantics.mjs';
const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(process.env.SITE_DIR || 'public');
const prefix = process.env.BASE_PATH || '/';
const engine = process.env.BROWSER || 'chromium';
const reportDir = resolve('test-results', `${engine}-${prefix === '/' ? 'root' : 'subpath'}`);
await mkdir(reportDir, { recursive: true });
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.woff':'font/woff', '.png':'image/png' };
const server = createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith(prefix)) throw new Error('outside base');
    let path = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)) || '.');
    if (path !== root && !path.startsWith(root + sep)) throw new Error('outside root');
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }); res.end(await readFile(path));
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(r => server.listen(0,'127.0.0.1',r));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = `${origin}${prefix}`;
const browser = await playwright[engine].launch({ headless:true, ...(process.env.CHROMIUM_PATH && engine === 'chromium' ? { executablePath:process.env.CHROMIUM_PATH } : {}), ...(engine === 'chromium' ? { args:['--enable-unsafe-swiftshader','--disable-dev-shm-usage'] } : {}) });
const manifest = JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
const results = [];
async function test(name, run) {
  if (process.env.TEST_FILTER && !new RegExp(process.env.TEST_FILTER).test(name)) return;
  const context = await browser.newContext({ viewport:{width:1280,height:900}, colorScheme:'light', reducedMotion:'reduce' });
  const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', req => { if (/^https?:/.test(req.url()) && !req.url().startsWith(origin)) external.push(req.url()); });
  try { await run(page,context,errors); assert.deepEqual(external, [], 'must not request external assets'); results.push({name,status:'pass'}); console.log(`PASS ${name}`); }
  catch (error) { results.push({name,status:'fail',error:String(error.stack || error)}); console.error(`FAIL ${name}: ${error.message}`); await page.screenshot({path:resolve(reportDir,`${name.replace(/[^a-z0-9-]/gi,'-')}.png`),fullPage:true}).catch(()=>{}); }
  finally { await context.close(); }
}
async function goto(page,path) { const response = await page.goto(new URL(path,base).href); assert.equal(response.status(),200); }
async function ready(page) { await page.waitForSelector('body[data-state="ready"]',{timeout:30000}); }
async function hostReady(page) { await page.waitForSelector('[data-experiment][data-state="ready"]',{timeout:30000}); }
async function settled(page) {
  // Let lazy frames start, then finish them before the next navigation. WebKit
  // reports an import rejected by navigation as an outgoing-page console error.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>!document.querySelector('[data-experiment][data-state="loading"]'),null,{timeout:30000});
}
async function noOverflow(page) { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'page has horizontal overflow'); }

try {
await test('reading-search-preview-theme', async (page, context, errors) => {
  await goto(page,''); assert.equal(await page.locator('.path-card').count(),manifest.paths.length);
  await page.screenshot({path:resolve(reportDir,'home.png'),fullPage:true});
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some(x=>x.name.endsWith('/search.json'))),false);
  await page.click('[data-open-search]'); await page.fill('#search-input','벡터');
  await page.waitForSelector('.search-results a'); assert((await page.locator('.search-results a').first().getAttribute('href')).endsWith('/notes/vector/'));
  await page.fill('#search-input','벡터 존재하지않는검색어'); await page.waitForFunction(() => document.querySelector('.search-status').textContent.includes('없어요'));
  await page.keyboard.press('Escape');
  await goto(page,'notes/vector/'); await hostReady(page);
  assert(await page.locator('.katex .katex-mathml math').count()>0, 'build must include MathML');
  assert.equal(await page.locator('.katex-error').count(),0);
  const trigger=page.locator('button.concept-trigger').first(); await trigger.hover();
  await page.waitForSelector('#concept-preview:popover-open'); await page.locator('#concept-preview').hover();
  assert(await page.locator('#concept-preview').isVisible());
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#concept-preview').isVisible(),false);
  await trigger.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className),'concept-read');
  await page.keyboard.press('Escape'); assert.equal(await trigger.evaluate(el => el === document.activeElement),true);
  await page.click('[data-theme-toggle]');
  await page.waitForFunction(()=>document.querySelector('iframe').contentDocument.documentElement.dataset.theme==='dark');
  await page.evaluate(()=>scrollTo(0,0)); await settled(page);
  await page.screenshot({path:resolve(reportDir,'vector-dark.png'),fullPage:true});
  await page.click('[data-theme-toggle]');
  await page.screenshot({path:resolve(reportDir,'vector.png'),fullPage:true});
  await page.setViewportSize({width:375,height:812}); await noOverflow(page);
  await trigger.click(); await page.waitForSelector('#concept-preview:popover-open');
  const box=await page.locator('#concept-preview').boundingBox(); assert(box.x>=0 && box.x+box.width<=375);
  await page.locator('[data-close-card]').click();
  await page.evaluate(()=>scrollTo(0,0)); await settled(page);
  await page.screenshot({path:resolve(reportDir,'vector-mobile.png'),fullPage:true});
  await page.setViewportSize({width:640,height:450}); // 1280px desktop at 200% browser zoom: CSS viewport reflow
  await noOverflow(page);
  assert.deepEqual(errors,[]);
});

await test('all-experiments-interact-and-fit',async(page,context,errors)=>{
  const list=engine==='webkit' ? manifest.experiments.filter(x=>['vector-direction','diagonalization','born-oppenheimer','orbital-volume'].includes(x.id)) : manifest.experiments;
  for(const item of list){
    const start=errors.length; await goto(page,item.url); await ready(page);
    await page.locator('.experiment-content').evaluate(root=>{
      for(const el of root.querySelectorAll('input[type="range"]')){el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
      for(const el of root.querySelectorAll('select')){el.selectedIndex=el.options.length-1;el.dispatchEvent(new Event('change',{bubbles:true}));}
    });
    const action=page.locator('.experiment-content button:visible:enabled:not(.lab-reset):not([data-reset])').filter({hasNotText:/처음|초기|리셋|다시 시작/}).first();
    if(await action.count())await action.click();
    await page.evaluate(()=>new Promise(requestAnimationFrame));
    await page.setViewportSize({width:320,height:740}); await noOverflow(page);
    assert.equal(await page.locator('body').getAttribute('data-state'),'ready',item.id);
    assert.equal(await page.locator('.experiment-content svg').evaluateAll(nodes=>nodes.some(el=>/NaN|Infinity/.test(el.innerHTML))),false,item.id+' invalid SVG');
    assert.deepEqual(errors.slice(start),[],item.id);
    await page.setViewportSize({width:1280,height:900});
  }
});

await test('vector-known-values-and-reset',async(page,context,errors)=>{
  await goto(page,'experiments/vector-direction/');await ready(page);
  const known=[[0,1,0],[90,0,1],[180,-1,0],[270,0,-1],[360,1,0]];
  for(const [angle,x,y] of known){await page.locator('#angle').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},angle);
    const point=await page.locator('[data-plot]').evaluate(el=>[Number(el.dataset.componentX),Number(el.dataset.componentY)]);
    assert(Math.abs(point[0]-x)<1e-6);assert(Math.abs(point[1]-y)<1e-6);assert(Math.abs(point[0]**2+point[1]**2-1)<1e-6);
  }
  await page.getByRole('button',{name:/처음/}).click();assert.equal(await page.locator('#angle').inputValue(),'45');
  await page.locator('#angle').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#angle').inputValue(),'46');
  assert.deepEqual(errors,[]);
});
await test('scientific-known-results',async(page,context,errors)=>{
  const result=await runExperimentSemantics(page,{baseURL:base});assert(result.checks>=40);assert.deepEqual(errors,[]);
});
await test('dynamic-formulas-update',async(page,context,errors)=>{
  const result=await runDynamicMathChecks(page,{baseURL:base});assert(result.formulas>=40);assert.deepEqual(errors,[]);
});
await test('all-notes-mobile-and-assets',async(page,context,errors)=>{
  await page.setViewportSize({width:320,height:740});
  for(const note of manifest.notes){await goto(page,note.url);await settled(page);await noOverflow(page);assert.equal(await page.locator('.note-heading h1').count(),1,note.id);assert.equal(await page.locator('.katex-error').count(),0,note.id);
    assert.equal(await page.locator('script[src*="vendor/"]').count(),0,'ordinary notes must not load experiment libraries');
  }
  assert.deepEqual(errors,[]);
});
await test('system-dark-and-back-forward',async(page,context,errors)=>{
  await page.emulateMedia({colorScheme:'dark'});await goto(page,'experiments/vector-direction/');await ready(page);
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  const color=await page.locator('body').evaluate(el=>getComputedStyle(el).color);assert.notEqual(color,'rgb(32, 36, 42)');
  await page.locator('#angle').evaluate(el=>{el.value=90;el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
  await page.locator('#angle').evaluate(el=>{el.value=180;el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('[data-x]').innerText(),'-1.000');
  await goto(page,'notes/vector/');await hostReady(page);await goto(page,'notes/basis/');await page.goBack();await hostReady(page);
  const frame=page.frames().find(f=>f.url().includes('/experiments/vector-direction/'));
  await frame.locator('#angle').evaluate(el=>{el.value=180;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await frame.locator('[data-x]').innerText(),'-1.000');
  assert.deepEqual(errors,[]);
});

await test('plain-links-without-javascript',async(page,context)=>{
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();
  try { await goto(p,'notes/vector/');const link=p.locator('a.concept-link').first();assert(await link.isVisible());assert((await link.getAttribute('href')).includes('/notes/'));assert(await p.locator('.experiment-guide[open]').count()>0);assert.equal(await p.locator('iframe').count(),0); }
  finally {await nojs.close();}
});

await test('import-failure-and-retry',async(page)=>{
  const pattern='**/experiments/vector-direction/module*.js';await page.route(pattern,route=>route.abort());
  await goto(page,'notes/vector/');await page.waitForSelector('[data-experiment][data-state="error"]');
  assert.equal(await page.locator('iframe').count(),0);assert(await page.locator('.experiment-guide[open]').isVisible());assert(await page.locator('.note-heading h1').isVisible());
  await page.unroute(pattern);await page.locator('.experiment-retry').click();await hostReady(page);
});
await test('data-failure-and-retry',async(page)=>{
  const pattern='**/experiments/born-oppenheimer/*.json';await page.route(pattern,route=>route.abort());
  await goto(page,'notes/born-oppenheimer/');await page.locator('[data-experiment]').first().scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-experiment][data-state="error"]');assert(await page.locator('.experiment-guide[open]').first().isVisible());
  await page.unroute(pattern);await page.locator('.experiment-retry').first().click();await hostReady(page);
});
await test('initialization-failure-and-retry',async(page)=>{
  const pattern='**/experiments/vector-direction/module*.js';await page.route(pattern,route=>route.fulfill({contentType:'text/javascript',body:'export function mount(){throw new Error("intentional test failure");}'}));
  await goto(page,'notes/vector/');await page.waitForSelector('[data-experiment][data-state="error"]');
  assert(await page.locator('.experiment-guide[open]').isVisible());
  await page.unroute(pattern);await page.locator('.experiment-retry').click();await hostReady(page);
});
await test('duplicate-instances-and-cancelled-mount',async(page)=>{
  await page.route('**/notes/vector/',async route=>{const response=await route.fetch();const body=await response.text();await route.fulfill({response,body:body.replace('</body>','<script>const one=document.querySelector("[data-experiment]");one.after(one.cloneNode(true));</script></body>')});});
  await goto(page,'notes/vector/');await page.waitForSelector('[data-experiment][data-state="ready"]');
  await page.locator('[data-experiment]').nth(1).scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('[data-experiment][data-state="ready"]').length===2);
  const frames=page.frames().filter(f=>f.url().includes('/experiments/vector-direction/'));assert.equal(frames.length,2);
  await frames[0].locator('#angle').evaluate(el=>{el.value=180;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await frames[1].locator('#angle').inputValue(),'45');
  await page.unroute('**/notes/vector/');
  await page.route('**/experiments/vector-direction/module*.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function mount(root,{signal}){window.__started=true;await new Promise(r=>setTimeout(r,500));return {destroy(){window.__destroyed=true;},setActive(){}};}'}));
  await goto(page,'notes/vector/');await page.waitForFunction(()=>document.querySelector('iframe')?.contentWindow.__started);
  await page.evaluate(()=>{const f=document.querySelector('iframe');const token=new URL(f.src).searchParams.get('instance');f.contentWindow.postMessage({channel:'learning-experiment',token,type:'dispose'},location.origin);});
  await page.waitForFunction(()=>document.querySelector('iframe')?.contentWindow.__destroyed);
  assert.notEqual(await page.locator('[data-experiment]').getAttribute('data-state'),'ready');
});
await test('webgl-unavailable-fallback',async(page)=>{
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(/webgl/i.test(type))return null;return get.call(this,type,...args);};});
  await goto(page,'experiments/born-oppenheimer/');await ready(page);
  assert(await page.locator('#boh2-render-status').innerText());assert(await page.locator('#boh2-slice-panel[open]').isVisible());
  await page.locator('input[type="range"]').first().evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.locator('body').getAttribute('data-state'),'ready');
});
await test('legacy-addresses',async(page,context,errors)=>{
  const cases=[['concept-vector.html','notes/vector/'],['concepts.html#qubit','notes/qubit/'],['quantum-chemistry.html#vector','notes/vector/'],['learning-maps.html#vqe','paths/vqe/'],['relations.html?graph-note=hamiltonian','notes/hamiltonian/'],['relations.html?graph-path=quantum-computing','paths/quantum-computing/'],['relations.html?graph-view=path&graph-path=vqe-energy&graph-note=rotation-gate#relations','paths/vqe/'],['relations.html?graph-view=path&graph-path=sqd-quantum','paths/sqd/'],['relations.html?graph-path=define-hamiltonian','paths/quantum-chemistry/'],['#sqd-linear-algebra','notes/hamiltonian/'],['01-pyscf.html#basis','notes/01-pyscf/#basis'],['index-main.html','']];
  for(const [old,target]of cases){await goto(page,old);await page.waitForURL(new URL(target,base).href);await settled(page);}
  assert.deepEqual(errors,[]);
});
} finally {
await writeFile(resolve(reportDir,'report.json'),JSON.stringify(results,null,2)+'\n');await browser.close();await new Promise(r=>server.close(r));
}
const failed=results.filter(x=>x.status==='fail');console.log(`${results.length-failed.length}/${results.length} suites passed (${engine}, ${prefix})`);if(failed.length)process.exitCode=1;
