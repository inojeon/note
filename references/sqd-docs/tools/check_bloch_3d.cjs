const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
const context=await browser.newContext({hasTouch:true});const errors=[];
await context.route('http://bloch.test/**',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../docs/learning-maps.html'),'utf8')}));
const page=await context.newPage();page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
for(const [width,colorScheme]of [[360,'dark'],[1280,'light']]){
await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme});await page.goto('http://bloch.test/#rotation-gate');
const sphere=page.locator('#br-bloch-fig'),angle=page.locator('#br-angle');
for(const degrees of [0,90,180,270,360,540,720]){
 await angle.fill(String(degrees));await angle.dispatchEvent('input');
 const state=JSON.parse(await sphere.getAttribute('data-state')),t=degrees*Math.PI/180;
 assert(Math.abs(state[0]-Math.sin(t))<1e-12);assert(Math.abs(state[2]-Math.cos(t))<1e-12);assert(Math.abs(Math.hypot(...state)-1)<1e-12);
 assert(!/NaN|Infinity/.test(await sphere.innerHTML()));
}
await page.locator('#br-quarter').tap();const before=await page.locator('#br-vector').getAttribute('data-values'),prob=await page.locator('#br-p0').innerText();
const tip=await sphere.getAttribute('data-tip');await sphere.scrollIntoViewIfNeeded();const box=await sphere.boundingBox();
await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+55,box.y+box.height/2+35,{steps:5});await page.mouse.up();
assert.notEqual(await sphere.getAttribute('data-tip'),tip);assert.equal(await page.locator('#br-vector').getAttribute('data-values'),before);assert.equal(await page.locator('#br-p0').innerText(),prob);
await sphere.focus();const camera=await sphere.getAttribute('data-camera');await page.keyboard.press('ArrowRight');assert.notEqual(await sphere.getAttribute('data-camera'),camera);
await page.locator('#br-view-front').click();await page.waitForFunction(()=>document.getElementById('br-bloch-fig').dataset.camera==='[0,0]');assert.deepEqual(JSON.parse(await sphere.getAttribute('data-camera')),[0,0]);
await page.locator('#br-view-top').tap();await page.waitForFunction(()=>document.getElementById('br-view-status').textContent.includes('겹칩니다'));assert((await page.locator('#br-view-status').innerText()).includes('겹칩니다'));
await page.locator('#br-view-default').tap();await page.waitForFunction(()=>document.getElementById('br-bloch-fig').dataset.camera==='[-0.65,0.32]');assert.deepEqual(JSON.parse(await sphere.getAttribute('data-camera')),[-.65,.32]);assert.equal(await page.locator('#br-vector').getAttribute('data-values'),before);
// Real touch events use the same pointer capture path as mobile dragging.
const cdp=await context.newCDPSession(page);await sphere.scrollIntoViewIfNeeded();const b=await sphere.boundingBox();const touchStart={x:b.x+b.width/2,y:b.y+b.height/2};const cam=await sphere.getAttribute('data-camera');
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchStart]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchStart.x+45,y:touchStart.y-20}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.notEqual(await sphere.getAttribute('data-camera'),cam);await cdp.detach();
await page.locator('#br-view-default').click();
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
if(process.env.BLOCH_SCREENSHOT_DIR){fs.mkdirSync(process.env.BLOCH_SCREENSHOT_DIR,{recursive:true});await page.locator('.br-sphere').screenshot({path:path.join(process.env.BLOCH_SCREENSHOT_DIR,'bloch-'+width+'.png')});}
}
assert.deepEqual(errors,[]);console.log('PASS: 3D projections, unit states, mouse/touch orbit, keyboard, view presets, unchanged quantum state and mobile bounds');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
