// 페이지 스크립트를 가짜 DOM에서 실행해 오류와 빈 그림을 찾는다 (브라우저 없이).
//   node tools/check_html.js            # docs/*.html 전부
//   node tools/check_html.js docs/intro.html --narrow   # 폰 레이아웃 경로
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), narrow = args.includes('--narrow');
const files = args.filter(a => a.endsWith('.html'));
const targets = files.length ? files : fs.readdirSync(path.join(__dirname, '..', 'docs')).filter(f => f.endsWith('.html')).map(f => path.join(__dirname, '..', 'docs', f));
let bad = 0;
for (const file of targets) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  const vals = {}; for (const m of html.matchAll(/<input[^>]*id="([^"]+)"[^>]*value="([^"]*)"/g)) vals[m[1]] = m[2];
  const els = {}, errors = [];
  const mk = id => els[id] || (els[id] = { id, innerHTML: '', textContent: '', value: vals[id] || '0', style: {}, dataset: {}, children: [], attrs: {},
    clientWidth: narrow ? 360 : 700, clientHeight: 360, firstChild: null, setAttribute(k, v) { this.attrs[k] = v }, getAttribute(k) { return this.attrs[k] },
    appendChild(c) { this.children.push(c) }, insertBefore(c) { this.children.push(c) }, addEventListener() {}, classList: { toggle() {}, add() {} } });
  global.window = { matchMedia: () => ({ matches: narrow, addEventListener() {} }), addEventListener() {}, scrollY: 0, devicePixelRatio: 1,
    console: { error: (n, e) => errors.push(n + ': ' + (e && e.message)) } };
  global.matchMedia = global.window.matchMedia; global.requestAnimationFrame = () => {};
  global.document = { getElementById: mk, querySelectorAll: () => [], querySelector: () => null, createElement: () => mk('tmp' + Math.random()) };
  for (const s of scripts) { try { new Function(s)(); } catch (e) { errors.push('script: ' + e.message); } }
  const empty = Object.values(els).filter(e => /-fig$/.test(e.id) && e.innerHTML.length < 50).map(e => e.id);
  const ok = !errors.length && !dup.length && !empty.length;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${path.basename(file)}${dup.length ? '  중복 id: ' + [...new Set(dup)].join(',') : ''}${empty.length ? '  빈 그림: ' + empty.join(',') : ''}${errors.length ? '  오류: ' + errors.join(' | ') : ''}`);
}
process.exit(bad ? 1 : 0);
