// Exercise every remodeled note, including newly separated examples, offline.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.join(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'docs/assets/note-catalog.json')));

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({hasTouch: true});
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      requests.push(route.request().url());
      assert.equal(new URL(route.request().url()).host, 'remodel.test');
      return route.fulfill({
        contentType: 'text/html',
        body: fs.readFileSync(path.join(root, 'docs/learning-maps.html'), 'utf8'),
      });
    });
    for (const [width, colorScheme] of [[360, 'dark'], [1280, 'light']]) {
      await page.setViewportSize({width, height: 900});
      await page.emulateMedia({colorScheme, reducedMotion: 'reduce'});
      await page.goto('http://remodel.test/');
      await page.evaluate(() => document.fonts.ready);
      for (const slug of Object.keys(catalog.notes)) {
        await page.evaluate(slug => { location.hash = slug; }, slug);
        const active = page.locator('#page-' + slug);
        await active.waitFor({state: 'visible'});
        assert.equal(await active.locator(':scope > .note-section').count(), 4, slug);
        assert.equal(await active.locator('.note-guide:visible').count(), 1, slug);
        // Touch the check's native disclosure; it must work without a network.
        const check = active.locator('.note-check');
        assert.equal(await check.evaluate(e => e.open), false);
        await check.locator('summary').tap();
        assert(await check.locator('p').isVisible(), slug);
        await active.locator('details').evaluateAll(es => es.forEach(e => {e.open = true;}));
        assert.equal(await active.locator('.katex-error').count(), 0, slug);
        const overflow = await active.locator('.katex-html').evaluateAll(es => es
          .filter(e => !e.closest('.term-popover'))
          .filter(e => {
            const r = e.getBoundingClientRect();
            return r.width && (r.left < -1 || r.right > innerWidth + 1);
          }).map(e => e.closest('[data-tex]')?.dataset.tex || e.textContent));
        assert.deepEqual(overflow, [], `Equation bounds: ${slug} at ${width}`);
        const cards = active.locator('.note-relation-cards a');
        assert((await cards.count()) >= 1 && (await cards.count()) <= 3);
        assert(await cards.evaluateAll(es => es.every(e => {
          const r = e.getBoundingClientRect();
          return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth;
        })), `Cards: ${slug}`);
        await active.locator('details').evaluateAll(es => es.forEach(e => {e.open = false;}));
      }
      // The coordinate experiment has its own address and keeps its numbers.
      await page.evaluate(() => {location.hash = 'diagonalization-coordinates';});
      await page.locator('#page-diagonalization-coordinates').waitFor({state: 'visible'});
      for (const [angle, expected] of [[0, [2,1,1,2]], [45, [3,0,0,1]], [90, [2,-1,-1,2]]]) {
        await page.locator('#diagonal-basis').evaluate((input, angle) => {
          input.value = String(angle);
          input.dispatchEvent(new Event('input', {bubbles: true}));
        }, angle);
        const values = await page.locator('#diagonal-matrix-value .math-cells .math-row > span')
          .evaluateAll(es => es.map(e => Number(e.textContent)));
        assert.deepEqual(values, expected);
      }
      // Preserve the old address, and make its new continuation a direct card.
      for (const [from, to] of [
        ['diagonalization', 'diagonalization-coordinates'],
        ['sto-3g', 'basis-orbital-energies'],
        ['h2-hamiltonian', 'h2-state-energy'],
        ['large-hamiltonian', 'hamiltonian-size'],
      ]) {
        await page.evaluate(s => {location.hash = s;}, from);
        const card = page.locator(`#page-${from} .note-relation-cards a[href="#${to}"]`);
        await card.tap();
        await page.locator('#page-' + to).waitFor({state: 'visible'});
      }
    }
    assert.deepEqual(errors, []);
    assert.equal(requests.length, 2, 'Only the reader document is requested');
    console.log(`PASS ${Object.keys(catalog.notes).length} notes: common structure, touch checks, every expanded formula, related cards, split-note navigation and diagonalization at 360 dark / 1280 light`);
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
