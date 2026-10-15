const assert = require('node:assert/strict');

module.exports = async ({page, go, near}) => {
  const value = async id => Number(await page.locator(id).getAttribute('data-value'));
  const set = async (id, number) => page.locator(id).fill(String(number));
  let states = 0;
  await go('electron-correlation');
  for (const u of [0, 1, 4, 8]) {
    await set('#corr-u', u);
    const exact = (u - Math.sqrt(u*u + 16))/2;
    near(await value('#corr-hf'), u/2 - 2, 1e-12);
    near(await value('#corr-exact'), exact, 1e-12);
    near(await value('#corr-difference'), 2 - Math.sqrt(u*u + 16)/2, 1e-12);
    assert(await value('#corr-difference') <= 0);
    states++;
  }
  await go('configuration-interaction');
  for (const deg of [-90, -30, 0, 30, 90]) {
    await set('#ci-angle', deg);
    const a = deg*Math.PI/180, c0=Math.cos(a), c1=Math.sin(a);
    near(await value('#ci-energy'), -c0*c0-.4*c1*c1-.4*c0*c1, 1e-12);
    near(Number(await page.locator('#ci-coefficients').getAttribute('data-c0')), c0, 1e-12);
    near(Number(await page.locator('#ci-coefficients').getAttribute('data-c1')), c1, 1e-12);
    assert(await value('#ci-energy') >= -.7-Math.sqrt(.13)-1e-12);
    states++;
  }
  await page.locator('#ci-optimum').click();
  near(await value('#ci-energy'), -.7-Math.sqrt(.13), 1e-12);
  await page.locator('#ci-reference').click();
  near(await value('#ci-energy'), -1, 1e-12);
  await go('active-space');
  for (const [orbitals, electrons, fixed, all] of [[2,2,4,6],[4,4,36,70],[8,8,4900,12870]]) {
    await set('#cas-orbitals', orbitals);
    await set('#cas-electrons', electrons);
    assert.equal(Number(await page.locator('#cas-fixed').textContent()), fixed);
    assert.equal(Number(await page.locator('#cas-all').textContent()), all);
    states++;
  }
  await set('#cas-orbitals', 2);
  assert.equal(await page.locator('#cas-electrons').inputValue(), '4');
  assert.equal(Number(await page.locator('#cas-fixed').textContent()), 1);
  assert.equal(Number(await page.locator('#cas-all').textContent()), 1);
  await go('potential-energy');
  for (const r of [.8, 1.5, 2, 3, 6]) {
    await set('#pec-r', r);
    const q = Math.exp(2-r), potential = (1-q)**2-1;
    near(await value('#pec-energy'), potential, 1e-12);
    const h=1e-5, v=x=>(1-Math.exp(2-x))**2-1;
    near(await value('#pec-force'), -(v(r+h)-v(r-h))/(2*h), 1e-7);
    near(await value('#pec-curvature'), 2, 1e-12);
    states++;
  }
  await page.locator('#pec-equilibrium').click();
  near(await value('#pec-energy'), -1, 1e-12);
  near(await value('#pec-force'), 0, 1e-12);
  return {group:'d', states};
};
