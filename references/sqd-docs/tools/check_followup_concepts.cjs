// Browser checks for the sixteen electronic-structure follow-up notes.
// Build with enrich_concepts.py and build_concepts.py first. Uses the same
// PLAYWRIGHT_MODULE / CHROMIUM_PATH configuration as check_quantum_concepts.cjs.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const slugs=['born-oppenheimer','orbital','electron-spin','pauli',
 'electronic-configuration','slater-determinant','basis-set','molecular-orbital',
 'electron-integrals','hamiltonian-elements','variational-principle','hartree-fock',
 'electron-correlation','configuration-interaction','active-space','potential-energy'];
const near=(actual,expected,tolerance=1e-5)=>{assert(String(actual).trim()!=='');actual=Number(actual);assert(Number.isFinite(actual)&&Math.abs(actual-expected)<=tolerance,`${actual} != ${expected} (±${tolerance})`);};

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const errors=[];
 try{
  const context=await browser.newContext({hasTouch:true});
  await context.route('**/*',route=>{
   const name=new URL(route.request().url()).pathname.slice(1);
   assert(['quantum-chemistry.html','concepts.html'].includes(name),'Unexpected external dependency: '+name);
   return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../docs',name),'utf8')});
  });
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const go=async slug=>{
   await page.evaluate(slug=>{location.hash=slug;},slug);
   await page.locator('#page-'+slug).waitFor({state:'visible'});
  };
  await page.goto('http://concept-reader.test/quantum-chemistry.html');
  const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));
  assert.equal(new Set(ids).size,ids.length,'IDs must be unique across every bundled page');
  const broken=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>h!=='#reader-content'&&(!h.startsWith('#')||!document.querySelector('[data-page="'+h.slice(1)+'"]'))));
  assert.deepEqual(broken,[],'All related concept links must resolve');
  assert.equal(await page.locator('#glossary-born-oppenheimer-dimensionless strong').textContent(),'무차원(Dimensionless)');
  assert((await page.locator('#page-hartree-fock .term-trigger').allTextContents()).includes('하트리–폭(Hartree–Fock, HF)'),'Keep an introduced acronym with its term');
  const roadmap=await page.locator('#qc-followup-map a').evaluateAll(es=>es.map(e=>e.hash.slice(1)));
  assert.deepEqual(new Set(roadmap),new Set(slugs),'Every planned topic has a page');

  for(const [width,colorScheme] of [[360,'dark'],[1280,'light']]){
   await page.setViewportSize({width,height:900});
   await page.emulateMedia({colorScheme,reducedMotion:'reduce'});
   await page.reload();
   for(const group of ['a','b','c','d'])await require('./followup_checks/'+group+'.cjs')({page,go,near});
   for(const slug of slugs){
    await go(slug);
    const active=page.locator('#page-'+slug);
    await active.locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));
    await page.evaluate(()=>document.fonts.ready);
    assert(await active.locator('.concept-definition').count(),'Definition missing: '+slug);
    assert(await active.locator('.math-tex .katex-html').count(),'Rendered equations missing: '+slug);
    assert.equal(await active.locator('.math-tex:not(.math-cells .math-tex):not(:has(.katex-html))').count(),0,'Unrendered formula: '+slug);
    assert.equal(await active.locator('.katex-error').count(),0,'Invalid TeX: '+slug);
    const figures=await active.locator('svg').evaluateAll(es=>es.map(e=>e.innerHTML));
    assert(figures.every(s=>s.length>50&&!/NaN|Infinity/.test(s)),'Invalid figure: '+slug);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow: '+slug);
    const overflow=await active.locator('.katex-html').evaluateAll(es=>es.filter(e=>!e.closest('.term-popover')).filter(e=>{
     const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1);
    }).map(e=>e.closest('[data-tex]')?.dataset.tex||e.textContent));
    assert.deepEqual(overflow,[],'Equation overflow: '+slug+' at '+width);
    const triggers=active.locator('.term-trigger');
    assert(await triggers.count(),'Term explanations missing: '+slug);
    for(const trigger of [triggers.first(),triggers.last()]){
     await trigger.tap();
     const panel=page.locator('#'+await trigger.getAttribute('aria-controls'));
     assert(await panel.evaluate(e=>e.matches(':popover-open')),'Touch explanation: '+slug);
     assert(await panel.locator('.term-example').count(),'Concrete example missing');
     assert(await panel.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1;}),'Popover overflow: '+slug);
     await page.keyboard.press('Escape');
    }
    await active.locator('details').evaluateAll(es=>es.forEach(e=>e.open=false));
   }
  }
  assert.deepEqual(errors,[],'Browser errors');
  console.log('PASS: 16 follow-up pages; numerical experiments in all four groups; map/links, KaTeX, touch explanations, 360px dark and 1280px light');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
