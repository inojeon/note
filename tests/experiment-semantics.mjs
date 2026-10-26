import assert from 'node:assert/strict';

/** Mathematical and scientific checks, independent of screenshot/layout tests.
 * The caller owns the browser page, request/error collection and static server.
 */
export async function runExperimentSemantics(page, { baseURL }) {
  let checks = 0;
  const near = (actual, expected, tolerance = 1e-6) => {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
    checks++;
  };
  const load = async id => {
    const response = await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    assert.equal(response.status(), 200);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
  };
  const change = async (selector, value, event = 'input') => page.locator(selector).evaluate((element, args) => {
    element.value = args.value;
    element.dispatchEvent(new Event(args.event, { bubbles: true }));
  }, { value: String(value), event });
  const number = async selector => parseFloat((await page.locator(selector).textContent()).replace('−', '-'));
await load('vector-direction');for(const [deg,x,y]of [[0,1,0],[90,0,1],[180,-1,0],[360,1,0]]){await change('#angle',deg);near(await number('[data-x]'),x);near(await number('[data-y]'),y);near(await number('[data-norm]'),1);const v=await page.locator('[data-plot]').evaluate(e=>[Number(e.dataset.componentX),Number(e.dataset.componentY)]);near(v[0]*v[0]+v[1]*v[1],1);}await change('#angle',90);await page.locator('[data-reset]').click();near(await number('[data-angle]'),45);
await load('basis');await change('#s',1);assert.equal(await page.locator('[data-coords]').textContent(),'(3.0, 1.0)');checks++;
await load('inner-product');await change('#theta',90);near(await number('[data-dot]'),0);
await load('symmetric');await change('#b',0);near(await number('[data-dot]'),0);assert.equal(await page.locator('[data-values]').textContent(),'2.000, 1.000');checks++;
await load('eigen');await change('#theta',45);near(await number('[data-cross]'),0);
await load('quantum-state');await change('#qstate-angle',35);assert.match(await page.locator('#qstate-norm').textContent(),/1\.000000/);checks++;
await load('born-oppenheimer');await page.waitForTimeout(800);near(await number('#boh2-electronic')+await number('#boh2-nuclear'),await number('#boh2-total'),.000002);// WebGL availability is covered separately; the energy identity is device independent.

await change('#boh2-distance',0);await page.waitForTimeout(30);await page.waitForTimeout(250);near(await number('#boh2-total'),-.9141497046270839,.000001);
await load('measurement-basis');await change('#bm-state','plus','change');await change('#bm-basis','X','change');near(await number('#bm-p-first'),100);await change('#bm-basis','Z','change');near(await number('#bm-p-first'),50);
await load('vqe-hydrogen');await page.locator('#vh-reference').click();near(await number('#vh-energy'),await number('#vh-exact'),.000001);
await load('shot-statistics');await change('#p',.5);await change('#m',100);near(await number('[data-error]'),.05);await change('#m',400);near(await number('[data-error]'),.025);
await load('discovery-probability');near(await number('[data-found]'),63.23,.01);
await load('jordan-wigner-parity');near(await number('[data-sign]'),-1);await change('#target',0,'change');near(await number('[data-sign]'),0);
await load('atomic-shells');near(await number('[data-valence]'),5);
await load('orbital-volume');const before=await number('[data-surface]');await change('#yaw',-50);near(await number('[data-surface]'),before);
await load('n2-preparation');near(await number('[data-nao]'),28);near(await number('[data-gap]'),80.320,.001);near(await number('[data-core]'),-77.417423,.000001);
await load('quickstart-results');near(await number('[data-core]'),-76.408921,.000001);near(await number('[data-error]'),.10568,.00001);
await load('sqd-iterations');await change('#iteration',8);near(await number('[data-error]'),1.44304,.00001);

  return {checks};
}

/** Formulas must show the latest model state, in accessible MathML and HTML. */
export async function runDynamicMathChecks(page, { baseURL }) {
  const experiments = [
    'basis-set', 'computational-basis', 'entanglement', 'excitation-state',
    'h2-state-energy', 'molecular-orbital', 'quantum-state', 'qubit',
    'slater-determinant', 'sqd-sampling', 'sqd-subspace', 'tensor-product',
    'two-level-system', 'vqe-hydrogen'
  ];
  let formulas = 0;
  for (const id of experiments) {
    await page.goto(new URL(`experiments/${id}/`, baseURL).href);
    await page.waitForSelector('body[data-state="ready"]', { timeout: 30000 });
    for (const boundary of ['min', 'max']) {
      await page.evaluate(boundary => {
        for (const input of document.querySelectorAll('input[type="range"]')) {
          input.value = input[boundary];
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        for (const select of document.querySelectorAll('select')) {
          select.selectedIndex = boundary === 'min' ? 0 : select.options.length - 1;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, boundary);
      await page.waitForFunction(() => {
        const nodes = [...document.querySelectorAll('.math-tex[data-tex]')];
        return nodes.length && nodes.every(node =>
          node.querySelector('annotation[encoding="application/x-tex"]')?.textContent === node.dataset.tex
          && node.querySelector('math') && node.querySelector('.katex-html'));
      });
      const count = await page.locator('.math-tex[data-tex]').count();
      assert.ok(count > 0, `${id} must contain a rendered equation`);
      formulas += count;
    }
  }
  return { experiments: experiments.length, formulas };
}
