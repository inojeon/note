const assert = require('node:assert/strict');
module.exports = async ({page, go, near}) => {
  const number = async id => Number(await page.locator('#' + id).getAttribute('data-value'));
  const range = async (id, value) => page.locator('#' + id).evaluate((el, v) => {
    el.value = String(v); el.dispatchEvent(new Event('input', {bubbles: true}));
  }, value);
  await go('electronic-configuration');
  for (let i = 0; i < 6; i++) {
    await range('cfg-choice', i);
    near(await number('cfg-count'), [1,4,4,4,4,1][i], 1e-12);
    near(await number('cfg-ms'), [0,1,0,0,-1,0][i], 1e-12);
    assert.equal(await page.locator('#cfg-spatial').textContent(), i===0?'a²':i===5?'b²':'a¹b¹');
  }
  await page.locator('[data-cfg-choice="2"]').click();
  assert.equal(await page.locator('#cfg-determinant').textContent(), 'D[aα, bβ]');
  await go('slater-determinant');
  near(await number('sdet-amplitude'), Math.SQRT1_2, 1e-12);
  near(await number('sdet-probability'), .5, 1e-12);
  near(await number('sdet-norm'), 1, 1e-12);
  await page.locator('#sdet-exchange').click();
  near(await number('sdet-amplitude'), -Math.SQRT1_2, 1e-12);
  near(await number('sdet-probability'), .5, 1e-12);
  await page.locator('#sdet-duplicate').click();
  near(await number('sdet-amplitude'), 0, 1e-12);
  near(await number('sdet-probability'), 0, 1e-12);
  near(await number('sdet-norm'), 0, 1e-12);
  assert.match(await page.locator('#sdet-validity').textContent(), /정규화할 수 없습니다/);
  await page.locator('#sdet-distinct').click();
  near(await number('sdet-amplitude'), -Math.SQRT1_2, 1e-12);
  await go('basis-set');
  for (let m = 1; m <= 3; m++) {
    await range('bset-size', m);
    near(await number('bset-error'), [1/3,1/6,0][m-1], 1e-12);
    near(await number('bset-norm'), [2/3,5/6,1][m-1], 1e-12);
    near(await number('bset-square-sum'), [2/3,1/2,2/3][m-1], 1e-12);
  }
  await page.locator('[data-bset-size="2"]').click();
  near(await number('bset-error'), 1/6, 1e-12);
  await go('molecular-orbital');
  for (const R of [1,2,4]) {
    await range('mo-distance', R);
    const S = Math.exp(-R*R/4), N = 1/Math.sqrt(2*(1+S));
    near(await number('mo-overlap'), S, 1e-12);
    near(await number('mo-central-density'), 4*N*N/Math.sqrt(Math.PI)*Math.exp(-R*R/4), 1e-12);
    const coefficientA = Number(await page.locator('#mo-expansion').getAttribute('data-coefficient-a'));
    const coefficientB = Number(await page.locator('#mo-expansion').getAttribute('data-coefficient-b'));
    near(coefficientA, N, 1e-12); near(coefficientB, N, 1e-12);
    near(coefficientA**2+coefficientB**2+2*coefficientA*coefficientB*S, 1, 1e-12);
    const density = await number('mo-central-density');
    await page.locator('#mo-rephase').click();
    near(await number('mo-overlap'), -S, 1e-12);
    near(Number(await page.locator('#mo-expansion').getAttribute('data-coefficient-b')), -N, 1e-12);
    near(await number('mo-central-density'), density, 1e-12);
    await page.locator('#mo-rephase').click();
    await page.locator('#mo-minus').click();
    near(await number('mo-central-density'), 0, 1e-12);
    const minusA = Number(await page.locator('#mo-expansion').getAttribute('data-coefficient-a'));
    const minusB = Number(await page.locator('#mo-expansion').getAttribute('data-coefficient-b'));
    near(minusA**2+minusB**2+2*minusA*minusB*S, 1, 1e-12);
    near(await number('mo-norm'), 1, 1e-12);
    await page.locator('#mo-plus').click();
  }
};
