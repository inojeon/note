const choose=require('../choose_option.cjs');
const assert=require('node:assert/strict');
module.exports=async({page,go,near})=>{
 const slider=async(id,v)=>{await page.locator(id).fill(String(v));await page.locator(id).dispatchEvent('input');};
 const val=async id=>Number((await page.locator(id).innerText()).replace('%',''));
 const exact=1-Math.hypot(.5,.2), energy=t=>1-.5*Math.sin(t*Math.PI/180)-.2*Math.cos(t*Math.PI/180);
 await go('ansatz');
 await choose(page,'va-mode','restricted');
 for(const t of [-30,0,30]){await slider('#va-angle',t);near(await val('#va-energy'),energy(t),.00000051);}
 await page.locator('#va-best').click();near(await val('#va-energy'),energy(30),.00000051);
 near(await val('#va-gap'),energy(30)-exact,.00000051);
 assert(await val('#va-gap')>.1,'restricted ansatz excludes the ground state');
 await choose(page,'va-mode','full');await page.locator('#va-best').click();near(await val('#va-energy'),exact,.00000051);near(await val('#va-gap'),0,.00000051);
 for(const t of [-180,-90,90,180]){await slider('#va-angle',t);near(await val('#va-energy'),energy(t),.00000051);}
 await choose(page,'va-mode','restricted');assert.equal(await page.locator('#va-angle').inputValue(),'30','switching candidates clamps current angle');
 await go('parameterized-circuit');
 for(const t of [-180,-90,0,45,90,180]){await slider('#vpc-angle',t);const a=t*Math.PI/360;near(await val('#vpc-c0'),Math.cos(a),.00000051);near(await val('#vpc-c1'),Math.sin(a),.00000051);near(await val('#vpc-p0'),100*Math.cos(a)**2,.0051);near(await val('#vpc-p1'),100*Math.sin(a)**2,.0051);near(await val('#vpc-energy'),energy(t),.00000051);near(await val('#vpc-p0')+await val('#vpc-p1'),100,.000001);}
 for(const [id,t] of [['zero',0],['plus',90],['one',180]]){await page.locator('#vpc-'+id).click();near(Number(await page.locator('#vpc-angle').inputValue()),t,.000001);}
};
