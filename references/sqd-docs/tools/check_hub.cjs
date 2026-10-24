// Browser checks for the hub (docs/index.html) and the packaged site.
//   node tools/check_hub.cjs   (PLAYWRIGHT_MODULE and CHROMIUM_PATH as for the other checks)
// Pages are served from a fake https origin so storage and the clipboard behave as on
// GitHub Pages. Any request outside that origin fails the check. HUB_SCREENSHOT_DIR saves screens.
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..'), DOCS = path.join(ROOT, 'docs');
const HUB = 'https://hub.test', SITE = 'https://site.test';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const readerPages = new Set([...fs.readFileSync(path.join(DOCS, 'learning-maps.html'), 'utf8')
  .matchAll(/data-page="([a-z0-9-]+)"/g)].map(m => m[1]));
// Expected sizes come from the same sources as the hub, so adding a note needs no edit here.
const catalog = JSON.parse(fs.readFileSync(path.join(DOCS, 'assets/note-catalog.json'), 'utf8'));
const groups = JSON.parse(fs.readFileSync(path.join(DOCS, 'assets/relation-map.json'), 'utf8')).groups;
const READERS = new Set(['learning-maps.html', 'concepts.html', 'quantum-chemistry.html', 'relations.html']);
const MAIN_DOCS = fs.readdirSync(DOCS).filter(f => f.endsWith('.html') && !f.startsWith('concept-')
  && !READERS.has(f) && f !== 'index.html' && f !== 'index-main.html');
const TOTAL = Object.keys(catalog.notes).length + MAIN_DOCS.length;
const ROUTES = Object.keys(catalog.maps).length + 1;
const HOME = catalog.maps.home, FIRST_ROUTE = groups[0].title;
const after = id => HOME[HOME.indexOf(id) + 1];
const errors = [], outside = [];
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const same = (actual, expected, message) => { assert.deepEqual(actual, expected, message); checks++; };

