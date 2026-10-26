import assert from 'node:assert/strict';

/** Known geometric examples, independent of the experiments' implementation.
 * Check both the numeric result and the pair a learner actually reads.
 */
export async function runFoundationSemantics(page, { baseURL }) {
  let checks = 0;
  const load = async id => {
    const response = await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    assert.equal(response.status(), 200, id);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
  };
  const change = async (name, value) => page.locator(`[data-input="${name}"]`).evaluate((input, value) => {
    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  const state = () => page.locator('[data-result]').evaluate(output => ({ ...output.dataset }));
  const expectDrawing = async label => {
    const drawing = await page.locator('[data-plane]').evaluate(svg => {
      const bounds = svg.querySelector('[data-drawing]').getBBox();
      const view = svg.viewBox.baseVal;
      return {
        invalid: /NaN|Infinity/.test(svg.innerHTML),
        fits: bounds.x >= view.x && bounds.y >= view.y && bounds.x + bounds.width <= view.x + view.width && bounds.y + bounds.height <= view.y + view.height,
      };
    });
    assert.equal(drawing.invalid, false, `${label}: finite drawing`);
    assert.equal(drawing.fits, true, `${label}: vectors and labels fit the plotted view`);
    checks += 2;
  };
  const expectResult = async (expected, label) => {
    const actual = await state();
    assert.deepEqual([Number(actual.resultX), Number(actual.resultY)], expected, label);
    const text = (await page.locator('[data-result]').innerText()).replaceAll('−', '-');
    const pairs = [...text.matchAll(/\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/g)];
    assert(pairs.length > 0, `${label}: the visible output must include a coordinate pair`);
    assert.deepEqual(pairs.at(-1).slice(1).map(Number), expected, `${label}: the visible pair matches the result`);
    await expectDrawing(label);
    checks += 3;
  };

  await load('vector-components');
  await expectResult([3, 2], 'right three and up two');
  await page.locator('[data-tail="shifted"]').click();
  const translated = await state();
  assert.deepEqual([Number(translated.startX), Number(translated.startY), Number(translated.endX), Number(translated.endY)], [-2, -1, 1, 1], 'moving the tail preserves the same displacement');
  checks++;
  await expectResult([3, 2], 'translation leaves the vector unchanged');
  await change('x', 0); await change('y', 0);
  const stationary = await state();
  assert.deepEqual([stationary.startX, stationary.startY], [stationary.endX, stationary.endY], 'zero vector starts and ends at the same point');
  checks++;
  await expectResult([0, 0], 'zero vector at a translated start');
  await change('x', -3); await change('y', -2);
  await expectResult([-3, -2], 'left and down are negative components');
  await page.locator('[data-reset]').click();
  assert.equal(await page.locator('[data-tail="origin"]').getAttribute('aria-pressed'), 'true');
  assert.deepEqual([await page.locator('[data-input="x"]').inputValue(), await page.locator('[data-input="y"]').inputValue()], ['3', '2']);
  checks += 2;
  await expectResult([3, 2], 'components reset restores both controls and result');

  await load('vector-operations');
  await expectResult([1, 3], '(2, 1) followed by (-1, 2)');
  await page.locator('[data-order="vu"]').click();
  assert.equal((await state()).order, 'vu'); checks++;
  await expectResult([1, 3], 'reversing addition order leaves the endpoint unchanged');
  await page.locator('button[data-mode="scaling"]').click();
  for (const [scalar, expected] of [[-2, [-4, -2]], [0, [0, 0]], [0.5, [1, 0.5]], [2, [4, 2]]]) {
    await change('k', scalar);
    assert.equal(Number((await state()).scalar), scalar); checks++;
    await expectResult(expected, `multiply (2, 1) by ${scalar}`);
  }
  await page.locator('[data-reset]').click();
  assert.equal((await state()).mode, 'addition');
  assert.equal((await state()).order, 'uv');
  assert.equal(await page.locator('[data-input="k"]').inputValue(), '1');
  checks += 3;
  await expectResult([1, 3], 'operations reset restores addition and original order');

  await load('linear-combination');
  await expectResult([2, 1], 'one horizontal move and one diagonal move');
  await change('a', 1); await change('b', 2);
  await expectResult([3, 2], 'one u plus two v reaches the target');
  assert.equal((await state()).goalReached, 'true'); checks++;
  await page.locator('[data-example="negative"]').click();
  await expectResult([0, 1], 'minus one u plus one v cancels the horizontal move');
  assert.equal((await state()).goalReached, 'false'); checks++;
  await change('a', 0.5); await change('b', -0.5);
  await expectResult([0, -0.5], 'opposite half moves cancel the horizontal part');
  await change('a', 0); await change('b', 2);
  await expectResult([2, 2], 'zero coefficient omits u');
  await page.locator('[data-example="zero"]').click();
  await expectResult([2, 0], 'zero coefficient omits v');
  await change('a', 0); await change('b', 0);
  await expectResult([0, 0], 'both zero coefficients give the zero vector');
  await page.locator('[data-reset]').click();
  assert.deepEqual([await page.locator('[data-input="a"]').inputValue(), await page.locator('[data-input="b"]').inputValue()], ['1', '1']);
  checks++;
  await expectResult([2, 1], 'combination reset restores the starting example');

  await load('span-explorer');
  const choose = async value => page.locator('select[data-set]').selectOption(value);
  const expectSpan = async (kind, label) => {
    assert.equal((await state()).spanKind, kind, label);
    checks++;
  };
  await expectResult([1, 0], 'one horizontal generator');
  await expectSpan('line', 'one nonzero vector spans a line');
  assert.equal(Number((await state()).coefficientB), 0, 'the hidden second coefficient does not contribute in the one-vector mode'); checks++;
  await change('a', -2);
  await expectResult([-2, 0], 'negative multiples extend the line in the opposite direction');
  await page.locator('[data-samples]').check();
  assert(Number((await state()).sampleCount) > 1, 'sample mode draws a finite collection of attainable vectors');
  assert(Number.isFinite(Number((await state()).sampleCount)), 'sample count is finite');
  await expectSpan('line', 'showing samples does not shrink the span to a finite set');
  assert.match(await page.locator('[data-scope]').innerText(), /실수/, 'the explanation distinguishes the all-real span from the slider samples');
  checks += 3;

  await choose('collinear');
  await change('a', 1); await change('b', 1);
  await expectResult([3, 0], 'one (1, 0) plus one (2, 0)');
  await expectSpan('line', 'a second vector on the same line does not fill the plane');
  await change('a', -2); await change('b', 1);
  await expectResult([0, 0], 'two nonzero coefficients can cancel with collinear generators');
  await expectSpan('line', 'a zero result from one choice does not make the whole span zero');
  await change('a', 2); await change('b', 2);
  await expectResult([6, 0], 'the largest positive coefficients still lie on the same line');

  await choose('plane');
  await change('a', 1); await change('b', 1);
  await expectResult([2, 1], 'the two nonparallel generators reproduce the combination example');
  await expectSpan('plane', 'nonparallel generators span the plane');
  await change('a', 1); await change('b', -1);
  await expectResult([0, -1], 'subtracting the diagonal generator reaches below the horizontal axis');
  await change('a', -2); await change('b', -2);
  await expectResult([-4, -2], 'negative coefficient extremes remain finite');
  await page.locator('[data-samples]').check();
  assert(Number((await state()).sampleCount) > 1, 'plane mode can show a finite sample without treating it as the whole plane'); checks++;
  await page.locator('[data-samples]').uncheck();
  assert.equal(Number((await state()).sampleCount), 0, 'hiding samples removes the sampled points'); checks++;
  await expectSpan('plane', 'the span is independent of the sampled-point display');

  await choose('zero');
  await expectResult([0, 0], 'zero generators can only give the zero vector');
  await expectSpan('zero', 'zero generators do not create a line');
  assert.equal(await page.locator('[data-input="a"]').isEnabled(), true);
  assert.equal(await page.locator('[data-input="b"]').isEnabled(), true);
  checks += 2;
  await change('a', 2); await change('b', -2);
  await expectResult([0, 0], 'changing the coefficients cannot produce a nonzero vector from zero generators');
  assert.deepEqual([(await state()).coefficientA, (await state()).coefficientB], ['2', '-2'], 'zero mode actually changes the coefficients while the result stays zero'); checks++;
  await page.locator('[data-reset]').click();
  assert.equal(await page.locator('select[data-set]').inputValue(), 'one');
  assert.equal(await page.locator('[data-samples]').isChecked(), false);
  assert.equal(await page.locator('[data-input="a"]').isEnabled(), true);
  checks += 3;
  await expectResult([1, 0], 'span reset restores the single-vector example');

  await load('subspace-closure');
  const expectClosure = async (expected, inside, zeroIncluded, label) => {
    await expectResult(expected, label);
    const actual = await state();
    assert.equal(actual.inside, String(inside), `${label}: membership`);
    assert.equal(actual.zeroIncluded, String(zeroIncluded), `${label}: zero-vector condition`);
    assert((await page.locator('[data-membership]').innerText()).trim().length > 10, `${label}: the membership result is explained in text`);
    checks += 3;
  };
  await expectClosure([3, 3], true, true, 'adding two points on the line y = x stays on the line');
  await page.locator('button[data-mode="scaling"]').click();
  await change('k', -2);
  await expectClosure([-2, -2], true, true, 'negative multiples remain on the line through the origin');
  await change('k', 0);
  await expectClosure([0, 0], true, true, 'multiplication by zero stays on the line');

  await choose('shifted');
  await page.locator('button[data-mode="addition"]').click();
  await expectClosure([1, 3], false, false, 'the sum of (0, 1) and (1, 2) leaves y = x + 1');
  await page.locator('button[data-mode="scaling"]').click();
  await change('k', 0);
  await expectClosure([0, 0], false, false, 'multiplication by zero leaves the shifted line');

  await choose('segment');
  await page.locator('button[data-mode="addition"]').click();
  await expectClosure([1.5, 0], false, true, 'two points in the segment have a sum beyond its endpoint');
  await change('t', 0.25); await change('s', 0.5);
  await expectClosure([0.75, 0], true, true, 'one successful addition does not prove closure for the whole segment');
  assert.match(await page.locator('[data-proof]').innerText(), /모든|항상|일부|한 번/, 'the explanation addresses all inputs rather than declaring success from one trial'); checks++;
  await page.locator('button[data-mode="scaling"]').click();
  await change('t', 1); await change('k', 2);
  await expectClosure([2, 0], false, true, 'doubling the segment endpoint leaves the segment');
  await change('k', -1);
  await expectClosure([-1, 0], true, true, 'reversing the symmetric segment endpoint remains inside but does not prove closure');
  await change('k', 0);
  await expectClosure([0, 0], true, true, 'the segment contains zero even though it is not a subspace');

  await choose('axes');
  await page.locator('button[data-mode="addition"]').click();
  await expectClosure([1, 1], false, true, 'one vector from each coordinate axis has a sum on neither axis');
  await change('t', 0);
  await expectClosure([0, 1], true, true, 'a successful special case cannot establish closure of the two-axis union');
  await page.locator('button[data-mode="scaling"]').click();
  await change('t', 1); await change('k', -2);
  await expectClosure([-2, 0], true, true, 'the two-axis union is closed under scaling but not addition');

  await choose('zero');
  await page.locator('button[data-mode="addition"]').click();
  await expectClosure([0, 0], true, true, 'the sum in the zero-vector set remains zero');
  await page.locator('button[data-mode="scaling"]').click();
  await expectClosure([0, 0], true, true, 'scaling zero remains zero');

  await choose('plane');
  await page.locator('button[data-mode="addition"]').click();
  await expectClosure([2, 3], true, true, 'the whole plane contains the sum of (1, 1) and (1, 2)');
  await page.locator('button[data-mode="scaling"]').click();
  await change('k', -2);
  await expectClosure([-2, -2], true, true, 'the whole plane contains negative scalar multiples');
  // Exercise every available control boundary in both operation modes. These
  // checks catch invalid or clipped geometry without duplicating the model formula.
  for (const set of ['line', 'shifted', 'segment', 'axes', 'zero', 'plane']) {
    await choose(set);
    for (const mode of ['addition', 'scaling']) {
      await page.locator(`button[data-mode="${mode}"]`).click();
      for (const bound of ['min', 'max']) {
        await page.locator('input[type="range"]:visible:enabled').evaluateAll((inputs, bound) => {
          for (const input of inputs) {
            input.value = input[bound];
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, bound);
        const actual = await state();
        assert(Number.isFinite(Number(actual.resultX)) && Number.isFinite(Number(actual.resultY)), `${set}, ${mode}, ${bound}: finite coordinates`);
        await expectDrawing(`${set}, ${mode}, ${bound}`);
        checks++;
      }
    }
  }
  await page.locator('[data-reset]').click();
  assert.equal(await page.locator('select[data-set]').inputValue(), 'line');
  assert.equal((await state()).mode, 'addition'); checks += 2;
  await expectClosure([3, 3], true, true, 'closure reset restores the original line and pair');

  return { checks, experiments: 5 };
}
