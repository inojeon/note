const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({hasTouch:true}),errors=[];
 await context.route('http://choices.test/**',route=>{const name=new URL(route.request().url()).pathname.slice(1);route.fulfill({body:fs.readFileSync(path.join(__dirname,'../docs',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.woff2')?'font/woff2':'text/html'});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const [width,colorScheme]of [[360,'dark'],[1280,'light']]){
 await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});await page.goto('http://choices.test/learning-maps.html');
 const ids=await page.locator('select').evaluateAll(es=>es.map(e=>({id:e.id,slug:e.closest('[data-page]').dataset.page})));
 assert.equal(ids.length,13);assert.equal(await page.locator('.choice-buttons').count(),13);
 for(const {id,slug}of ids){
 await page.evaluate(s=>location.hash=s,slug);await page.locator('#page-'+slug).waitFor({state:'visible'});
 assert.equal(await page.locator('select:visible').count(),0);
 const group=page.locator('[data-choice-for="'+id+'"]'),buttons=group.locator('button');
 assert(await group.getAttribute('aria-labelledby'));
 for(let i=0;i<await buttons.count();i++){
 const button=buttons.nth(i);await button.tap();
 assert.equal(await button.getAttribute('aria-pressed'),'true');assert.equal(await group.locator('[aria-pressed="true"]').count(),1);
 assert.equal(await page.locator('#'+id).inputValue(),await button.getAttribute('data-value'));
 assert(await button.evaluate(e=>{const r=e.getBoundingClientRect();return r.height>=44&&r.left>=0&&r.right<=innerWidth+1;}));
 }
 await buttons.first().focus();await page.keyboard.press('Space');assert.equal(await buttons.first().getAttribute('aria-pressed'),'true');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.evaluate(()=>location.hash='qubit');await page.locator('#page-qubit').waitFor({state:'visible'});
 if(process.env.CHOICES_SCREENSHOT_DIR){fs.mkdirSync(process.env.CHOICES_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.CHOICES_SCREENSHOT_DIR,'qubit-'+width+'.png'),fullPage:true});}
 }
 // Source pages also load their shared controls without the bundled reader.
 for(const file of fs.readdirSync(path.join(__dirname,'../docs')).filter(n=>/^concept-.*\.html$/.test(n))){
 if(!fs.readFileSync(path.join(__dirname,'../docs',file),'utf8').includes('<select'))continue;
 await page.goto('http://choices.test/'+file);assert.equal(await page.locator('select:visible').count(),0);assert.equal(await page.locator('select').count(),await page.locator('.choice-buttons').count());
 }
 assert.deepEqual(errors,[]);console.log('PASS: all 13 choice groups, touch, keyboard, pressed state, mobile bounds and standalone source pages');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
