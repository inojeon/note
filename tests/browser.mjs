import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createRequire } from 'node:module';
import { runExperimentSemantics, runDynamicMathChecks } from './experiment-semantics.mjs';
import { runFoundationSemantics } from './foundation-semantics.mjs';
import { runBasisSemantics } from './basis-semantics.mjs';
import { runMathPreparationSemantics } from './math-preparation-semantics.mjs';
import { runChemistryStateSemantics } from './chemistry-state-semantics.mjs';
import { runChemistryEnergySemantics } from './chemistry-energy-semantics.mjs';
import { runQuantumPathSemantics } from './quantum-path-semantics.mjs';
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
const groupedPaths = new Set(manifest.paths.flatMap(path => path.paths || []));
const topPaths = manifest.paths.filter(path => !groupedPaths.has(path.id));
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
async function hostReady(page) { await page.locator('[data-experiment]').first().scrollIntoViewIfNeeded();await page.waitForSelector('[data-experiment][data-state="ready"]',{timeout:30000}); }
async function settled(page) {
  // Let lazy frames start, then finish them before the next navigation. WebKit
  // reports an import rejected by navigation as an outgoing-page console error.
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.waitForFunction(()=>!document.querySelector('[data-experiment][data-state="loading"]'),null,{timeout:30000});
}
async function noOverflow(page) { assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'page has horizontal overflow'); }

