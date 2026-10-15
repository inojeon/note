const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 const slider=async(id,value)=>{await page.locator(id).fill(String(value));await page.locator(id).dispatchEvent('input');};
 const numeric=async id=>Number((await page.locator(id).innerText()).replace('%',''));
 await go('born-oppenheimer');
 for(const [q,g] of [[0,.05],[0,.4],[-1,.25],[2,.8]]){
  await slider('#bo-q',q);await slider('#bo-g',g);
  near(await numeric('#bo-gap'),2*Math.hypot(q,g),.000051);
  near(await numeric('#bo-indicator'),.05*g/(4*(q*q+g*g)**1.5),.000051);
 }
 await page.locator('#bo-close').click();const etaClose=await numeric('#bo-indicator');
 await page.locator('#bo-far').click();assert(etaClose>await numeric('#bo-indicator'),'relative nonadiabatic coupling falls away from crossing');
 await go('orbital');
 for(const n of [1,2,3])for(const edge of [0,.25,.5,.73,1]){
  await slider('#orb-n',n);await slider('#orb-edge',edge);
  near(await numeric('#orb-probability'),100*(edge-Math.sin(2*n*Math.PI*edge)/(2*n*Math.PI)),.0051);
  assert.equal(await numeric('#orb-nodes'),n-1);
 }
 await go('electron-spin');
 for(const degrees of [0,30,60,90,120,180]){
  await slider('#spin-axis',degrees);const t=degrees*Math.PI/180;
  near(await numeric('#spin-plus'),100*Math.cos(t/2)**2,.051);
  near(await numeric('#spin-minus'),100*Math.sin(t/2)**2,.051);
  near(await numeric('#spin-mean'),.5*Math.cos(t),.00051);
 }
 await page.locator('#spin-perpendicular').click();near(await numeric('#spin-plus'),50,.001);near(await numeric('#spin-mean'),0,.001);
 await go('pauli');await page.locator('#pauli-reset').click();
 await page.locator('#pauli-add-aa').click();assert.equal(await numeric('#pauli-total'),1);
 await page.locator('#pauli-add-aa').click();assert.equal(await numeric('#pauli-total'),1);assert.match(await page.locator('#pauli-status').innerText(),/추가할 수 없습니다/);
 await page.locator('#pauli-add-ab').click();assert.equal(await numeric('#pauli-a-count'),2);assert.equal(await numeric('#pauli-total'),2);
 await page.locator('#pauli-add-ba').click();await page.locator('#pauli-add-bb').click();assert.equal(await numeric('#pauli-total'),4);assert.equal(await numeric('#pauli-b-count'),2);
 await page.locator('#pauli-add-bb').click();assert.equal(await numeric('#pauli-total'),4);
 await page.locator('#pauli-reset').click();assert.equal(await numeric('#pauli-total'),0);
};
