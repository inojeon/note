// Browser regression checks for the self-contained concept readers.
// Requires Playwright and Chromium. Optional PLAYWRIGHT_MODULE / CHROMIUM_PATH
// select an existing installation without downloading another browser.
// Run after enrich_concepts.py and build_concepts.py:
//   node tools/check_quantum_concepts.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const docs = path.resolve(__dirname, '../docs');
const near = (actual, expected, tolerance = .0006) =>
  assert(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const real = text => Number(text.replace(/−/g, '-').replace(/[^\d.eE+\-]/g, ''));
const pages = ['quantum-chemistry', 'quantum-state', 'born-rule', 'superposition', 'observable', 'schrodinger'];

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox'],
  });
  const errors = [];
  let states = 0, popovers = 0;
  try {
    const context = await browser.newContext();
    await context.route('**/*', async route => {
      const name = new URL(route.request().url()).pathname.slice(1);
      assert(['concepts.html', 'quantum-chemistry.html'].includes(name), `Unexpected dependency: ${name}`);
      await route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(docs, name), 'utf8') });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const base = 'http://concept-reader.test/quantum-chemistry.html';
    const active = () => page.locator('[data-page]:not([hidden])');
    const go = async slug => {
      await page.evaluate(slug => { location.hash = slug; }, slug);
      await page.locator(`#page-${slug}`).waitFor({ state: 'visible' });
    };
    const column = async selector => (await page.locator(`${selector} .math-row`).allTextContents()).map(real);
    const slider = async (id, value) => page.locator(id).fill(String(value));
    await page.goto(base);
    assert.equal(await active().getAttribute('data-page'), 'quantum-chemistry');
    const broken = await page.evaluate(() => {
      const slugs = new Set([...document.querySelectorAll('[data-page]')].map(p => p.dataset.page));
      return [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
        .filter(href => href !== '#reader-content' && (!href.startsWith('#') || !slugs.has(href.slice(1))));
    });
    assert.deepEqual(broken, [], 'All bundled links must resolve internally');
    const ids = await page.locator('[id]').evaluateAll(es => es.map(e => e.id));
    assert.equal(new Set(ids).size, ids.length, 'Unique ids including dynamically rendered SVG');

    for (const [width, colorScheme] of [[360, 'dark'], [1280, 'light']]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await go('quantum-chemistry');
      for (const [route, expected] of [
        ['first', ['quantum-state','born-rule','superposition','observable','hamiltonian','schrodinger']],
        ['matrix', ['basis','quantum-state','born-rule','hamiltonian']],
        ['energy', ['observable','hamiltonian','schrodinger']],
      ]) {
        await page.locator(`#qc-route-${route}`).click();
        const links = await page.locator('#qc-route-result a').evaluateAll(es => es.map(e => e.getAttribute('href')));
        assert.deepEqual(links, expected.map(s => '#' + s));
      }
      await page.locator('#qc-route-first').click();
      await page.locator('#qc-route-result a').first().click();
      await page.locator('#page-quantum-state').waitFor({state:'visible'});
      assert.equal(await active().getAttribute('data-page'), 'quantum-state');
      await page.goBack();
      await page.locator('#page-quantum-chemistry').waitFor({state:'visible'});
      assert.equal(await active().getAttribute('data-page'), 'quantum-chemistry');
      await page.goForward();
      await page.locator('#page-quantum-state').waitFor({state:'visible'});
      assert.equal(await active().getAttribute('data-page'), 'quantum-state');
      await page.reload();
      assert.equal(await active().getAttribute('data-page'), 'quantum-state');
      assert(await page.locator('#qstate-general-state math munderover').count());
      assert.equal(await page.locator('#qstate-general-state math').evaluate(e=>e.namespaceURI), 'http://www.w3.org/1998/Math/MathML');
      assert.equal(await page.locator('#qstate-coordinate-map math mtr').count(), 3);

      for (const deg of [-90,-40,0,35,90]) {
        await slider('#qstate-angle', deg);
        const values = await column('#qstate-rotated'), theta = (35-deg)*Math.PI/180;
        near(values[0], Math.cos(theta)); near(values[1], Math.sin(theta));
        const dirac = (await page.locator('#qstate-expansion > div').nth(1).locator('math > mrow > mn').allTextContents()).map(Number);
        near(dirac[0], Math.abs(values[0])); near(dirac[1], Math.abs(values[1]));
        near(values[0]**2+values[1]**2, 1, .0015); states++;
      }
      await page.locator('#qstate-aligned').click();
      assert.deepEqual(await column('#qstate-rotated'), [1,0]);
      await go('born-rule');
      for (const deg of [-180,-90,-30,0,30,45,90,150,180]) {
        await slider('#born-angle', deg);
        const values = await column('#born-vector'), theta = deg*Math.PI/180;
        near(values[0], Math.cos(theta)); near(values[1], Math.sin(theta));
        for (const [suffix, probability] of [['zero',Math.cos(theta)**2],['one',Math.sin(theta)**2]]) {
          const text = await page.locator(`#born-result-${suffix}`).innerText();
          near(Number(text.match(/확률 ([\d.]+)%/)[1]), probability*100, .051);
        }
        states++;
      }
      await page.locator('#born-negative').click();
      assert.equal(await page.locator('#born-angle').inputValue(), '150');
      await go('superposition');
      for (const deg of [0,30,60,90,120,180,270,360]) {
        await slider('#phase-angle', deg);
        const probability = (1+Math.cos(deg*Math.PI/180))/2;
        const text = await page.locator('#phase-status').innerText();
        near(Number(text.match(/P\(\+\) = ([\d.]+)%/)[1]), probability*100, .051);
        near(Number(text.match(/P\(−\) = ([\d.]+)%/)[1]), (1-probability)*100, .051);
        assert(text.includes('원래 기저에서는 50%, 50%'));
        const coeffs = await page.locator('#phase-rotated-coeff .math-row').allTextContents();
        const complex = coeffs.map(s => {
          const match = s.replace(/−/g,'-').match(/(-?[\d.]+) ([+-]) ([\d.]+)i/);
          assert(match, s);
          return [Number(match[1]), Number(match[3])*(match[2]==='-'?-1:1)];
        });
        const rad = deg*Math.PI/180;
        near(complex[0][0], (1+Math.cos(rad))/2); near(complex[0][1], Math.sin(rad)/2);
        near(complex[1][0], (1-Math.cos(rad))/2); near(complex[1][1], -Math.sin(rad)/2);
        states++;
      }
      await go('observable');
      for (const percent of [0,10,25,50,75,90,100]) {
        await slider('#obs-p', percent);
        const p=percent/100;
        near(real(await page.locator('#obs-mean').innerText()), 3-2*p, .0051);
        near(real(await page.locator('#obs-variance').innerText()), 4*p*(1-p), .0051);
        const values = await column('#obs-state');
        near(values[0], Math.sqrt(p)); near(values[1], Math.sqrt(1-p)); states++;
      }
      await page.locator('[data-obs-p="50"]').click();
      assert((await page.locator('#obs-status').innerText()).includes('1u 또는 3u만'));
      await go('schrodinger');
      for (const deg of [-90,-45,-10,0,30,45,75,90]) {
        await slider('#sch-angle', deg);
        const c=[Math.cos(deg*Math.PI/180),Math.sin(deg*Math.PI/180)];
        const hc=[.8*c[0]-.5*c[1],-.5*c[0]+1.2*c[1]];
        const energy=c[0]*hc[0]+c[1]*hc[1];
        const norm=Math.hypot(hc[0]-energy*c[0],hc[1]-energy*c[1]);
        near(real(await page.locator('#sch-energy').innerText()), energy, .00006);
        near(real(await page.locator('#sch-residual').innerText()), norm, .00006);
        const drawn=await column('#sch-hc'); near(drawn[0],hc[0]);near(drawn[1],hc[1]);states++;
      }
      for (const [preset, eigenvalue] of [['ground',1-Math.hypot(.2,.5)],['excited',1+Math.hypot(.2,.5)]]) {
        await page.locator(`#sch-${preset}`).click();
        near(real(await page.locator('#sch-energy').innerText()), eigenvalue, .00006);
        assert(real(await page.locator('#sch-residual').innerText())<1e-12);
        states++;
      }

      for (const slug of pages) {
        await go(slug);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const figures=await active().locator('svg').evaluateAll(es=>es.map(e=>e.innerHTML));
        assert(figures.every(s=>s.length>50&&!/NaN|Infinity/.test(s)));
        await active().locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));
        const overflow = await active().locator('math').evaluateAll(es=>es.filter(e=>!e.closest('.term-popover')).filter(e=>{
          const r=e.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1);
        }).map(e=>e.getAttribute('aria-label')));
        assert.deepEqual(overflow,[], `Math must fit the viewport on ${slug}`);
        for (const trigger of await active().locator('.term-trigger').all()) {
          await trigger.click();
          const id=await trigger.getAttribute('aria-controls');
          const panel=page.locator('#'+id);
          assert(await panel.evaluate(e=>e.matches(':popover-open')));
          assert(await panel.locator('.term-example').count());
          assert(await panel.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1}));
          await page.keyboard.press('Escape');
          assert(!(await panel.evaluate(e=>e.matches(':popover-open')))); popovers++;
        }
        await active().locator('details').evaluateAll(es=>es.forEach(e=>e.open=false));
      }
    }
    // Test the same artifact with native touch input and tooltip navigation.
    const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    await touch.route('**/*',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(docs,'quantum-chemistry.html'),'utf8')}));
    const mobile=await touch.newPage();
    mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(base+'#superposition');
    const trigger=mobile.locator('#page-superposition .term-trigger').first();
    await trigger.tap();
    const panel=mobile.locator('#'+await trigger.getAttribute('aria-controls'));
    assert(await panel.evaluate(e=>e.matches(':popover-open')));
    await trigger.tap(); assert(!(await panel.evaluate(e=>e.matches(':popover-open'))));
    await mobile.locator('[data-phase-angle="180"]').tap();
    assert((await mobile.locator('#phase-status').innerText()).includes('P(+) = 0.0%'));
    await touch.close();
    await page.goto('http://concept-reader.test/concepts.html');
    assert.equal(await active().getAttribute('data-page'),'home');
    await active().getByRole('link',{name:'양자화학 개념 지도 →'}).click();
    await page.locator('#page-quantum-chemistry').waitFor({state:'visible'});
    assert.equal(await active().getAttribute('data-page'),'quantum-chemistry');
    await page.goto('http://concept-reader.test/concepts.html#sqd-linear-algebra');
    assert.equal(await active().getAttribute('data-page'),'hamiltonian');
    await page.goto(base+'#missing-page');
    assert.equal(await active().getAttribute('data-page'),'quantum-chemistry');
    assert.deepEqual(errors,[]);
    console.log(`PASS: ${states} numerical states; ${popovers} glossary interactions; internal routes, history/reload, touch, 360px dark and 1280px light; no script errors`);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
