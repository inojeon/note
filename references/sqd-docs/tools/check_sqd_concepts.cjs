// Run enrich_concepts.py and build_concepts.py first. Uses the offline reader.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const slugs=['sqd','occupation-bitstrings','hf-preparation','excitation-state','sqd-state-circuit','sqd-sampling','sqd-subspace'];
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const context=await browser.newContext({hasTouch:true}),errors=[],requests=[];
 await context.route('**/*',route=>{const u=new URL(route.request().url());requests.push(u.href);assert.equal(u.origin,'http://sqd.test');assert.equal(u.pathname,'/learning-maps.html');return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../docs/learning-maps.html'),'utf8')});});
 const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 const go=async slug=>{await page.evaluate(s=>location.hash=s,slug);await page.locator('#page-'+slug).waitFor({state:'visible'});};
 const data=async(id,key)=>JSON.parse(await page.locator('#'+id).getAttribute('data-'+key));
 const range=async(id,n)=>page.locator('#'+id).evaluate((e,n)=>{e.value=n;e.dispatchEvent(new Event('input',{bubbles:true}));},n);
 for(const [width,colorScheme]of [[360,'dark'],[1280,'light']]){
  await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme,reducedMotion:'reduce'});await page.goto('http://sqd.test/learning-maps.html');
  assert.equal(await page.locator('#all-learning-maps a[href="#sqd"]').count(),1);
  await go('sqd');assert.deepEqual(await page.locator('#sqd-learning-map a').evaluateAll(es=>es.map(e=>e.hash.slice(1))),slugs.slice(1));
  await go('occupation-bitstrings');
  for(let n=0;n<16;n++){
   await page.locator('[data-sob-preset="0101"]').tap();for(let q=0;q<4;q++)if(((n>>q)&1)!==((5>>q)&1))await page.locator('[data-sob-bit="'+q+'"]').tap();
   assert.equal(await page.locator('#sob-state').getAttribute('data-value'),n.toString(2).padStart(4,'0'));
   near(await data('sob-alpha','value'),(n&1)+((n>>1)&1));near(await data('sob-beta','value'),((n>>2)&1)+((n>>3)&1));
  }
  await go('hf-preparation');for(const [i,bits]of ['0000','0001','0101'].entries()){await page.locator('[data-shf-step="'+i+'"]').tap();assert.equal(await page.locator('#shf-state').getAttribute('data-value'),bits);}
  await go('excitation-state');for(const d of [0,30,90,180]){await range('sex-theta',d);const a=await data('sex-state','amplitudes'),p=await data('sex-state','probabilities');near(a[0],Math.cos(d*Math.PI/360));near(a[1],Math.sin(d*Math.PI/360));near(p[0]+p[1],1);near(p[0],a[0]**2);}
  await go('sqd-state-circuit');
  // Independently propagate a state using bit permutations and a dense Ry block.
  for(const d of [0,60,90,180]){
   await range('ssc-theta',d);await page.locator('#ssc-reset').tap();let expected=Array(16).fill(0);expected[0]=1;
   const gates=[['x',0],['x',2],['cx',1],['cx',2],['cx',3],['ry',0],['cx',3],['cx',2],['cx',1]];
   for(const [gateIndex,[kind,target]]of gates.entries()){const next=Array(16).fill(0);for(let i=0;i<16;i++){
    if(kind==='x')next[i^(1<<target)]+=expected[i];
    else if(kind==='cx')next[(i&1)?i^(1<<target):i]+=expected[i];
    else {const c=Math.cos(-d*Math.PI/360),s=Math.sin(-d*Math.PI/360);next[i]+=c*expected[i];next[i^1]+=((i&1)?-s:s)*expected[i];}
   }expected=next;await page.locator('#ssc-next').tap();assert.deepEqual(await page.locator('#ssc-fig [data-ssc-gate]').evaluateAll(es=>es.map(e=>Number(e.dataset.sscGate))),Array.from({length:gateIndex+1},(_,i)=>i+1));assert.equal(await page.locator('#ssc-fig [data-current="true"]').getAttribute('data-ssc-gate'),String(gateIndex+1));const actual=await data('ssc-amplitudes','values');actual.forEach((a,i)=>near(a,expected[i]));near(actual.reduce((v,a)=>v+a*a,0),1);}
   const actual=await data('ssc-amplitudes','values');near(actual[5],Math.cos(d*Math.PI/360));near(actual[10],Math.sin(d*Math.PI/360));
   await page.locator('#ssc-back').tap();assert.equal(await data('ssc-stage','step'),8);await page.locator('#ssc-finish').tap();assert.equal(await data('ssc-stage','step'),9);
  }
  await go('sqd-sampling');for(const [d,expected]of [[0,[100,0]],[180,[0,100]]]){await range('ssa-theta',d);await page.locator('#ssa-hundred').tap();assert.deepEqual(await data('ssa-counts','counts'),expected);}
  await range('ssa-theta',60);await page.locator('#ssa-one').tap();assert.equal((await data('ssa-counts','counts')).reduce((a,b)=>a+b),1);await page.locator('#ssa-hundred').tap();const first=await data('ssa-counts','counts');assert.equal(first[0]+first[1],101);await page.locator('#ssa-reset').tap();await page.locator('#ssa-one').tap();await page.locator('#ssa-hundred').tap();assert.deepEqual(await data('ssa-counts','counts'),first);await range('ssa-theta',90);assert.deepEqual(await data('ssa-counts','counts'),[0,0]);
  await go('sqd-subspace');let pairEnergy;
  for(const [preset,indices]of [['hf',[0]],['rare',[0,1]],['balanced',[0,1]],['excited',[1]]]){
   await page.locator('[data-ssu-preset="'+preset+'"]').tap();assert.deepEqual(await data('ssu-selected','indices'),indices);const e=await data('ssu-energy','value'),c=await data('ssu-state','coefficients');near(c[0]**2+c[1]**2,1);
   const H=[[.8,-.5],[-.5,1.2]];indices.forEach(i=>near(indices.reduce((s,j)=>s+H[i][j]*c[j],0),e*c[i]));
   near(e,.8*c[0]**2-c[0]*c[1]+1.2*c[1]**2);assert(e>=1-Math.sqrt(.29)-1e-10);
   if(preset==='rare')pairEnergy=e;if(preset==='balanced')near(e,pairEnergy);
  }
  for(const [index,slug]of slugs.entries()){
   await go(slug);const active=page.locator('#page-'+slug);await active.locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);
   assert.equal(await active.locator('.concept-definition').count(),1);assert.equal(await active.locator('.katex-error').count(),0);
   const brokenMath=await active.locator('.katex-html').evaluateAll(es=>es.filter(e=>!e.closest('.term-popover')).filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1)}).map(e=>e.closest('[data-tex]')?.dataset.tex));assert.deepEqual(brokenMath,[],slug+' math '+width);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug+' overflow');
   assert((await active.locator('svg').evaluateAll(es=>es.map(e=>e.innerHTML))).every(s=>s.length>50&&!/NaN|undefined/.test(s)));
   const trigger=active.locator('.term-trigger').first();assert(await trigger.count());await trigger.tap();assert(await page.locator('#'+await trigger.getAttribute('aria-controls')).evaluate(e=>e.matches(':popover-open')));await page.keyboard.press('Escape');
   if(index){const links=await active.locator('.docnav.bottom a').evaluateAll(es=>es.map(e=>e.hash.slice(1)));assert.deepEqual(links,[slugs[index-1],slugs[index+1]||'sqd']);}
   if(process.env.SQD_SCREENSHOT_DIR){fs.mkdirSync(process.env.SQD_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SQD_SCREENSHOT_DIR,slug+'-'+width+'.png'),fullPage:true});}
  }
 }
 const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
 const missing=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('#')||!document.getElementById(h.slice(1))&&!document.getElementById('page-'+h.slice(1))));assert.deepEqual(missing,[]);
 assert.deepEqual(errors,[]);assert.equal(requests.length,2);console.log('PASS SQD map + six notes: bit encoding, all gate steps, normalized states, sampling, projected eigenpairs, navigation, offline math and mobile/touch');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