try {
await test('reading-search-preview-theme', async (page, context, errors) => {
  await goto(page,''); assert.equal(await page.locator('.path-card').count(),topPaths.length);
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
  const list=engine==='webkit' ? manifest.experiments.filter(x=>['vector-direction','vector-components','vector-operations','linear-combination','span-explorer','subspace-closure','linear-independence','basis-coordinates','dimension-explorer','inner-product-components','diagonalization','born-oppenheimer','orbital-volume','atom-electron-count','probability','functions-and-density','angles-and-rotation','complex-numbers','complex-inner-product','h2-state-energy','molecular-orbital','rotation-gate','entanglement','sqd-subspace'].includes(x.id)) : manifest.experiments;
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
await test('foundation-known-values',async(page,context,errors)=>{
  const result=await runFoundationSemantics(page,{baseURL:base});
  assert.equal(result.experiments,5,'all five foundation experiments need semantic checks');
  assert(result.checks>=100,'must check known results, span sets, closure counterexamples and resets');
  assert.deepEqual(errors,[]);
});
await test('foundation-learning-path',async(page,context,errors)=>{
  const notes=['vector','vector-operations','linear-combination','span','subspace'];
  const experiments=['vector-components','vector-operations','linear-combination','span-explorer','subspace-closure'];
  const followNote=async(link,id)=>Promise.all([
    page.waitForURL(new URL(`notes/${id}/`,base).href,{waitUntil:'domcontentloaded'}),
    link.click(),
  ]);
  await goto(page,'paths/linear-algebra/');
  const steps=await page.locator('.learning-steps>li>a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  assert.deepEqual(steps,notes.map(id=>`${prefix}notes/${id}/`),'the beginner path has five notes in prerequisite order');
  await followNote(page.locator('.learning-steps>li>a').first(),notes[0]);
  for(let i=0;i<notes.length;i++){
    const id=notes[i];
    assert.equal(page.url(),new URL(`notes/${id}/`,base).href);
    // WebKit can commit the URL before the incoming document is rendered.
    await page.locator('.note-heading h1').waitFor({state:'visible'});
    assert.equal(await page.locator('.note-heading h1').count(),1,id);
    assert(await page.locator('.prose .katex-mathml math').count()>0,`${id}: equations need accessible MathML`);
    assert.equal(await page.locator('.katex-error').count(),0,id);
    const answers=page.locator('details.learning-answer');
    assert(await answers.count()>0,`${id}: a question must have a revealable answer`);
    assert.equal(await answers.evaluateAll(nodes=>nodes.some(node=>node.open)),false,`${id}: answers start closed`);
    const summary=answers.first().locator('summary');
    await summary.focus();await page.keyboard.press('Enter');
    assert.equal(await answers.first().evaluate(node=>node.open),true,`${id}: Enter opens the answer`);
    await page.keyboard.press('Space');
    assert.equal(await answers.first().evaluate(node=>node.open),false,`${id}: Space closes the answer`);
    const host=page.locator(`[data-experiment="${experiments[i]}"]`);
    assert.equal(await host.count(),1,`${id}: its experiment is present once`);
    await host.scrollIntoViewIfNeeded();await hostReady(page);
    const frame=page.frames().find(item=>item.url().includes(`/experiments/${experiments[i]}/`));
    assert(frame,`${id}: experiment frame exists`);
    if(experiments[i]==='vector-operations')await frame.locator('[data-mode="scaling"]').click();
    for(const width of [320,640]){
      await page.setViewportSize({width,height:800});
      await noOverflow(page);
      assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${id}: frame fits ${width}px`);
      const slider=frame.locator('input[type="range"]:visible:enabled').first();
      const before=await slider.inputValue();
      const direction=Number(before)>=Number(await slider.getAttribute('max'))?'ArrowLeft':'ArrowRight';
      await slider.focus();await page.keyboard.press(direction);
      assert.notEqual(await slider.inputValue(),before,`${id}: range input works with the keyboard`);
    }
    await page.locator('[data-theme-toggle]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
    await frame.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
    await summary.focus();await page.keyboard.press('Enter');
    const focused=await summary.evaluate(node=>({active:node===document.activeElement,outline:getComputedStyle(node).outlineStyle,width:parseFloat(getComputedStyle(node).outlineWidth)}));
    assert(focused.active&&focused.outline!=='none'&&focused.width>0,`${id}: keyboard focus is visible in dark mode`);
    await page.keyboard.press('Enter');
    await page.screenshot({path:resolve(reportDir,`foundation-${id}-dark.png`),fullPage:true});
    await page.locator('[data-theme-toggle]').click();
    await page.setViewportSize({width:1280,height:900});
    const navigation=page.locator('.path-navigation').filter({has:page.locator(`a.path-name[href="${prefix}paths/linear-algebra/"]`)});
    assert.equal(await navigation.count(),1,`${id}: foundation path navigation is available`);
    if(i>0)assert.equal(await navigation.locator(`a[href="${prefix}notes/${notes[i-1]}/"]`).count(),1,`${id}: previous note matches the path`);
    if(i<notes.length-1){
      await settled(page);
      await followNote(navigation.locator(`a[href="${prefix}notes/${notes[i+1]}/"]`),notes[i+1]);
    }
  }
  assert.deepEqual(errors,[]);
});
await test('path-groups-and-basis-learning',async(page,context,errors)=>{
  const ids=['linear-independence','basis','dimension','inner-product'];
  const labs=['linear-independence','basis-coordinates','dimension-explorer','inner-product-components'];
  const links=selector=>page.locator(selector).evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  await goto(page,'');
  assert.equal(await page.locator('.home-intro .primary-link').getAttribute('href'),`${prefix}paths/linear-algebra/`);
  const expectedTop=topPaths.map(path=>path.url).sort();
  assert.deepEqual((await links('.path-card')).sort(),expectedTop,'home hides grouped child paths');
  await goto(page,'paths/');
  assert.deepEqual((await links('.path-grid .path-card')).sort(),expectedTop,'path index shows the same top-level paths');
  await goto(page,'paths/mathematics/');
  assert.deepEqual(await links('.learning-paths>li>a'),['linear-algebra','basis-and-coordinates','matrices-and-eigenvectors','quantum-math','subspace-approximation'].map(id=>`${prefix}paths/${id}/`));
  for(const width of [320,640,1280]){await page.setViewportSize({width,height:800});await noOverflow(page);}
  await goto(page,'paths/basis-and-coordinates/');
  assert.deepEqual(await links('.learning-steps>li>a'),ids.map(id=>`${prefix}notes/${id}/`));
  assert.equal(await page.locator(`.breadcrumb a[href="${prefix}paths/mathematics/"]`).count(),1);
  for(let i=0;i<ids.length;i++){
    await goto(page,`notes/${ids[i]}/`);
    await page.locator('.note-heading h1').waitFor({state:'visible'});
    assert(await page.locator('.prose .katex-mathml math').count()>0,`${ids[i]} has build-time equations`);
    assert.equal(await page.locator('.katex-error').count(),0);
    const answers=page.locator('details.learning-answer');
    assert(await answers.count()>=2,`${ids[i]} has calculation and reasoning answers`);
    assert.equal(await answers.evaluateAll(nodes=>nodes.some(node=>node.open)),false);
    const summary=answers.first().locator('summary');
    await summary.focus();await page.keyboard.press('Enter');
    assert(await answers.first().evaluate(node=>node.open));
    await page.keyboard.press('Space');
    assert.equal(await answers.first().evaluate(node=>node.open),false);
    const host=page.locator(`[data-experiment="${labs[i]}"]`);
    await host.scrollIntoViewIfNeeded();
    await page.waitForFunction(id=>document.querySelector(`[data-experiment="${id}"]`)?.dataset.state==='ready',labs[i]);
    const frame=page.frames().find(f=>f.url().includes(`/experiments/${labs[i]}/`));
    assert(frame,`${labs[i]} iframe exists`);
    for(const width of [320,640]){
      await page.setViewportSize({width,height:800});await noOverflow(page);
      assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${labs[i]} fits ${width}px`);
    }
    const input=frame.locator('input[type="range"]:visible:enabled').first();
    if(await input.count()){
      const before=await input.inputValue();
      await input.focus();await page.keyboard.press(Number(before)>=Number(await input.getAttribute('max'))?'ArrowLeft':'ArrowRight');
      assert.notEqual(await input.inputValue(),before,`${labs[i]} keyboard input`);
    }else{
      const checkbox=frame.locator('input[type="checkbox"]:visible:enabled').first();
      if(await checkbox.count()){
        const before=await checkbox.isChecked();await checkbox.focus();await page.keyboard.press('Space');
        assert.notEqual(await checkbox.isChecked(),before);
      }else{
        const option=frame.locator('button[aria-pressed="false"]:visible:enabled').first();
        assert(await option.count()>0,`${labs[i]} has keyboard controls`);
        await option.focus();await page.keyboard.press('Enter');
        assert.equal(await option.getAttribute('aria-pressed'),'true');
      }
    }
    await page.locator('[data-theme-toggle]').click();
    await frame.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
    await page.screenshot({path:resolve(reportDir,`basis-${ids[i]}-dark-mobile.png`),fullPage:true});
    await page.locator('[data-theme-toggle]').click();
    await page.setViewportSize({width:1280,height:900});
    const nav=page.locator('.path-navigation').filter({has:page.locator(`.path-name[href="${prefix}paths/basis-and-coordinates/"]`)});
    assert.equal(await nav.count(),1);
    assert.equal(await nav.locator(`.path-parent a[href="${prefix}paths/mathematics/"]`).count(),1);
    if(i>0)assert.equal(await nav.locator(`a[href="${prefix}notes/${ids[i-1]}/"]`).count(),1);
    if(i<ids.length-1)assert.equal(await nav.locator(`a[href="${prefix}notes/${ids[i+1]}/"]`).count(),1);
    await settled(page);
  }
  assert.deepEqual(errors,[]);
});
await test('complete-curriculum-navigation',async(page,context,errors)=>{
  for(const group of manifest.paths.filter(p=>p.paths)){
    await goto(page,group.url);
    const links=await page.locator('.learning-paths>li>a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')));
    assert.deepEqual(links,group.paths.map(id=>`${prefix}paths/${id}/`));
  }
  for(const path of manifest.paths.filter(p=>p.steps)){
    await goto(page,path.url);
    assert.deepEqual(await page.locator('.learning-steps>li>a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href'))),path.steps.map(id=>`${prefix}notes/${id}/`));
    const first=path.steps[0];await goto(page,`notes/${first}/`);await settled(page);
    const nav=page.locator('.path-navigation').filter({has:page.locator(`a.path-name[href="${path.url}"]`)});
    assert.equal(await nav.count(),1,path.id);
    if(path.steps.length>1)assert.equal(await nav.locator(`a[href="${prefix}notes/${path.steps[1]}/"]`).count(),1,path.id);
  }
  assert.deepEqual(errors,[]);
});
await test('basis-known-values',async(page,context,errors)=>{
  const result=await runBasisSemantics(page,{baseURL:base});
  assert.equal(result.experiments,4);
  assert(result.checks>=30,'known results, geometry invariants, boundary cases and reset');
  assert.deepEqual(errors,[]);
});
await test('math-preparation-known-values',async(page,context,errors)=>{
  const result=await runMathPreparationSemantics(page,{baseURL:base}); assert(result.checks>=50);assert.deepEqual(errors,[]);
});
await test('chemistry-states-and-atoms-known-values',async(page,context,errors)=>{
  const result=await runChemistryStateSemantics(page,{baseURL:base}); assert(result.checks>=90);assert.deepEqual(errors,[]);
});
await test('chemistry-molecules-and-energy-known-values',async(page,context,errors)=>{
  const result=await runChemistryEnergySemantics(page,{baseURL:base}); assert(result.checks>=80);assert.deepEqual(errors,[]);
});
await test('quantum-vqe-sqd-known-values',async(page,context,errors)=>{
  const result=await runQuantumPathSemantics(page,{baseURL:base}); assert.equal(result.experiments,24); assert(result.checks>=140);assert.deepEqual(errors,[]);
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
  const frame=page.frames().find(f=>f.url().includes('/experiments/vector-components/'));
  await frame.locator('[data-input="x"]').evaluate(el=>{el.value=-2;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await frame.locator('[data-result]').getAttribute('data-result-x'),'-2');
  assert.deepEqual(errors,[]);
});

await test('plain-links-without-javascript',async(page,context)=>{
  const nojs=await browser.newContext({javaScriptEnabled:false});const p=await nojs.newPage();
  try { for(const id of ['vector','span','subspace']){
    await goto(p,`notes/${id}/`);const link=p.locator('a.concept-link').first();assert(await link.isVisible(),id);assert((await link.getAttribute('href')).includes('/notes/'),id);
    assert(await p.locator('.prose .katex-mathml math').count()>0,`${id}: equations remain available without JavaScript`);
    const guide=p.locator('.experiment-guide[open]');assert.equal(await guide.count(),1,id);assert((await guide.innerText()).trim().length>100,`${id}: fallback explains the experiment`);assert.equal(await p.locator('iframe').count(),0,id);
    const answer=p.locator('details.learning-answer').first();assert.equal(await answer.evaluate(node=>node.open),false);await answer.locator('summary').click();assert.equal(await answer.evaluate(node=>node.open),true,`${id}: answers also open without JavaScript`);
  }
  }
  finally {await nojs.close();}
});

await test('import-failure-and-retry',async(page)=>{
  const pattern='**/experiments/vector-components/module*.js';await page.route(pattern,route=>route.abort());
  await goto(page,'notes/vector/');await page.locator('[data-experiment]').first().scrollIntoViewIfNeeded();await page.waitForSelector('[data-experiment][data-state="error"]');
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
  const pattern='**/experiments/vector-components/module*.js';await page.route(pattern,route=>route.fulfill({contentType:'text/javascript',body:'export function mount(){throw new Error("intentional test failure");}'}));
  await goto(page,'notes/vector/');await page.locator('[data-experiment]').first().scrollIntoViewIfNeeded();await page.waitForSelector('[data-experiment][data-state="error"]');
  assert(await page.locator('.experiment-guide[open]').isVisible());
  await page.unroute(pattern);await page.locator('.experiment-retry').click();await hostReady(page);
});
await test('duplicate-instances-and-cancelled-mount',async(page)=>{
  await page.route('**/notes/vector/',async route=>{const response=await route.fetch();const body=await response.text();await route.fulfill({response,body:body.replace('</body>','<script>const one=document.querySelector("[data-experiment]");one.after(one.cloneNode(true));</script></body>')});});
  await goto(page,'notes/vector/');await hostReady(page);
  await page.locator('[data-experiment]').nth(1).scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('[data-experiment][data-state="ready"]').length===2);
  const frames=page.frames().filter(f=>f.url().includes('/experiments/vector-components/'));assert.equal(frames.length,2);
  await frames[0].locator('[data-input="x"]').evaluate(el=>{el.value=-2;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await frames[0].locator('[data-result]').getAttribute('data-result-x'),'-2');assert.equal(await frames[1].locator('[data-result]').getAttribute('data-result-x'),'3');
  await page.unroute('**/notes/vector/');
  await page.route('**/experiments/vector-components/module*.js',route=>route.fulfill({contentType:'text/javascript',body:'export async function mount(root,{signal}){window.__started=true;await new Promise(r=>setTimeout(r,500));return {destroy(){window.__destroyed=true;},setActive(){}};}'}));
  await goto(page,'notes/vector/');await page.locator('[data-experiment]').first().scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('iframe')?.contentWindow.__started);
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