async function serve(browser, dir, origin, options = {}) {
  const context = await browser.newContext(options);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { outside.push(url.href); return route.abort(); }
    const file = path.join(dir, url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1)));
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return route.fulfill({ status: 404, body: 'missing' });
    return route.fulfill({ contentType: TYPES[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  return context;
}
async function open(context, url) {
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(`${url}: ${e.message}`));
  await page.goto(url);
  return page;
}
const mark = (page, id, state) => page.click(`li[data-id="${id}"] input[value="${state}"] + span`);
const stateOf = (page, id) => page.getAttribute(`li[data-id="${id}"]`, 'data-state');
const shown = page => page.$$eval('.hub-station:not([hidden])', rows => rows.map(r => r.dataset.id));
const resume = async page => [await page.textContent('[data-resume] [data-label]'), await page.getAttribute('[data-resume] a', 'href')];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
  const shots = process.env.HUB_SCREENSHOT_DIR;
  if (shots) fs.mkdirSync(shots, { recursive: true });
  try {
    // First visit: every page listed once, every link resolves, the start card leads.
    const desk = await serve(browser, DOCS, HUB, { viewport: { width: 1280, height: 900 } });
    await desk.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: HUB });
    const page = await open(desk, HUB + '/index.html');
    same(await page.locator('.hub-station').count(), TOTAL, 'stations');
    same(await page.locator('.hub-line').count(), ROUTES, 'routes');
    for (const href of await page.$$eval('.hub-title', links => links.map(a => a.getAttribute('href')))) {
      const [file, slug] = href.split('#');
      ok(fs.existsSync(path.join(DOCS, file)), href);
      if (slug) ok(readerPages.has(slug), href);
    }
    ok(await page.isVisible('[data-start] a[data-open="intro"]'), 'story start is primary');
    ok(await page.isVisible('[data-start] a[data-open="vector"]'), 'concept start is offered');
    ok(await page.isHidden('[data-resume]') && await page.isHidden('.hub-move') && await page.isHidden('#hub-summary'), 'nothing to resume yet');
    ok(await page.isVisible('#stations-home') && await page.isHidden('#stations-sqd'), 'only the first route is open');
    await page.click('[data-line="sqd"] .hub-fold');
    ok(await page.isVisible('#stations-sqd'), 'a route unfolds');
    same(await page.getAttribute('[data-line="sqd"] .hub-fold', 'aria-expanded'), 'true');
    await page.click('[data-line="sqd"] .hub-fold');
    ok(await page.isHidden('#stations-sqd'), 'and folds again');
    if (shots) await page.screenshot({ path: path.join(shots, 'hub-desktop-first.png') });

    // Marks update the row, the route tally, the summary and the recommendation, and persist.
    await mark(page, 'vector', 'read');
    same(await stateOf(page, 'vector'), 'read');
    same(await page.evaluate(() => localStorage.getItem('sqd-progress:v1:vector')), 'read');
    same(await page.textContent('[data-line="home"] [data-line-progress]'), `${HOME.length}편 중 이해 0 · 읽음 1`, 'route tally');
    same(await page.textContent('#hub-summary [data-route-progress]'), `${FIRST_ROUTE} ${HOME.length}편 중 이해 0 · 읽음 1`, 'current route first');
    same(await resume(page), ['다음 추천', 'learning-maps.html#' + after('vector')]);
    ok(await page.isVisible('.hub-move'), 'transfer appears once something is marked');
    ok(await page.isHidden('[data-start]'), 'start card gives way after the first mark');
    await mark(page, 'power', 'understood');
    same(await resume(page), ['다음 추천', 'learning-maps.html#' + after('power')], 'jumping ahead moves the recommendation');
    await mark(page, 'vector', 'understood');
    same(await resume(page), ['다음 추천', 'learning-maps.html#' + after('power')], 're-marking an old page keeps it');
    await page.reload();
    same(await stateOf(page, 'power'), 'understood', 'marks survive a reload');
    ok(await page.isChecked('li[data-id="vector"] input[value="understood"]'), 'radio restored');

    // Opening a page from the hub asks about it on return without moving the recommendation.
    const eigenTitle = await page.textContent('a.hub-title[data-open="eigen"]');
    await page.click('a.hub-title[data-open="eigen"]');
    await page.waitForURL(HUB + '/learning-maps.html#eigen');
    ok(await page.isVisible('[data-page="eigen"]'), 'reader opens the note');
    await page.goBack();
    await page.waitForSelector('[data-hub]');
    await page.waitForFunction(() => !document.querySelector('[data-opened]').hidden);
    same(await page.textContent('[data-opened-title]'), eigenTitle, 'opened page is offered for marking');
    same(await resume(page), ['다음 추천', 'learning-maps.html#' + after('power')], 'opening does not move the recommendation');
    await page.click('[data-opened] [data-quick="read"]');
    same(await stateOf(page, 'eigen'), 'read', 'quick mark from the card');
    ok(await page.isHidden('[data-opened]'), 'prompt closes once marked');

    // Search (Korean and English), the empty state and both filters.
    await page.fill('#hub-q', '고유값');
    let ids = await shown(page);
    ok(ids.includes('eigen') && ids.length < TOTAL, `search 고유값: ${ids}`);
    ok(new RegExp(`^${TOTAL}편 중 \\d+편$`).test(await page.textContent('#hub-count')), 'result count');
    await page.fill('#hub-q', 'qubit');
    ok((await shown(page)).includes('qubit'), 'English term');
    await page.fill('#hub-q', '없는검색어zz');
    ok(await page.isVisible('#hub-empty'), 'empty state');
    ok((await page.textContent('#hub-empty')).includes('‘없는검색어zz’에 맞는 문서가 없어요'), 'empty state names the term');
    await page.click('#hub-empty [data-reset]');
    same((await shown(page)).length, TOTAL, 'reset');
    await page.$eval('#hub-q', el => { el.value = '고유'; el.dispatchEvent(new InputEvent('input', { isComposing: true })); });
    same((await shown(page)).length, TOTAL, 'no filtering mid-composition');
    await page.$eval('#hub-q', el => el.dispatchEvent(new CompositionEvent('compositionend', { data: '고유' })));
    ok((await shown(page)).includes('eigen'), 'compositionend filters');
    await page.fill('#hub-q', 'jordan wigner');
    ok((await shown(page)).includes('02-jordan-wigner'), 'a space matches the en dash');
    await page.fill('#hub-q', '고유값'.normalize('NFD'));
    ok((await shown(page)).includes('eigen'), 'decomposed Hangul matches');
    await page.fill('#hub-q', '');
    await page.click('.hub-seg input[value="understood"] + span');
    same(await shown(page), ['vector', 'power'], 'status filter');
    ok(await page.getAttribute('[data-hub]', 'data-filtered') !== null, 'route lines hide while filtered');
    await page.click('.hub-seg input[value="notyet"] + span');
    await mark(page, 'krylov', 'read');
    ok(await page.isVisible('li[data-id="krylov"]'), 'a row marked under a filter stays in place');
    await page.click('.hub-seg input[value="all"] + span');
    await page.click('[data-line-filter="sqd"]');
    same(new URL(page.url()).hash, '#line=sqd');
    same(await page.$$eval('.hub-line:not([hidden])', s => s.map(x => x.dataset.line)), ['sqd'], 'route filter');
    ok(await page.isVisible('#stations-sqd'), 'filtered route is open');
    same(await page.getAttribute('[data-line-filter="sqd"]', 'aria-pressed'), 'true');
    await page.click('[data-line-filter="sqd"]');
    same(await page.locator('.hub-line:not([hidden])').count(), ROUTES, 'route filter toggles off');

    // Keyboard: arrow keys move through a row's three marks.
    await page.focus('li[data-id="diagonalization"] input[value="notyet"]');
    await page.keyboard.press('ArrowRight');
    same(await stateOf(page, 'diagonalization'), 'read', 'arrow key marks');
    same(await page.evaluate(() => document.activeElement.closest('li').dataset.id), 'diagonalization', 'focus stays on the row');

    // Transfer link round trip into an empty browser profile: merge, undo, replace.
    const before = await resume(page);
    await page.click('.hub-move summary');
    await page.click('#hub-copy');
    await page.waitForFunction(() => document.querySelector('#hub-copied').textContent.length > 0);
    ok(await page.isHidden('#hub-link') && (await page.textContent('#hub-copied')).startsWith('링크를 복사했어요'), 'clipboard branch');
    const link = await page.evaluate(() => navigator.clipboard.readText());
    ok(/#map=v1\.(u|r)[a-z0-9-]+.*\.ldiagonalization\.e\d+$/.test(link), link);
    const fresh = await serve(browser, DOCS, HUB);
    const other = await open(fresh, link);
    ok(await other.isVisible('#hub-offer'), 'import offer');
    ok((await other.textContent('#hub-offer')).includes('이해 2 · 읽음 3'), await other.textContent('#hub-offer'));
    same(new URL(other.url()).hash, '', 'hash cleared after reading');
    ok(await other.isDisabled('.hub-seg input[value="read"]') && await other.isDisabled('.hub-seg input[value="understood"]'), 'empty mark filters are disabled');
    same(await stateOf(other, 'power'), 'notyet', 'nothing changes before accepting');
    await other.click('#hub-offer [data-merge]');
    same([await stateOf(other, 'power'), await stateOf(other, 'krylov')], ['understood', 'read'], 'import restores marks');
    same(await other.evaluate(() => localStorage.getItem('sqd-progress:v1:vector')), 'understood');
    same(await other.evaluate(() => localStorage.getItem('sqd-progress:v1-last')), 'diagonalization', 'last mark travels with the link');
    same(await resume(other), before, 'same recommendation on the other device');
    ok(await other.isVisible('#hub-undo'), 'undo offered');
    await other.click('#hub-undo [data-undo]');
    same(await stateOf(other, 'power'), 'notyet', 'undo restores the previous marks');
    same(await other.evaluate(() => localStorage.getItem('sqd-progress:v1-last')), null, 'undo restores the last-marked page too');
    await other.goto(link);
    await other.click('#hub-offer [data-replace]');
    same(await stateOf(other, 'power'), 'understood', 'replace into an empty profile');
    await other.goto(HUB + '/index.html#map=v1.rbasis.e1');
    await other.click('#hub-offer [data-merge]');
    same([await stateOf(other, 'basis'), await stateOf(other, 'power')], ['read', 'understood'], 'merge keeps higher marks');
    await other.goto(HUB + '/index.html#map=v1.rbasis.e1');
    await other.click('#hub-offer [data-replace]');
    same([await stateOf(other, 'basis'), await stateOf(other, 'power')], ['read', 'notyet'], 'replace makes marks match the link');
    await other.click('#hub-undo [data-undo]');
    same(await stateOf(other, 'power'), 'understood', 'undo after replace');
    for (const [hash, message] of [['map=v9.rvector', '더 새로운 버전'], ['map=garbage', '읽지 못했어요'], ['map=v1.' + 'rvector.'.repeat(600), '너무 길어요']]) {
      await other.goto(HUB + '/index.html#' + hash);
      await other.waitForFunction(m => document.querySelector('#hub-note').textContent.includes(m), message);
      ok(await other.isHidden('#hub-offer'), `${message}: no offer`);
    }
    await other.goto(HUB + '/index.html#map=v1.rzzz-unknown.rbasis.e2');
    await other.waitForSelector('#hub-offer:not([hidden])');
    ok((await other.textContent('#hub-offer')).includes('없는 문서 1편은 건너뜁니다'), 'unknown pages are skipped');
    ok(await other.isHidden('#hub-note'), 'old error cleared');
    await other.click('#hub-offer [data-decline]');
    same(await other.evaluate(() => document.activeElement.id), 'hub-next', 'focus returns to the card');

    // Regressions from the pre-landing review.
    const edge = await serve(browser, DOCS, HUB);
    const hostile = await open(edge, HUB + '/index.html#map=v1.rbasis.lconstructor.e1');
    await hostile.waitForSelector('#hub-offer:not([hidden])');
    await hostile.click('#hub-offer [data-merge]');
    same(await hostile.evaluate(() => localStorage.getItem('sqd-progress:v1-last')), null, 'a prototype name is not a page id');
    await hostile.reload();
    same(await stateOf(hostile, 'basis'), 'read', 'the hub still loads after a hostile link');
    await hostile.goto(HUB + '/index.html#map=v1.uvector.e1');
    await hostile.click('#hub-offer [data-merge]');
    ok(await hostile.isVisible('#hub-undo'), 'undo offered after an import');
    await mark(hostile, 'inner-product', 'read');
    ok(await hostile.isHidden('#hub-undo'), 'a later mark withdraws the undo');
    await hostile.goto(HUB + '/index.html#map=v1.rmatrix.e1');
    await hostile.waitForSelector('#hub-offer:not([hidden])');
    await hostile.goto(HUB + '/index.html#map=garbage');
    await hostile.waitForFunction(() => document.querySelector('#hub-note').textContent.includes('읽지 못했어요'));
    ok(await hostile.isHidden('#hub-offer'), 'a broken link clears the open offer');
    const quick = await open(edge, HUB + '/index.html');
    await quick.click('a.hub-title[data-open="eigen"]');
    await quick.waitForURL(HUB + '/learning-maps.html#eigen');
    await quick.goBack();
    await quick.waitForSelector('[data-opened]:not([hidden])');
    await quick.evaluate(() => localStorage.setItem('sqd-progress:v1-opened', 'symmetric'));
    await quick.click('[data-opened] [data-quick="read"]');
    same([await stateOf(quick, 'eigen'), await stateOf(quick, 'symmetric')], ['read', 'notyet'], 'quick mark acts on the page shown');
    const full = await open(edge, HUB + '/index.html');
    await full.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; });
    await mark(full, 'krylov', 'understood');
    ok((await full.textContent('#hub-note')).includes('저장하지 못해요'), 'quota notice');
    same(await full.evaluate(() => [SQDProgress.get('vector'), SQDProgress.get('krylov')]), ['understood', 'understood'], 'stored marks stay readable after a failed write');
    const everyId = await full.$$eval('.hub-station', rows => rows.map(r => r.dataset.id));
    ok(/\.uvector\./.test(await full.evaluate(list => SQDProgress.encode(list), everyId)), 'and still travel in the progress link');
    const saved = await open(edge, HUB + '/index.html?graph-view=note&graph-note=vector#relations');
    await saved.waitForURL(/\/learning-maps\.html\?[^#]*graph-note=vector[^#]*#relations$/);
    checks++;

    // Route finished, review only, everything understood, and an empty link.
    const allIds = await page.$$eval('.hub-station', rows => rows.map(r => r.dataset.id));
    const homeIds = await page.$$eval('[data-line="home"] .hub-station', rows => rows.map(r => r.dataset.id));
    const ends = await serve(browser, DOCS, HUB);
    const finish = await open(ends, HUB + '/index.html#map=v1.' + homeIds.map(id => 'u' + id).join('.') + '.l' + homeIds[homeIds.length - 1] + '.e' + homeIds.length);
    await finish.click('#hub-offer [data-merge]');
    ok(await finish.getAttribute('[data-line="home"]', 'data-complete') !== null, 'finished route is marked');
    same(await finish.textContent('[data-line="home"] [data-line-progress]'), `${homeIds.length}편 모두 이해했어요`);
    same(await resume(finish), [`${FIRST_ROUTE} 노선을 마쳤어요 · 다음 추천`, 'learning-maps.html#' + Object.values(catalog.maps)[1][0]], 'finishing a route moves on');
    await finish.goto(HUB + '/index.html#map=v1.' + allIds.map(id => 'r' + id).join('.') + '.e' + allIds.length);
    await finish.click('#hub-offer [data-replace]');
    same((await resume(finish))[0], '다시 볼 문서', 'nothing unread left: review');
    await finish.goto(HUB + '/index.html#map=v1.' + allIds.map(id => 'u' + id).join('.') + '.e' + allIds.length);
    await finish.click('#hub-offer [data-replace]');
    ok(await finish.isVisible('[data-done]') && await finish.isHidden('[data-resume]'), 'everything understood');
    await finish.goto(HUB + '/index.html#map=v1.e0');
    await finish.waitForSelector('#hub-offer:not([hidden])');
    ok((await finish.textContent('#hub-offer')).includes('표시가 없어요')
      && await finish.isHidden('#hub-offer [data-merge]') && await finish.isHidden('#hub-offer [data-replace]'), 'an empty link offers nothing to replace');
    await finish.click('#hub-offer [data-decline]');
    await finish.goto(HUB + '/index.html#map=v1.' + allIds.slice(0, 5).map(id => 'r' + id).join('.'));
    await finish.waitForFunction(() => document.querySelector('#hub-note').textContent.includes('잘리지'));
    ok(await finish.isHidden('#hub-offer'), 'a link cut before its end entry is refused');

    // Back-forward cache: a restored page repaints from storage and asks about the opened page.
    const bf = await open(await serve(browser, DOCS, HUB), HUB + '/index.html');
    await bf.evaluate(() => {
      localStorage.setItem('sqd-progress:v1:matrix', 'understood');
      localStorage.setItem('sqd-progress:v1-opened', 'symmetric');
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
    });
    same(await stateOf(bf, 'matrix'), 'understood', 'a page restored from the back-forward cache repaints');
    ok(await bf.isVisible('[data-opened]'), 'and asks about the page opened from it');
    // No clipboard API (plain http, old browsers): the link is shown, filled and focused.
    const noClip = await serve(browser, DOCS, HUB);
    await noClip.addInitScript(() => Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined, configurable: true }));
    const byHand = await open(noClip, HUB + '/index.html');
    await mark(byHand, 'vector', 'read');
    await byHand.click('.hub-move summary');
    await byHand.click('#hub-copy');
    ok(await byHand.isVisible('#hub-link'), 'manual copy field');
    ok((await byHand.inputValue('#hub-link')).endsWith('#map=v1.rvector.lvector.e1'), 'holds the link');
    same(await byHand.evaluate(() => document.activeElement.id), 'hub-link', 'focused for copying');
    // Back to 아직: the key goes, and with no marks left the start card returns.
    const unmark = await open(await serve(browser, DOCS, HUB), HUB + '/index.html');
    await mark(unmark, 'vector', 'read');
    await mark(unmark, 'vector', 'notyet');
    same(await unmark.evaluate(() => localStorage.getItem('sqd-progress:v1:vector')), null, 'un-marking removes the key');
    ok(await unmark.isVisible('[data-start] a[data-open="intro"]') && await unmark.isHidden('[data-resume]')
      && await unmark.isHidden('.hub-move') && await unmark.isHidden('#hub-summary'), 'no marks left: the start card returns');
    await unmark.reload();
    ok(await unmark.isVisible('[data-start] a[data-open="intro"]')
      && !(await unmark.evaluate(() => document.documentElement.classList.contains('hub-returning'))), 'and stays after a reload');

    // Two tabs: a mark in one tab repaints the other.
    const tabA = await open(fresh, HUB + '/index.html'), tabB = await open(fresh, HUB + '/index.html');
    same(await tabA.getAttribute('[data-line="home"] .hub-fold', 'aria-expanded'), 'true', 'the route of the last mark is open on return');
    await mark(tabA, 'subspace', 'read');
    await tabB.waitForFunction(() => document.querySelector('li[data-id="subspace"]').dataset.state === 'read');
    checks++;

    // Old public addresses forward to the reader; other hashes stay on the hub.
    const legacy = await open(fresh, HUB + '/index.html#vector');
    await legacy.waitForURL(HUB + '/learning-maps.html#vector');
    await legacy.goto(HUB + '/#relations');
    await legacy.waitForURL(/\/learning-maps\.html(\?[^#]*)?#relations$/);
    await legacy.goto(HUB + '/index.html#intro');
    await legacy.waitForSelector('[data-hub]');
    ok(legacy.url().endsWith('/index.html#intro'), 'non-reader hash stays');
    const unknownLine = await open(fresh, HUB + '/index.html#line=zzz');
    same(await unknownLine.locator('.hub-line:not([hidden])').count(), ROUTES, 'unknown route is ignored');
    const lineLink = await open(fresh, HUB + '/index.html#line=vqe');
    same(await lineLink.$$eval('.hub-line:not([hidden])', s => s.map(x => x.dataset.line)), ['vqe'], 'route link');
    await lineLink.evaluate(() => { location.hash = 'top'; });
    await lineLink.waitForFunction(n => document.querySelectorAll('.hub-line:not([hidden])').length === n, ROUTES);
    checks++;  // a later hash without line= clears the route filter

    // Blocked storage: marks still work for the tab and a notice explains why they will not last.
    const blocked = await serve(browser, DOCS, HUB);
    await blocked.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError'); }; });
    const noStore = await open(blocked, HUB + '/index.html');
    ok((await noStore.textContent('#hub-note')).includes('저장하지 못해요'), 'storage notice');
    await mark(noStore, 'vector', 'understood');
    same(await stateOf(noStore, 'vector'), 'understood', 'memory marks');

    // Phone, touch and dark mode: no sideways scroll, 44px targets, folded filters.
    const phone = await serve(browser, DOCS, HUB, { viewport: { width: 360, height: 780 }, hasTouch: true, isMobile: true, colorScheme: 'dark' });
    const small = await open(phone, HUB + '/index.html');
    // overflow-x is clipped, so a too-wide element would be cut off, not scroll: check edges.
    same(await small.evaluate(() => [...document.querySelectorAll('.hub *')].filter(el => {
      if (el.closest('.hub-routes, [hidden], .hub-sr')) return false;
      const r = el.getBoundingClientRect();
      return r.width && r.height && (r.right > innerWidth + 1 || r.left < -1);
    }).map(el => el.className || el.tagName).slice(0, 5)), [], 'nothing is cut off at 360px');
    ok(await small.$eval('li[data-id="vector"] .hub-mark span', s => s.getBoundingClientRect().height) >= 44, 'touch target');
    same(await small.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(22, 27, 34)', 'dark token');
    same(await small.evaluate(() => document.querySelector('.hub-filters').open), false, 'filters fold on phones');
    await small.tap('li[data-id="basis"] input[value="read"] + span');
    same(await stateOf(small, 'basis'), 'read', 'tap marks');
    if (shots) await small.screenshot({ path: path.join(shots, 'hub-phone-dark.png') });

    // The first paint already shows what hub.js will show, for first and returning visits.
    for (const [visit, marks] of [['first', {}], ['returning', { 'quantum-state': 'understood' }]]) {
      const ctx = await serve(browser, DOCS, HUB, { viewport: { width: 360, height: 780 } });
      await ctx.addInitScript(m => {
        for (const [id, state] of Object.entries(m)) { localStorage.setItem('sqd-progress:v1:' + id, state); localStorage.setItem('sqd-progress:v1-last', id); }
        window.__shift = 0;
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__shift += e.value; })
          .observe({ type: 'layout-shift', buffered: true });
      }, marks);
      // A slow phone (6x CPU) is when the page paints before the end-of-body script runs.
      const steady = await ctx.newPage();
      steady.on('pageerror', e => errors.push(`layout ${visit}: ${e.message}`));
      await (await ctx.newCDPSession(steady)).send('Emulation.setCPUThrottlingRate', { rate: 6 });
      await steady.goto(HUB + '/index.html');
      await steady.waitForTimeout(600);
      const shift = await steady.evaluate(() => window.__shift);
      console.log(`layout shift, ${visit} visit: ${shift.toFixed(3)}`);
      ok(shift < 0.05, `layout shift on a ${visit} visit: ${shift.toFixed(3)}`);
    }

    // Without JavaScript the list and its links remain.
    const plain = await serve(browser, DOCS, HUB, { javaScriptEnabled: false });
    const nojs = await open(plain, HUB + '/index.html');
    ok(await nojs.isHidden('.hub-tools') && await nojs.isHidden('li[data-id="vector"] .hub-mark'), 'controls hidden');
    same(await nojs.locator('a.hub-title').count(), TOTAL, 'links remain');
    ok(await nojs.isVisible('a.hub-title[data-open="vector"]') && await nojs.isVisible('#stations-sqd'), 'every route open');
    ok(await nojs.isVisible('[data-start] a[data-open="intro"]'), 'start links work without JavaScript');

    // The packaged site: hub first, readers link back, old /#page addresses still land.
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-site-'));
    try {
      execFileSync('python3', [path.join(ROOT, 'tools/package_concept_site.py'), '--output', out], { cwd: ROOT, stdio: 'pipe' });
      const site = await serve(browser, out, SITE);
      const front = await open(site, SITE + '/');
      ok(await front.isVisible('[data-hub]'), 'hub is the front page');
      for (const href of await front.$$eval('.hub-title, .hub-line-meta a, .docnav a', links => links.map(a => a.getAttribute('href'))))
        ok(fs.existsSync(path.join(out, href.split('#')[0])), `packaged ${href}`);
      await front.click('a.hub-title[data-open="vector"]');
      await front.waitForURL(SITE + '/learning-maps.html#vector');
      ok(await front.isVisible('[data-page="vector"]'), 'reader page');
      await front.click('.reader-hub-link');
      await front.waitForURL(SITE + '/index.html');
      await front.goto(SITE + '/#sqd');
      await front.waitForURL(SITE + '/learning-maps.html#sqd');
      ok(await front.isVisible('[data-page="sqd"]'), 'old address lands on its page');
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }

    same(outside, [], 'requests outside the site');
    same(errors, [], 'page errors');
    console.log(`check_hub: ${checks} checks passed`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
