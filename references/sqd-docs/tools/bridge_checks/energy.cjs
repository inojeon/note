const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 await go('energy-expectation');
 const input=await page.locator('#ve-input-state').getAttribute('data-tex');
 for(const degrees of [-180,-90,0,45,90,180]){
  await page.locator('#ve-angle').fill(String(degrees));await page.locator('#ve-angle').dispatchEvent('input');
  const c=await page.locator('#ve-prepared').evaluate(e=>JSON.parse(e.dataset.values));
  const hc=await page.locator('#ve-hc').evaluate(e=>JSON.parse(e.dataset.values));
  const t=degrees*Math.PI/360,expected=[Math.cos(t),Math.sin(t)],H=[[.8,-.5],[-.5,1.2]];
  expected.forEach((v,i)=>near(c[i],v,1e-12));
  H.forEach((row,i)=>near(hc[i],row.reduce((sum,v,j)=>sum+v*expected[j],0),1e-12));
  const E=c.reduce((sum,v,i)=>sum+v*hc[i],0);
  near(await page.locator('#ve-dot').innerText(),E,5.1e-7);near(await page.locator('#ve-energy').innerText(),E,5.1e-7);
  assert.equal(await page.locator('#ve-input-state').getAttribute('data-tex'),input,'Gate changes prepared state, never initial state');
  const cells=await page.locator('#ve-gate .math-cells .math-row > span').allTextContents();
  [expected[0],-expected[1],expected[1],expected[0]].forEach((v,i)=>near(cells[i],v,5.1e-7));
 }
 await page.locator('#ve-zero').click();near(await page.locator('#ve-dot').innerText(),.8);
};
