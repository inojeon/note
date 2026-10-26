import assert from 'node:assert/strict';

/** Known worked examples and invariants in the molecule/energy notes. */
export async function runChemistryEnergySemantics(page, { baseURL }) {
  let checks = 0;
  const load = async id => {
    const response = await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    assert.equal(response.status(), 200, id);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
    checks++;
  };
  const value = async selector => Number(await page.locator(selector).getAttribute('data-value'));
  const near = (actual, expected, tolerance = 1e-8) => {
    assert(Math.abs(actual - expected) < tolerance, `${actual} is near ${expected}`); checks++;
  };
  const input = async (selector, next) => page.locator(selector).evaluate((el, next) => {
    el.value = String(next); el.dispatchEvent(new Event('input', { bubbles: true }));
  }, next);

  await load('basis-set');
  near(await value('#bset-main-error'), 1 / 3);
  await page.locator('[data-bset-size="2"]').click(); near(await value('#bset-main-error'), 1 / 6);
  await page.locator('[data-bset-size="3"]').click(); near(await value('#bset-main-error'), 0);
  assert.equal(await page.locator('details').first().getAttribute('open'), null, 'overlap notation is initially optional'); checks++;

  await load('sto-3g');
  near(await value('#sto-spin-count'), 4);
  await page.locator('[data-sto-basis="6-31g(d,p)"]').click();
  near(await value('#sto-spin-count'), 20);
  assert.equal(await page.locator('#sto-functions rect').count(), 10); checks++;
  await page.locator('[data-sto-basis="cc-pvdz"]').click();
  near(await value('#sto-spin-count'), 20);

  await load('molecular-orbital');
  const initialDensity = await value('#mo-central-density');
  assert(initialDensity > 0); checks++;
  await page.locator('#mo-rephase').click(); near(await value('#mo-central-density'), initialDensity);
  await page.locator('#mo-minus').click(); near(await value('#mo-central-density'), 0);
  await page.locator('[data-mo-r="1"]').click(); near(await value('#mo-central-density'), 0);
  near(await value('#mo-norm'), 1);

  await load('electron-integrals');
  near(await value('#int-energy'), -1);
  await page.locator('[data-int-angle="45"]').click();
  near(await value('#int-t'), .8); near(await value('#int-v'), -1.5); near(await value('#int-j'), .7); near(await value('#int-energy'), -.7);
  await page.locator('[data-int-angle="90"]').click(); near(await value('#int-energy'), 1);

  await load('hamiltonian-elements');
  await page.locator('[data-hme-k="2"]').click();
  near(await value('#hme-one'), 0); assert(Math.abs(await value('#hme-two')) > 0); checks++;
  await page.locator('[data-hme-k="3"]').click(); near(await value('#hme-total'), 0);

  await load('h2-hamiltonian');
  near(await value('#hcmp-gap'), 0);
  await page.locator('[data-hcmp-case="heh-2"]').click();
  near(await value('#hcmp-gap'), 0.000480704600086, 1e-10);
  assert(await value('#hcmp-outside') > .23); checks++;
  await page.locator('[data-hcmp-case="heh-4"]').click(); near(await value('#hcmp-gap'), 0);

  await load('h2-state-energy');
  near(await value('#h2h-energy'), -1.1167593073964255);
  await page.locator('[data-h2h-state="equal"]').click();
  const plusProb = JSON.parse(await page.locator('#h2h-probabilities').getAttribute('data-values'));
  const plusEnergy = await value('#h2h-energy');
  await page.locator('[data-h2h-state="opposite"]').click();
  assert.deepEqual(JSON.parse(await page.locator('#h2h-probabilities').getAttribute('data-values')), plusProb); checks++;
  assert(await value('#h2h-energy') < plusEnergy); checks++;
  await page.locator('[data-h2h-state="ground"]').click();
  near(await value('#h2h-energy'), -1.1372838344885021);
  near(await value('#h2h-electronic') + await value('#h2h-nuclear'), await value('#h2h-energy'));

  await load('variational-principle');
  near(await value('#var-energy'), .8);
  await input('#var-scale', 2); near(await value('#var-energy'), .8); near(await value('#var-numerator'), 3.2); near(await value('#var-norm'), 4);
  await page.locator('#var-equal').click(); near(await value('#var-energy'), .5);
  await page.locator('#var-best').click(); near(await value('#var-energy'), .4614835192865496);

  await load('hartree-fock');
  near(await value('#hf-energy'), -1.3);
  const before = Number(await page.locator('#hf-density-change').getAttribute('data-input-a'));
  const predicted = Number(await page.locator('#hf-density-change').getAttribute('data-output-a'));
  assert.notEqual(before, predicted); checks++;
  await page.locator('#hf-step').click();
  near(Number(await page.locator('#hf-density-change').getAttribute('data-input-a')), predicted);
  assert.equal(await page.locator('#hf-history tr').count(), 2); checks++;
  await page.locator('#hf-converge').click(); assert(await value('#hf-residual') < 1e-10); checks++;
  await page.locator('#hf-reset').click(); near(await value('#hf-energy'), -1.3);
  assert.equal(await page.locator('#hf-history tr').count(), 1); checks++;

  await load('basis-orbital-energies');
  const row = page.locator('[data-basis-energy="sto-3g"]');
  const orbitalSum = Number(await row.getAttribute('data-orbital-sum'));
  const total = Number(await row.getAttribute('data-total'));
  near(orbitalSum, -1.1571077196630582); near(total, -1.1167593073964255);
  assert(Math.abs(total - orbitalSum) > .04); checks++;
  await page.locator('[data-sto-comparison="extended"]').click();
  assert.equal(await page.locator('[data-basis-energy]').count(), 3); checks++;

  await load('electron-correlation');
  await page.locator('[data-corr-u="0"]').click(); near(await value('#corr-difference'), 0);
  near(Number(await page.locator('#corr-double').getAttribute('data-exact')), .5);
  await page.locator('[data-corr-u="4"]').click(); near(await value('#corr-exact'), -.8284271247461903);
  assert(Number(await page.locator('#corr-double').getAttribute('data-exact')) < .15); checks++;

  await load('configuration-interaction');
  near(await value('#ci-energy'), -1);
  await page.locator('#ci-optimum').click(); near(await value('#ci-energy'), -1.060555127546399);
  const p0 = Number(await page.locator('#ci-coefficients').getAttribute('data-c0')) ** 2;
  await page.locator('#ci-flip').click();
  near(Number(await page.locator('#ci-coefficients').getAttribute('data-c0')) ** 2, p0);
  assert(await value('#ci-energy') > -1); checks++;

  await load('hamiltonian-size');
  await page.locator('[data-lh-case="0"]').click();
  near(await value('#lh-configurations'), 6); near(await value('#lh-spin-configurations'), 4); near(await value('#lh-matrix-entries'), 36);

  await load('active-space');
  await page.locator('[data-cas-preset="2,2"]').click();
  assert.equal(await page.locator('#cas-fixed').textContent(), '4'); checks++;
  await page.locator('[data-cas-preset="4,4"]').click();
  assert.equal(await page.locator('#cas-fixed').textContent(), '36'); checks++;
  near(await value('#cas-total-energy'), -2);
  await page.locator('[data-cas-convention="included"]').click(); near(await value('#cas-total-energy'), -2);
  assert.match(await page.locator('#cas-energy-ledger').innerText(), /추가 상수 0/); checks++;

  await load('potential-energy');
  near(await value('#pec-energy'), -1); near(await value('#pec-force'), 0);
  await page.locator('[data-pec-r="1.5"]').click(); assert(await value('#pec-force') > 0); checks++;
  await page.locator('[data-pec-r="3"]').click(); assert(await value('#pec-force') < 0); checks++;

  await load('large-hamiltonian');
  await page.locator('[data-large-n="3"]').click();
  assert.deepEqual(JSON.parse(await page.locator('[data-product]').getAttribute('data-values')), [0, 2, 0]); checks++;
  near(Number(await page.locator('[data-comparison]').getAttribute('data-difference')), 0);
  await page.locator('[data-large-n="10"]').click();
  assert.equal(await page.locator('[data-dense]').textContent(), '100');
  assert.equal(await page.locator('[data-sparse]').textContent(), '28'); checks += 2;
  await page.locator('[data-large-n="1000"]').click();
  assert.equal(await page.locator('[data-comparison]').getAttribute('data-difference'), null); checks++;

  return { checks, experiments: 16 };
}
