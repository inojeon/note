// Real browser validation of the offline H2 Born–Oppenheimer lab.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../docs/quantum-chemistry.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/bo_h2.json'),'utf8'));
const close=(actual,expected)=>assert(Math.abs(Number(actual)-expected)<.00000051,`${actual} != ${expected}`);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[],requests=[];
 try{
  for(const mode of ['3d','no-webgl','no-library']){
   console.log('Checking H2 viewer:',mode);
   const context=await browser.newContext({hasTouch:true});
   await context.route('**/*',route=>{requests.push(route.request().url());assert.equal(new URL(route.request().url()).pathname,'/quantum-chemistry.html','No external dependencies');return route.fulfill({contentType:'text/html',body:html});});
   if(mode==='no-webgl')await context.addInitScript(()=>{for(const type of [HTMLCanvasElement,window.OffscreenCanvas].filter(Boolean)){const original=type.prototype.getContext;type.prototype.getContext=function(kind,...args){if(/webgl|experimental-webgl/i.test(kind))return null;return original.call(this,kind,...args);};}});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(mode+': '+e.message));
   await page.goto('http://bo-lab.test/quantum-chemistry.html');
   assert.equal(await page.locator('#boh2-viewer canvas').count(),0,'3D must initialize only when its page becomes visible');
   if(mode==='no-library')await page.evaluate(()=>{window.$3Dmol=undefined;});
   await page.evaluate(()=>{location.hash='born-oppenheimer';});
   await page.locator('#page-born-oppenheimer').waitFor({state:'visible'});
   if(mode==='3d')await page.waitForFunction(()=>document.getElementById('boh2-lab').dataset.viewerReady==='true');
   else await page.waitForFunction(()=>document.getElementById('boh2-viewer').hidden);
   for(const [width,colorScheme] of [[360,'dark'],[1280,'light']]){
    await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme});
    for(const index of [0,Math.floor(data.samples.length/2),data.samples.length-1]){
     await page.locator('#boh2-distance').evaluate((e,index)=>{e.value=String(index);e.dispatchEvent(new Event('input',{bubbles:true}));},index);
     const sample=data.samples[index];
     assert.equal(await page.locator('#boh2-distance-value').textContent(),sample.r_angstrom.toFixed(2)+' Å');
     for(const [id,key] of [['electronic','energy_electronic_hartree'],['nuclear','energy_nuclear_hartree'],['total','energy_total_hartree']])close(await page.locator('#boh2-'+id).textContent(),sample[key]);
     for(const id of ['slice','curve']){const svg=await page.locator('#boh2-'+id+'-fig').innerHTML();assert(svg.length>100&&!/NaN|Infinity/.test(svg));}
    }
    await page.locator('#boh2-show-electronic').check();await page.locator('#boh2-show-nuclear').check();
    assert.equal(await page.locator('#boh2-curve-fig polyline').count(),3);
    await page.locator('#boh2-show-electronic').uncheck();await page.locator('#boh2-show-nuclear').uncheck();
    assert.equal(await page.locator('#boh2-curve-fig polyline').count(),1);
    await page.locator('#boh2-minimum').click();assert.equal(Number(await page.locator('#boh2-distance').inputValue()),data.minimum_index);
    await page.locator('#boh2-reset').click();assert.equal(Number(await page.locator('#boh2-distance').inputValue()),data.default_index);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow at '+width);
    if(mode==='3d'){
     await page.locator('#boh2-density').uncheck();assert(await page.locator('#boh2-slice-panel').evaluate(e=>e.open));
     await page.locator('#boh2-density').check();
     assert(await page.locator('#boh2-viewer canvas').evaluate(e=>e.width>0&&e.height>0));
     await page.locator('#boh2-slice-panel').evaluate(e=>{e.open=false;});
     await page.locator('#boh2-lab').screenshot({path:'/tmp/boh2-'+width+'.png'});
    }else{
     assert(await page.locator('#boh2-slice-panel').evaluate(e=>e.open));assert(await page.locator('#boh2-density').isDisabled());
    }
   }
   await page.evaluate(()=>{location.hash='quantum-chemistry';});await page.locator('#page-quantum-chemistry').waitFor({state:'visible'});
   await page.evaluate(()=>{location.hash='born-oppenheimer';});await page.locator('#page-born-oppenheimer').waitFor({state:'visible'});
   if(mode==='3d')assert.equal(await page.locator('#boh2-viewer canvas').count(),1,'Returning must reuse the viewer');
   await context.close();
  }
  assert.deepEqual(errors,[],'No unhandled browser errors');assert.equal(requests.length,3);
  console.log('PASS: H2 3D + missing-WebGL/library fallback; sampled energies, toggles, lazy routing, mobile/desktop, zero external dependencies');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
