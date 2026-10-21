// Test the relationship page through native controls and offline navigation.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const docs = path.join(__dirname, '../docs');
const catalog = JSON.parse(fs.readFileSync(path.join(docs, 'assets/note-catalog.json')));
const config = JSON.parse(fs.readFileSync(path.join(docs, 'assets/relation-map.json')));
const expectedNeighbors = new Map(Object.keys(catalog.notes).map(id => [id, new Set()]));
for (const [id,n] of Object.entries(catalog.notes)) {
  for (const other of [...n.prerequisites, ...n.related.map(r=>r.slug)]) {
    if (!expectedNeighbors.has(other)) continue;
    expectedNeighbors.get(id).add(other); expectedNeighbors.get(other).add(id);
  }
}
const file = name => 'http://relations.test/' + name;

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    const page = await browser.newPage({hasTouch:true});
    page.setDefaultTimeout(10000);
    const errors=[], external=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.route('**/*', route=>{
      const url = new URL(route.request().url());
      if (url.host !== 'relations.test') {external.push(url.href);return route.abort();}
      const filename = path.join(docs,url.pathname.slice(1));
      const contentType = filename.endsWith('.css') ? 'text/css' : 'text/html';
      return route.fulfill({body:fs.readFileSync(filename),contentType});
    });
    const nodes = page.locator('#rg-nodes [data-rg-key]');
    const search = page.locator('#rg-search');
    async function center(id) {
      await search.fill(id);
      await page.locator(`#rg-results [data-rg-note="${id}"]`).tap();
      await page.locator(`#rg-nodes [data-rg-key="${id}"][aria-pressed="true"]`).waitFor();
    }
    async function bounds() {
      assert(await page.locator('#relations-app').evaluate(app=>app.getBoundingClientRect().right<=innerWidth+1));
      const problems=await nodes.evaluateAll(nodes=>{
        const stage=document.getElementById('rg-stage').getBoundingClientRect();
        return nodes.filter(n=>{
          const r=n.getBoundingClientRect();
          return r.left<stage.left-1 || r.right>stage.right+1 || r.width<44 || r.height<44
            || n.scrollHeight>n.clientHeight+2;
        }).map(n=>n.textContent);
      });
      assert.deepEqual(problems,[],'Readable, unclipped touch targets');
      const overlap=await nodes.evaluateAll(nodes=>nodes.some((a,i)=>nodes.slice(i+1).some(b=>{
        const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
        return Math.min(x.right,y.right)>Math.max(x.left,y.left)+1 && Math.min(x.bottom,y.bottom)>Math.max(x.top,y.top)+1;
      })));
      assert(!overlap,'Graph nodes do not overlap');
    }
    for (const [width,colorScheme] of [[360,'dark'],[1280,'light']]) {
      await page.setViewportSize({width,height:900});
      await page.emulateMedia({colorScheme,reducedMotion:'reduce'});
      await page.goto(file('relations.html'));
      await nodes.first().waitFor();
      assert.equal(await nodes.count(),5);
      assert((await page.locator('#rg-count').innerText()).includes('63개 노트'));
      await bounds();
      // Every note is discoverable in its field, including the four split notes.
      const discovered=new Set();
      for (const [group, ids] of Object.entries(catalog.maps)) {
        await page.locator(`#rg-nodes [data-rg-key="${group}"]`).tap();
        const displayed=await page.locator('#rg-inspector [data-rg-note]').evaluateAll(es=>es.map(e=>e.dataset.rgNote));
        assert.deepEqual(displayed,ids); displayed.forEach(id=>discovered.add(id));
      }
      assert.equal(discovered.size,63);
      await page.locator('#rg-inspector [data-rg-note="sqd-subspace"]').tap();
      assert((await page.locator('#rg-detail-title').innerText()).includes('부분공간'));
      // Every note's neighborhood agrees with the authored links, in both directions.
      for (const id of discovered) {
        await center(id);
        const neighbors=await nodes.evaluateAll(es=>es.filter(e=>e.getAttribute('aria-pressed')==='false').map(e=>e.dataset.rgKey));
        assert.deepEqual(new Set(neighbors),expectedNeighbors.get(id),id);
        assert.equal(await page.locator('#rg-fig .rg-edge').count(),neighbors.length,id);
        await bounds();
      }
      // A reading suggestion is not incorrectly promoted to a prerequisite.
      await center('hamiltonian');
      await page.locator('[data-rg-filter="prerequisite"]').tap();
      assert.deepEqual(new Set(await nodes.evaluateAll(es=>es.map(e=>e.dataset.rgKey))),
        new Set(['hamiltonian','vector','eigen','born-oppenheimer','potential-energy']));
      assert((await page.locator('#rg-nodes [data-rg-key="eigen"]').innerText()).includes('먼저 이해하기'));
      assert((await page.locator('#rg-nodes [data-rg-key="born-oppenheimer"]').innerText()).includes('이 개념을 바탕으로'));
      await page.locator('[data-rg-filter="application"]').tap();
      assert.deepEqual(await nodes.evaluateAll(es=>es.map(e=>e.dataset.rgKey)),['hamiltonian','h2-hamiltonian']);
      await page.locator('[data-rg-filter="related"]').tap();
      assert.equal(await page.locator('#rg-fig .rg-edge[marker-end], #rg-fig .rg-edge[marker-start]').count(),0);
      await page.locator('[data-rg-filter="all"]').tap();
      await page.locator('#rg-nodes [data-rg-key="eigen"]').tap();
      assert(await page.locator('#rg-nodes [data-rg-key="eigen"][aria-pressed="true"]').count());
      await page.locator('[data-rg-filter="application"]').tap();
      assert.equal(await nodes.count(),1); assert(await page.locator('.rg-empty').isVisible());
      await center('hamiltonian');
      await page.locator('[data-rg-filter="prerequisite"]').tap();
      await page.reload();
      await page.locator('#rg-nodes [data-rg-key="hamiltonian"]').waitFor();
      assert.equal(await page.locator('[data-rg-filter="prerequisite"]').getAttribute('aria-pressed'),'true');
      // Opening a note then going back restores the selected neighborhood.
      await page.locator('#rg-inspector .rg-open-note').tap();
      await page.locator('#page-hamiltonian').waitFor({state:'visible'});
      await page.goBack();
      await page.locator('#page-relations').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-rg-filter="prerequisite"]').getAttribute('aria-pressed'),'true');
      // Both per-note and global entry links focus the current note.
      await page.evaluate(()=>{location.hash='qubit';});
      await page.locator('#page-qubit .note-graph-link').tap();
      await page.locator('#rg-nodes [data-rg-key="qubit"][aria-pressed="true"]').waitFor();
      await page.evaluate(()=>{location.hash='sqd-subspace';});
      await page.locator('#reader-relations-open').tap();
      await page.locator('#rg-nodes [data-rg-key="sqd-subspace"][aria-pressed="true"]').waitFor();
      // Goal paths keep each selected step and its explanation together.
      await page.locator('[data-rg-view="path"]').tap();
      for (const route of config.paths) {
        await page.locator(`[data-rg-path="${route.id}"]`).tap();
        assert.deepEqual(await nodes.evaluateAll(es=>es.map(e=>e.dataset.rgKey)),route.steps.map(s=>s.slug));
        for(const step of route.steps){
          await page.locator(`#rg-nodes [data-rg-key="${step.slug}"]`).tap();
          assert((await page.locator('#rg-inspector').innerText()).includes(step.why));
          assert.equal(await page.locator('#rg-inspector .rg-open-note').getAttribute('href'),'#'+step.slug);
        }
        await bounds();
      }
      await page.reload();
      await page.locator('[data-rg-path="define-hamiltonian"][aria-pressed="true"]').waitFor();
      assert.equal(await page.locator('#rg-inspector .rg-open-note').getAttribute('href'),'#large-hamiltonian');
      // Search handles English, Korean variants, injection text, keyboard and IME.
      for(const [query,id] of [['큐비트','qubit'],['백터','vector'],['STO 3G','sto-3g'],['Hamiltonian','hamiltonian']]){
        await search.fill(query); assert(await page.locator(`#rg-results [data-rg-note="${id}"]`).count());
      }
      await search.fill('<img src=x onerror=alert(1)>');assert.equal(await page.locator('#rg-results img').count(),0);
      assert((await page.locator('#rg-search-status').innerText()).includes('없습니다'));
      await search.fill('qubit');
      await search.dispatchEvent('compositionstart');
      await search.dispatchEvent('keydown',{key:'Enter',isComposing:true});
      assert.equal(await page.locator('[data-rg-view="path"]').getAttribute('aria-pressed'),'true');
      await search.dispatchEvent('compositionend');
      await search.press('ArrowDown');
      assert(await page.locator('#rg-results button').first().evaluate(e=>e===document.activeElement));
      await page.keyboard.press('Enter');
      assert(await page.locator('#rg-nodes [data-rg-key="qubit"][aria-pressed="true"]').count());
      await page.locator('[data-rg-view="overview"]').tap();
      await bounds();
      // Primary navigation still fits on a phone.
      assert(await page.locator('.reader-home-nav').evaluate(n=>n.scrollWidth<=n.clientWidth+1));
    }
    // Standalone source links also carry note context without the reader router.
    await page.goto(file('concept-relations.html')+'?graph-view=note&graph-note=hamiltonian');
    await page.locator('#rg-nodes [data-rg-key="hamiltonian"]').waitFor();
    assert.equal(await page.locator('.rg-open-note').getAttribute('href'),'concept-hamiltonian.html');
    // Invalid URL state falls back to a usable overview, never an empty view.
    await page.goto(file('relations.html')+'?graph-view=missing&graph-note=missing&graph-group=missing');
    await nodes.first().waitFor(); assert.equal(await nodes.count(),5);
    // Entry card is present in all readers; a note can be opened offline from the graph.
    for(const reader of ['learning-maps.html','concepts.html','quantum-chemistry.html']){
      await page.goto(file(reader)+'#learning-maps');
      await page.locator('.relations-entry').tap();
      await nodes.first().waitFor();
      await center('sto-3g');
      await page.locator('.rg-open-note').tap();
      await page.locator('#page-sto-3g').waitFor({state:'visible'});
    }
    // HTML preview hosts can forbid history writes; graph navigation still works.
    await page.addInitScript(()=>{
      history.replaceState=()=>{throw new DOMException('Preview URL is read-only','SecurityError');};
    });
    await page.goto(file('relations.html'));
    await nodes.first().waitFor();
    await center('hamiltonian');
    await page.locator('.rg-open-note').tap();
    await page.locator('#page-hamiltonian').waitFor({state:'visible'});
    await page.goBack();
    await page.locator('#rg-nodes [data-rg-key="hamiltonian"][aria-pressed="true"]').waitFor();
    assert.deepEqual(errors,[]); assert.deepEqual(external,[]);
    console.log('PASS 63 notes and authored neighborhoods, typed connections, 3 learning paths, offline readers, contextual links, history/reload, keyboard/IME/touch and 360/1280 layouts');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
