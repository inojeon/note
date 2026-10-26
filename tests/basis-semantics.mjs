import assert from 'node:assert/strict';

/** Known examples from the four notes. Compare independent invariants and the
 * values actually displayed to the learner, not a copy of the model formula. */
export async function runBasisSemantics(page, { baseURL }) {
  let checks = 0;
  const load = async id => {
    const response = await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    assert.equal(response.status(), 200, id);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
  };
  const state = () => page.locator('[data-result]').evaluate(output => ({ ...output.dataset }));
  const change = async (name, value) => page.locator(`[data-input="${name}"]`).evaluate((input, next) => {
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  const expectDrawing = async label => {
    const drawings = await page.locator('svg.lp-plane').evaluateAll(svgs => svgs.map(svg => {
      const bounds = svg.querySelector('[data-drawing]').getBBox(), view = svg.viewBox.baseVal;
      return { finite: !/NaN|Infinity/.test(svg.innerHTML), fits: bounds.x >= view.x && bounds.y >= view.y && bounds.x + bounds.width <= view.x + view.width && bounds.y + bounds.height <= view.y + view.height };
    }));
    assert(drawings.length > 0, `${label}: a diagram is present`);
    for (const drawing of drawings) {
      assert(drawing.finite, `${label}: finite geometry`);
      assert(drawing.fits, `${label}: arrows and direct labels fit`);
      checks += 2;
    }
  };

  await load('linear-independence');
  let current = await state();
  assert.equal(current.originalSpan, 'plane');
  assert.equal(current.independent, 'false');
  assert.match(await page.locator('[data-independence]').innerText(), /2u − v = 0/);
  checks += 3;
  await page.locator('[data-keep="v"]').uncheck();
  current = await state();
  assert.equal(current.remainingSpan, 'plane', 'removing the redundant horizontal vector preserves the plane');
  assert.equal(current.sameSpan, 'true');
  assert.equal(current.independent, 'true', 'the two surviving directions are independent');
  assert.match(await page.locator('[data-reason]').innerText(), /v = 2u/);
  await expectDrawing('redundant vector removed'); checks += 4;
  await page.locator('[data-reset]').click();
  await page.locator('[data-keep="w"]').uncheck();
  current = await state();
  assert.equal(current.remainingSpan, 'line', 'removing the only vertical direction shrinks the span');
  assert.equal(current.sameSpan, 'false');
  assert.equal(current.independent, 'false', 'the remaining two collinear vectors are still dependent');
  assert.match(await page.locator('[data-result]').innerText(), /줄었습니다/);
  checks += 4;
  await page.locator('[data-keep="u"]').uncheck();
  assert.equal((await state()).remainingSpan, 'line', 'one nonzero horizontal vector still spans the line');
  await page.locator('[data-keep="v"]').uncheck();
  assert.equal((await state()).remainingSpan, 'zero', 'empty sum gives the zero subspace');
  assert.match(await page.locator('[data-reason]').innerText(), /빈 합/);
  await expectDrawing('empty set convention'); checks += 3;
  await page.locator('[data-set="with-zero"]').click();
  assert.equal((await state()).independent, 'false', 'a family containing zero is dependent');
  await page.locator('[data-keep="zero"]').uncheck();
  assert.equal((await state()).sameSpan, 'true', 'removing zero does not change the span');
  assert.equal((await state()).independent, 'true', 'a single nonzero vector is independent');
  checks += 3;
  await page.locator('[data-set="independent"]').click();
  await page.locator('[data-keep="u"]').uncheck();
  assert.equal((await state()).remainingSpan, 'vertical');
  assert.equal((await state()).sameSpan, 'false');
  await page.locator('[data-keep="u"]').focus();
  await page.keyboard.press('Space');
  assert.equal((await state()).remainingSpan, 'plane', 'checkbox changes are keyboard operable');
  await page.locator('[data-reset]').click();
  assert.equal((await state()).set, 'redundant');
  assert.equal((await state()).remainingCount, '3');
  checks += 5;

  await load('basis-coordinates');
  const targetPixel = () => page.locator('svg .lp-point.lp-result').evaluate(dot => [dot.getAttribute('cx'), dot.getAttribute('cy')]);
  const originalTarget = await targetPixel();
  current = await state();
  assert.deepEqual([current.coefficientA, current.coefficientB], ['3', '2'], 'standard coordinates of (3, 2)');
  assert.match(await page.locator('[data-result]').innerText(), /\(3, 2\)/);
  checks += 2;
  await page.locator('[data-basis="tilted"]').click();
  current = await state();
  assert.deepEqual([current.coefficientA, current.coefficientB], ['1', '2'], 'one horizontal and two diagonal moves reach the same target');
  assert.deepEqual([current.resultX, current.resultY], ['3', '2']);
  assert.deepEqual(await targetPixel(), originalTarget, 'changing basis does not move the plotted vector');
  assert.match(await page.locator('[data-calculation]').innerText(), /1 × \(1, 0\) \+ 2 × \(1, 1\) = \(3, 2\)/);
  await page.locator('[data-grid]').check();
  assert.deepEqual(await targetPixel(), originalTarget, 'showing the basis grid does not change the endpoint');
  assert.equal((await state()).gridShown, 'true');
  await expectDrawing('tilted basis with grid'); checks += 6;
  await page.locator('[data-basis="collinear"]').click();
  current = await state();
  assert.equal(current.validBasis, 'false');
  assert.deepEqual([current.coefficientA, current.coefficientB], ['', ''], 'an unrepresentable target has no fabricated coordinates');
  assert.deepEqual(await targetPixel(), originalTarget, 'invalid candidate basis still leaves target fixed');
  assert.match(await page.locator('[data-explanation]').innerText(), /세로 성분은 0/);
  await expectDrawing('collinear candidate'); checks += 4;
  await page.locator('[data-reset]').click();
  assert.equal((await state()).basis, 'standard');
  assert.equal(await page.locator('[data-grid]').isChecked(), false);
  checks += 2;

  await load('dimension-explorer');
  const coordinates = value => [value.resultX, value.resultY, value.resultZ].map(Number);
  current = await state();
  assert.deepEqual(coordinates(current), [1, 0, 0]);
  assert.equal(current.dimension, '1');
  assert.equal(current.componentCount, '3', 'three written components do not imply three-dimensional subspace');
  assert.equal(await page.locator('[data-input="y"]').isDisabled(), true);
  assert.equal(await page.locator('[data-input="z"]').isDisabled(), true);
  checks += 5;
  await change('x', -2);
  assert.deepEqual(coordinates(await state()), [-2, 0, 0]); checks++;
  await page.locator('[data-space="plane"]').click();
  await change('y', 1.5);
  current = await state();
  assert.deepEqual(coordinates(current), [-2, 1.5, 0]);
  assert.equal(current.dimension, '2');
  assert.equal(await page.locator('[data-input="z"]').isDisabled(), true);
  await expectDrawing('xy plane'); checks += 3;
  await page.locator('[data-camera-panel] summary').click();
  const beforeCamera = coordinates(await state());
  const beforeProjection = await page.locator('[data-plane]').innerHTML();
  await change('yaw', 135); await change('elevation', 65);
  assert.deepEqual(coordinates(await state()), beforeCamera, 'camera rotation preserves the actual coordinates');
  assert.equal((await state()).dimension, '2', 'camera rotation does not change dimension');
  assert.notEqual(await page.locator('[data-plane]').innerHTML(), beforeProjection, 'the camera control actually changes the projection');
  checks += 3;
  await page.locator('[data-space="space"]').click();
  await change('x', 1); await change('y', -1); await change('z', 2);
  current = await state();
  assert.deepEqual(coordinates(current), [1, -1, 2]);
  assert.equal(current.dimension, '3');
  assert.equal(await page.locator('[data-input="z"]').isEnabled(), true);
  await expectDrawing('three independently variable coordinates'); checks += 3;
  await page.locator('[data-space="zero"]').click();
  current = await state();
  assert.deepEqual(coordinates(current), [0, 0, 0]);
  assert.equal(current.dimension, '0');
  for (const name of ['x', 'y', 'z']) assert.equal(await page.locator(`[data-input="${name}"]`).isDisabled(), true);
  await expectDrawing('zero subspace'); checks += 5;
  for (const space of ['line', 'plane', 'space', 'zero']) {
    await page.locator(`[data-space="${space}"]`).click();
    for (const edge of ['min', 'max']) {
      await page.locator('input[type="range"]:enabled').evaluateAll((inputs, edge) => {
        for (const input of inputs) { input.value = input[edge]; input.dispatchEvent(new Event('input', { bubbles: true })); }
      }, edge);
      await expectDrawing(`${space}, ${edge}`);
    }
  }
  await page.locator('[data-reset]').click();
  current = await state();
  assert.deepEqual(coordinates(current), [1, 0, 0]);
  assert.deepEqual([current.space, current.yaw, current.elevation], ['line', '35', '30']);
  assert.equal(await page.locator('[data-camera-panel]').evaluate(details => details.open), false);
  checks += 3;

  await load('inner-product-components');
  current = await state();
  assert.equal(Number(current.dot), 3);
  assert.deepEqual([Number(current.productX), Number(current.productY)], [3, 0]);
  assert.equal(Number(current.length), 5);
  assert.equal(Number(current.squaredLength), 25);
  checks += 4;
  for (const [example, expected, products] of [['perpendicular', 0, [-12, 12]], ['same', 25, [9, 16]], ['opposite', -25, [-9, -16]]]) {
    await page.locator(`[data-example="${example}"]`).click();
    current = await state();
    assert.equal(Number(current.dot), expected, example);
    assert.deepEqual([Number(current.productX), Number(current.productY)], products, `${example}: component contributions`);
    assert.equal(Number(await page.locator('[data-term-x]').innerText()), products[0]);
    assert.equal(Number(await page.locator('[data-term-y]').innerText()), products[1]);
    assert((await page.locator('[data-result]').innerText()).endsWith(`= ${expected}`), `${example}: visible result`);
    await expectDrawing(example); checks += 5;
  }
  await change('ux', 1); await change('uy', 0); await change('vx', -1); await change('vy', 0);
  current = await state();
  assert.equal(Number(current.dot), -1, 'opposite axis-aligned vectors have a negative inner product');
  assert.deepEqual([Number(current.productX), Number(current.productY)], [-1, 0], 'one zero component contributes zero, not a negative product');
  assert.match(await page.locator('[data-explanation]').innerText(), /자기 자신과의 내적에 −1/);
  checks += 3;
  await page.locator('[data-reset]').click();
  await page.locator('[data-normalize]').check();
  current = await state();
  assert.deepEqual([Number(current.ux), Number(current.uy)], [.6, .8], 'known 3–4–5 triangle normalization');
  assert.equal(Number(current.length), 1);
  assert.equal(Number(current.squaredLength), 1);
  assert.equal(Number(current.dot), .6, 'only u is normalized; v is unchanged');
  assert.deepEqual([Number(current.vx), Number(current.vy)], [1, 0]);
  assert.match(await page.locator('[data-vectors]').innerText(), /정규화한 u = \(0.6, 0.8\)/);
  checks += 6;
  await change('ux', -3); await change('uy', -4);
  current = await state();
  assert.deepEqual([Number(current.ux), Number(current.uy)], [-.6, -.8], 'normalization keeps the direction including its signs');
  assert.equal(Number(current.length), 1); checks += 2;
  await change('ux', 0); await change('uy', 0);
  current = await state();
  assert.equal(Number(current.dot), 0);
  assert.equal(Number(current.length), 0);
  assert.equal(current.normalized, 'false', 'moving to zero exits normalization without NaN');
  assert.equal(await page.locator('[data-normalize]').isDisabled(), true);
  assert.match(await page.locator('[data-normalization]').innerText(), /0으로 나눌 수 없/);
  await expectDrawing('zero cannot be normalized'); checks += 5;
  await page.locator('[data-example="same"]').click();
  assert.equal(await page.locator('[data-normalize]').isEnabled(), true, 'normalization becomes available after leaving zero'); checks++;
  for (const bound of [-4, 4]) {
    for (const name of ['ux', 'uy', 'vx', 'vy']) await change(name, bound);
    assert.equal(Number((await state()).dot), 32, 'corner vector self-product is positive and finite');
    await expectDrawing(`component bound ${bound}`); checks++;
  }
  await page.locator('[data-reset]').click();
  current = await state();
  assert.deepEqual([current.ux, current.uy, current.vx, current.vy], ['3', '4', '1', '0']);
  assert.equal(await page.locator('[data-normalize]').isChecked(), false);
  checks += 2;

  return { checks, experiments: 4 };
}
