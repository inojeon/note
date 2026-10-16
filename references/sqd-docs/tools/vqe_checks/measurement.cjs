const choose=require('../choose_option.cjs');
const assert = require('node:assert/strict');
module.exports = async ({page, go, near}) => {
  const num = async id => Number(await page.locator('#'+id).getAttribute('data-value'));
  const range = async (id, v) => page.locator('#'+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},v);
  await go('pauli-decomposition');
  for(const d of [-180,-90,0,60,90,180]) {
    await range('vp-theta',d);
    const t=d*Math.PI/180,c=Math.cos(t/2),s=Math.sin(t/2);
    near(await num('vp-x'),2*c*s,1e-12);
    near(await num('vp-z'),c*c-s*s,1e-12);
    near(await num('vp-energy'),.8*c*c-c*s+1.2*s*s,1e-12);
  }
  await go('measurement-shots');
  await page.locator('#vs-reset').click();
  const counts = async()=>Promise.all(['xplus','xminus','zplus','zminus'].map(k=>num('vs-'+k)));
  const first=await counts();
  await page.locator('#vs-resample').click();
  assert.notDeepEqual(await counts(),first);
  await page.locator('#vs-reset').click();
  assert.deepEqual(await counts(),first);
  for(const d of [-180,-90,0,60,90,180]) for(const n of [10,1000]) {
    await range('vs-theta',d);
    await choose(page,'vs-shots',String(n));
    const [xp,xm,zp,zm]=await counts();
    assert.equal(xp+xm,n); assert.equal(zp+zm,n);
    for(const count of [xp,xm,zp,zm]) assert.ok(Number.isInteger(count)&&count>=0&&count<=n);
    near(await num('vs-total'),2*n,1e-12);
    near(await num('vs-estimate'),1-.5*(xp-xm)/n-.2*(zp-zm)/n,1e-12);
    const t=d*Math.PI/180;
    near(await num('vs-exact'),1-.5*Math.sin(t)-.2*Math.cos(t),1e-12);
    near(await num('vs-ground'),1-Math.sqrt(.29),1e-12);
    near(await num('vs-se'),Math.sqrt((.25*Math.cos(t)**2+.04*Math.sin(t)**2)/n),1e-12);
    assert.ok(await num('vs-exact')>=await num('vs-ground')-1e-12);
    if(d===0)assert.equal(zp,n);
    if(Math.abs(d)===180)assert.equal(zp,0);
    if(d===90)assert.equal(xp,n);
    if(d===-90)assert.equal(xp,0);
  }
  const before=await counts();
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
  assert.deepEqual(await counts(),before,'resize must not resample');
  for(const id of ['vp-fig','vs-fig'])assert.doesNotMatch(await page.locator('#'+id).innerHTML(),/NaN|undefined/);
};
