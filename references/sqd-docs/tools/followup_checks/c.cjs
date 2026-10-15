module.exports=async({page,go,near})=>{
  const read=async id=>Number((await page.locator('#'+id).textContent()).trim().replaceAll('−','-'));
  const set=async(id,value)=>page.locator('#'+id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  await go('electron-integrals');
  near(await read('int-h'),-1,1e-5);near(await read('int-j'),1,1e-5);near(await read('int-energy'),-1,1e-5);
  await set('int-angle',45);
  near(await read('int-t'),.8,1e-5);near(await read('int-v'),-1.5,1e-5);near(await read('int-h'),-.7,1e-5);near(await read('int-j'),.7,1e-5);near(await read('int-energy'),-.7,1e-5);
  await set('int-angle',90);near(await read('int-energy'),1,1e-5);
  await go('hamiltonian-elements');
  near(await read('hme-one'),-2.1,1e-5);near(await read('hme-two'),1.02,1e-5);near(await read('hme-total'),-1.08,1e-5);
  await set('hme-replacements',1);near(await read('hme-total'),.03-.04/7-.04/9,1e-5);
  await set('hme-replacements',2);near(await read('hme-one'),0,1e-10);near(await read('hme-two'),.04/13,1e-5);
  await set('hme-replacements',3);near(await read('hme-one'),0,1e-10);near(await read('hme-two'),0,1e-10);near(await read('hme-total'),0,1e-10);
  await go('variational-principle');
  near(await read('var-energy'),.8,1e-5);
  await set('var-scale',.25);near(await read('var-norm'),.0625,1e-5);near(await read('var-numerator'),.05,1e-5);near(await read('var-energy'),.8,1e-5);
  await page.locator('#var-best').click();near(await read('var-energy'),1-Math.hypot(.2,.5),1e-5);near(await read('var-gap'),0,1e-5);
  await set('var-angle',-90);near(await read('var-energy'),1.2,1e-5);
  await go('hartree-fock');
  near(await read('hf-energy'),-1.3,1e-5);near(await read('hf-epsilon'),-.15-Math.hypot(.15,.15),1e-5);near(await read('hf-residual'),2*Math.SQRT2*Math.sin(Math.PI/8),1e-5);
  await page.locator('#hf-step').click();near((await page.locator('#hf-angle').textContent()).replace('°',''),22.5,1e-5);near(await read('hf-energy'),-.825-.9/Math.SQRT2,1e-5);
  // Independent derivative of E(theta) = -.7-.6 cos(2theta)-.3 sin(2theta)-.25 sin²(2theta).
  const derivative=t=>1.2*Math.sin(2*t)-.6*Math.cos(2*t)-Math.sin(2*t)*Math.cos(2*t);
  let lo=0,hi=Math.PI/4;for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(derivative(mid)>0)hi=mid;else lo=mid;}
  const t=(lo+hi)/2,expected=-.7-.6*Math.cos(2*t)-.3*Math.sin(2*t)-.25*Math.sin(2*t)**2;
  await page.locator('#hf-converge').click();near(await read('hf-energy'),expected,1e-5);near((await page.locator('#hf-angle').textContent()).replace('°',''),t*180/Math.PI,1e-4);if((await read('hf-residual'))>=1e-10)throw new Error('RHF density is not self-consistent');
  await set('hf-start',90);await page.locator('#hf-converge').click();near(await read('hf-energy'),expected,1e-5);
  return 'C: electron integral sums, Slater–Condon zero pattern, normalized variational bound, RHF fixed point';
};
