const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),choose=require('./choose_option.cjs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const context=await browser.newContext({hasTouch:true}),errors=[];await context.route('http://sphere.test/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../docs/learning-maps.html'),'utf8')}));
const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
const expected={zero:[0,0,1],one:[0,0,-1],plus:[1,0,0],minus:[-1,0,0],plusi:[0,1,0]},normals={X:[1,0,0],Y:[0,1,0],Z:[0,0,1]},dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
for(const [width,colorScheme]of [[360,'dark'],[1280,'light']]){
 await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme});await page.goto('http://sphere.test/#measurement-basis');const sphere=page.locator('#bm-bloch-fig');
 for(const [state,r]of Object.entries(expected)){
  await choose(page,'bm-state',state);const coeff=[await page.locator('#bm-c0').innerText(),await page.locator('#bm-c1').innerText()];
  for(const [basis,n]of Object.entries(normals)){
   await choose(page,'bm-basis',basis);assert.deepEqual(JSON.parse(await sphere.getAttribute('data-state')),r);assert.deepEqual(JSON.parse(await sphere.getAttribute('data-normal')),n);
   const [u,v]=JSON.parse(await sphere.getAttribute('data-plane'));assert.equal(dot(u,n),0);assert.equal(dot(v,n),0);assert.equal(dot(u,v),0);assert.equal(Math.hypot(...u),1);assert.equal(Math.hypot(...v),1);
   const p=50*(1+dot(r,n));assert(Math.abs(parseFloat(await page.locator('#bm-p-first').innerText())-p)<1e-6);assert.equal(Number(await sphere.getAttribute('data-dot')),dot(r,n));assert.deepEqual([await page.locator('#bm-c0').innerText(),await page.locator('#bm-c1').innerText()],coeff);assert(!/NaN|Infinity/.test(await sphere.innerHTML()));
  }
 }
 await choose(page,'bm-state','plus');await choose(page,'bm-basis','Z');await sphere.scrollIntoViewIfNeeded();
 const camera=await sphere.getAttribute('data-camera');const b=await sphere.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+50,b.y+b.height/2+30,{steps:4});await page.mouse.up();assert.notEqual(await sphere.getAttribute('data-camera'),camera);
 await sphere.focus();await page.keyboard.press('ArrowRight');assert.equal(await sphere.getAttribute('data-state'),'[1,0,0]');assert.equal(await sphere.getAttribute('data-normal'),'[0,0,1]');assert.equal(parseFloat(await page.locator('#bm-p-first').innerText()),50);
 await page.locator('#bm-view-reset').tap();await page.waitForFunction(()=>document.getElementById('bm-bloch-fig').dataset.camera==='[-0.65,0.32]');
 const cdp=await context.newCDPSession(page);await sphere.scrollIntoViewIfNeeded();const box=await sphere.boundingBox(),start={x:box.x+box.width/2,y:box.y+box.height/2};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+40,y:start.y+25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual(await sphere.getAttribute('data-camera'),'[-0.65,0.32]');await cdp.detach();
 await page.locator('#bm-view-reset').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(process.env.BLOCH_SCREENSHOT_DIR){fs.mkdirSync(process.env.BLOCH_SCREENSHOT_DIR,{recursive:true});await page.locator('.bm-sphere').screenshot({path:path.join(process.env.BLOCH_SCREENSHOT_DIR,'measurement-'+width+'.png')});}
}
assert.deepEqual(errors,[]);console.log('PASS: 5 states × 3 bases at two widths; plane orthogonality, probabilities, invariant state, mouse/touch/keyboard and no overflow');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
