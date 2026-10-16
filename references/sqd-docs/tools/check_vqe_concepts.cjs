// Build enrich_concepts.py and build_concepts.py before running this harness.
// PLAYWRIGHT_MODULE and CHROMIUM_PATH may point to preinstalled dependencies.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const slugs=['vqe','energy-expectation','ansatz','parameterized-circuit','pauli-decomposition','measurement-shots','classical-optimization','vqe-algorithm','fermion-qubit','vqe-hydrogen'];
const near=(actual,expected,tolerance=1e-5)=>{assert(String(actual).trim()!=='');actual=Number(actual);assert(Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance,`${actual} != ${expected} (±${tolerance})`);};
async function energyChecks({page,go}){
 const num=async id=>Number((await page.locator('#ve-'+id).innerText()).replace('%',''));
 // Solve H v = E v independently, normalize its real ground eigenvector,
 // then project each trial vector onto it rather than copying the UI formula.
 const a=.8,b=-.5,d=1.2,lo=(a+d-Math.sqrt((a-d)**2+4*b*b))/2,hi=a+d-lo;
 const norm=Math.hypot(b,lo-a),g=[b/norm,(lo-a)/norm];
 await go('energy-expectation');
 for(const angle of [-180,-90,0,45,90,180]){
  await page.locator('#ve-angle').fill(String(angle));await page.locator('#ve-angle').dispatchEvent('input');
  const t=angle*Math.PI/360,c=Math.cos(t),s=Math.sin(t),e=c*(a*c+b*s)+s*(b*c+d*s),p=(g[0]*c+g[1]*s)**2;
  near(await num('energy'),e,.00000051);near(await num('gap'),e-lo,.00000051);
  near(await num('p-low'),100*p,.00051);near(await num('p-high'),100*(1-p),.00051);
 }
 await page.locator('#ve-ground').click();near(await num('energy'),lo,.00000051);near(await num('p-low'),100,.00051);near(await num('gap'),0,.00000051);
 await page.locator('#ve-excited').click();near(await num('energy'),hi,.00000051);near(await num('p-high'),100,.00051);
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const errors=[],requests=[];
 try{
  const context=await browser.newContext({hasTouch:true});
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url());requests.push(url.href);
   const name=url.pathname.slice(1);
   if(url.origin!=='http://concept-reader.test'||!['quantum-chemistry.html','concepts.html'].includes(name)){
    errors.push('Unexpected external dependency: '+url.href);await route.abort();return;
   }
   await route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../docs',name),'utf8')});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const go=async slug=>{await page.evaluate(slug=>{location.hash=slug;},slug);await page.locator('#page-'+slug).waitFor({state:'visible'});};
  await page.goto('http://concept-reader.test/quantum-chemistry.html');
  const sourceViews=fs.readdirSync(path.join(__dirname,'../docs')).filter(name=>/^concept-.*\.html$/.test(name)).length+1;
  assert.equal(await page.locator('[data-page]').count(),sourceViews,'All source concept views must be bundled');
  const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length,'Global IDs must be unique');
  const broken=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>h!=='#reader-content'&&(!h.startsWith('#')||!Array.from(document.querySelectorAll('[data-page]')).some(e=>e.dataset.page===h.slice(1)))));
  assert.deepEqual(broken,[],'All navigation links must resolve offline');
  const roadmap=await page.locator('#vqe-learning-map a').evaluateAll(es=>es.map(e=>e.hash.slice(1)));
  const expected=slugs.filter(s=>s!=='vqe').concat('variational-principle');assert.equal(roadmap.length,10);assert.deepEqual(new Set(roadmap),new Set(expected),'Learning map includes every topic');
  for(const [width,colorScheme] of [[360,'dark'],[1280,'light']]){
   await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme,reducedMotion:'reduce'});await page.reload();
   await energyChecks({page,go});
   for(const group of ['states','measurement','optimization','mapping','hydrogen'])await require('./vqe_checks/'+group+'.cjs')({page,go,near});
   for(const slug of slugs){
    await go(slug);const active=page.locator('#page-'+slug);
    await active.locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));await page.evaluate(()=>document.fonts.ready);
    if(slug!=='vqe')assert(await active.locator('.concept-definition').count(),'Definition missing: '+slug);
    assert(await active.locator('.math-tex .katex-html').count(),'Rendered equations missing: '+slug);
    assert.equal(await active.locator('.math-tex:not(.math-cells .math-tex):not(:has(.katex-html))').count(),0,'Unrendered formula: '+slug);
    assert.equal(await active.locator('.katex-error').count(),0,'Invalid TeX: '+slug);
    const figures=await active.locator('svg').evaluateAll(es=>es.map(e=>e.innerHTML));assert(figures.every(s=>s.length>50&&!/NaN|Infinity/.test(s)),'Invalid figure: '+slug);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow: '+slug);
    const overflow=await active.locator('.katex-html').evaluateAll(es=>es.filter(e=>!e.closest('.term-popover')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1);}).map(e=>e.closest('[data-tex]')?.dataset.tex||e.textContent));
    assert.deepEqual(overflow,[],'Equation overflow: '+slug+' at '+width);
    const triggers=active.locator('.term-trigger');assert(await triggers.count(),'Term explanations missing: '+slug);
    for(const trigger of [triggers.first(),triggers.last()]){
     await trigger.tap();const panel=page.locator('#'+await trigger.getAttribute('aria-controls'));
     assert(await panel.evaluate(e=>e.matches(':popover-open')),'Touch explanation: '+slug);
     assert(await panel.locator('.term-example').count(),'Concrete example missing: '+slug);
     assert(await panel.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;}),'Popover overflow: '+slug);await page.keyboard.press('Escape');
    }
    await active.locator('details').evaluateAll(es=>es.forEach(e=>e.open=false));
   }
   if(process.env.VQE_SCREENSHOT_DIR){fs.mkdirSync(process.env.VQE_SCREENSHOT_DIR,{recursive:true});for(const slug of ['vqe','vqe-algorithm']){await go(slug);await page.screenshot({path:path.join(process.env.VQE_SCREENSHOT_DIR,slug+'-'+width+'.png'),fullPage:true});}}
  }
  assert.equal(requests.length,3,'No runtime requests beyond initial load and two reloads');assert.deepEqual(errors,[],'Browser errors');
  console.log('PASS: VQE map and nine notes; independent numerical checks across six groups; all-view offline links, KaTeX, touch explanations, 360px dark and 1280px light');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
