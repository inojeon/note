const base = document.body.dataset.base;
const effectiveTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const hosts = new Set();
function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  const apply = () => { button.setAttribute('aria-label', `${effectiveTheme() === 'dark' ? '밝은' : '어두운'} 테마로 변경`); for (const host of hosts) host.send('theme', { theme: effectiveTheme() }); };
  button.addEventListener('click', () => { const theme = effectiveTheme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; try { localStorage.setItem('note-theme', theme); } catch {} apply(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', apply); apply();
}
function initSearch() {
  const dialog = document.querySelector('.search-dialog'), input = dialog.querySelector('input'), results = dialog.querySelector('.search-results'), status = dialog.querySelector('.search-status');
  let request, revision = 0, opener;
  const normalize = text => String(text).normalize('NFC').toLowerCase();
  async function search() {
    const current = ++revision, query = normalize(input.value).trim(), terms = query.split(/\s+/).filter(Boolean); results.replaceChildren();
    if (!terms.length) { status.textContent = '제목, 설명, 본문에서 검색합니다.'; return; }
    status.textContent = '노트를 찾고 있어요…';
    try {
      request ||= fetch(document.body.dataset.search).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(items => items.map(item => ({ ...item, haystack: normalize([item.title, item.summary, ...item.terms, item.text].join(' ')), heading: normalize(item.title), aliases: normalize(item.terms.join(' ')) })));
      const notes = await request; if (current !== revision) return;
      const matches = notes.filter(note => terms.every(t => note.haystack.includes(t))).map(note => ({ note, score: (note.heading === query ? 100 : 0) + terms.reduce((s, t) => s + (note.heading.includes(t) ? 20 : 0) + (note.aliases.includes(t) ? 12 : 0), 0) })).sort((a,b) => b.score-a.score || a.note.title.localeCompare(b.note.title, 'ko'));
      status.textContent = matches.length ? `${matches.length}개 노트를 찾았어요.` : '일치하는 노트가 없어요. 다른 표현으로 검색해 보세요.';
      for (const { note } of matches.slice(0, 30)) { const li = document.createElement('li'), link = document.createElement('a'), title = document.createElement('strong'), summary = document.createElement('p'); link.href = note.url; title.textContent = note.title; summary.textContent = note.summary; link.append(title, summary); li.append(link); results.append(li); }
    } catch { request = null; if (current === revision) status.textContent = '검색을 불러오지 못했어요. 다시 입력하거나 모든 노트에서 찾아보세요.'; }
  }
  function open(source) { opener = source; if (!dialog.open) dialog.showModal(); input.focus(); search(); }
  for (const button of document.querySelectorAll('[data-open-search]')) button.addEventListener('click', () => open(button));
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(document.activeElement); } });
  input.addEventListener('input', search); input.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { const first = results.querySelector('a'); if (first) { e.preventDefault(); first.focus(); } } });
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
}
function initConcepts() {
  if (!('showPopover' in HTMLElement.prototype)) return;
  let current, pinned = false, closeTimer, suppress = false;
  const panel = document.createElement('div'); panel.className = 'concept-popover'; panel.id = 'concept-preview'; panel.setAttribute('popover', 'manual'); panel.setAttribute('role', 'dialog'); document.body.append(panel);
  const isOpen = () => panel.matches(':popover-open');
  function position() { if (!current || !isOpen()) return; const rect = current.getBoundingClientRect(); panel.style.width = `${Math.min(360, innerWidth - 28)}px`; panel.style.maxHeight = `${Math.max(130, innerHeight - 32)}px`; const height = panel.getBoundingClientRect().height; const below = innerHeight - rect.bottom - 20, above = rect.top - 20; const onBottom = height <= below || below >= above; panel.style.maxHeight = `${Math.max(100, onBottom ? below : above)}px`; const size = panel.getBoundingClientRect(); panel.style.left = `${Math.max(14, Math.min(rect.left, innerWidth - size.width - 14))}px`; panel.style.top = `${Math.max(14, Math.min(onBottom ? rect.bottom + 8 : rect.top - size.height - 8, innerHeight - size.height - 14))}px`; }
  function close(restore = false) { clearTimeout(closeTimer); const prior = current; current = null; pinned = false; if (isOpen()) panel.hidePopover(); prior?.setAttribute('aria-expanded', 'false'); if (restore && prior) { suppress = true; prior.focus(); queueMicrotask(() => { suppress = false; }); } }
  function open(button) { clearTimeout(closeTimer); if (current === button && isOpen()) return; close(); const source = document.querySelector(`template[data-concept-template="${CSS.escape(button.dataset.concept)}"]`); if (!source) return; panel.replaceChildren(source.content.cloneNode(true)); panel.querySelector('.concept-read').href = button.dataset.href; current = button; panel.setAttribute('aria-label', `${button.textContent} 개념 미리보기`); panel.querySelector('[data-close-card]').addEventListener('click', () => close(true)); panel.showPopover(); button.setAttribute('aria-expanded', 'true'); position(); }
  const delayedClose = () => { clearTimeout(closeTimer); closeTimer = setTimeout(() => { if (!pinned && !panel.contains(document.activeElement) && document.activeElement !== current) close(); }, 180); };
  for (const anchor of document.querySelectorAll('a[data-concept]')) {
    if (!document.querySelector(`template[data-concept-template="${CSS.escape(anchor.dataset.concept)}"]`)) continue;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'concept-trigger'; button.dataset.concept = anchor.dataset.concept; button.dataset.href = anchor.href; button.innerHTML = anchor.innerHTML; button.setAttribute('aria-expanded','false'); button.setAttribute('aria-controls', panel.id); button.setAttribute('aria-haspopup','dialog');
    button.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') open(button); }); button.addEventListener('pointerleave', delayedClose);
    button.addEventListener('focus', () => { if (!suppress && button.matches(':focus-visible')) open(button); }); button.addEventListener('blur', delayedClose);
    button.addEventListener('click', e => { if (current === button && pinned) { close(true); } else { open(button); pinned = true; if (e.detail === 0) panel.querySelector('button')?.focus(); } });
    button.addEventListener('keydown', e => { if (e.key === 'Tab' && !e.shiftKey && current === button && isOpen()) { e.preventDefault(); pinned = true; panel.querySelector('button')?.focus(); } });
    anchor.replaceWith(button);
  }
  panel.addEventListener('pointerenter', () => clearTimeout(closeTimer)); panel.addEventListener('pointerleave', delayedClose);
  panel.addEventListener('focusout', () => setTimeout(() => { if (!panel.contains(document.activeElement) && document.activeElement !== current) close(); }, 0));
  panel.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const nodes = [...panel.querySelectorAll('button,a')];
    const index = nodes.indexOf(document.activeElement);
    const within = nodes[index + (e.shiftKey ? -1 : 1)];
    if (index >= 0 && within) { e.preventDefault(); within.focus(); return; }
    if (e.shiftKey && document.activeElement === nodes[0]) {
      e.preventDefault(); suppress = true; current?.focus(); queueMicrotask(() => { suppress = false; });
    } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
      const order = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')].filter(el => el.tabIndex >= 0 && !el.disabled && el.getClientRects().length && !panel.contains(el));
      const next = order[order.indexOf(current) + 1];
      if (next) { e.preventDefault(); close(); next.focus(); }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(panel.contains(document.activeElement)); } });
  document.addEventListener('pointerdown', e => { if (current && !current.contains(e.target) && !panel.contains(e.target)) close(); });
  window.addEventListener('resize', position); window.addEventListener('scroll', position, { passive:true });
}
function initExperiments() {
  const observer = new IntersectionObserver(entries => { for (const entry of entries) { const host = entry.target.experimentHost; host.visible = entry.isIntersecting; if (entry.isIntersecting && !host.started) host.start(); host.send('active', { active: entry.isIntersecting && !document.hidden }); } }, { rootMargin: '160px' });
  for (const section of document.querySelectorAll('[data-experiment]')) {
    const stage = section.querySelector('.experiment-stage'), status = section.querySelector('.experiment-status'), retry = section.querySelector('.experiment-retry'), guide = section.querySelector('.experiment-guide');
    let frame, token, timer, ready = false;
    const host = { started: false, visible: false, send(type, extra = {}) { frame?.contentWindow?.postMessage({ channel:'learning-experiment', token, type, ...extra }, location.origin); }, fail() { clearTimeout(timer); host.send('dispose'); frame?.remove(); frame = null; ready = false; stage.hidden = true; section.dataset.state = 'error'; status.textContent = '실험을 불러오지 못했어요. 아래 설명을 읽거나 다시 시도해 주세요.'; retry.hidden = false; retry.textContent = '다시 시도'; guide.open = true; }, start() { clearTimeout(timer); host.send('dispose'); frame?.remove(); host.started = true; ready = false; token = crypto.randomUUID(); frame = document.createElement('iframe'); const url = new URL(section.dataset.src, location.href); url.searchParams.set('instance', token); frame.src = url.href; frame.title = section.querySelector('h2').textContent; stage.replaceChildren(frame); stage.hidden = false; retry.hidden = true; status.textContent = '실험을 준비하고 있어요…'; section.dataset.state = 'loading'; timer = setTimeout(host.fail, 25000); } };
    section.experimentHost = host; hosts.add(host); retry.addEventListener('click', host.start); observer.observe(section);
    window.addEventListener('message', event => {
      if (!frame || event.origin !== location.origin || event.source !== frame.contentWindow) return;
      const data = event.data; if (data?.channel !== 'learning-experiment' || data.token !== token) return;
      if (data.type === 'ready') { clearTimeout(timer); ready = true; section.dataset.state = 'ready'; status.textContent = ''; guide.open = false; host.send('theme', { theme:effectiveTheme() }); host.send('active', { active:host.visible && !document.hidden }); }
      if (data.type === 'error') host.fail();
      if (data.type === 'resize' && ready && Number.isFinite(data.height)) frame.style.height = `${Math.min(1800, Math.max(180, data.height))}px`;
    });
  }
  document.addEventListener('visibilitychange', () => { for (const host of hosts) host.send('active', { active:host.visible && !document.hidden }); });
  window.addEventListener('pagehide', event => {
    if (event.persisted) { for (const host of hosts) host.send('active', {active:false}); }
    else { observer.disconnect(); for (const host of hosts) host.send('dispose'); }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { for (const host of hosts) host.send('active', {active:host.visible && !document.hidden}); }
  });
  window.addEventListener('beforeprint', () => document.querySelectorAll('.experiment-guide').forEach(el => { el.dataset.wasOpen = String(el.open); el.open = true; }));
  window.addEventListener('afterprint', () => document.querySelectorAll('.experiment-guide').forEach(el => { el.open = el.dataset.wasOpen === 'true'; }));
}
async function handleLegacy() {
  const legacy = document.querySelector('[data-legacy-target]');
  if (!legacy && !(location.pathname === base || location.pathname === `${base}index.html`)) return;
  if (!legacy && !location.hash && !location.search) return;
  try { const response = await fetch(`${base}legacy-routes.json`); if (!response.ok) throw new Error('주소 대응표를 불러오지 못했습니다.'); const routes = await response.json(); const query = new URLSearchParams(location.search); const hash = decodeURIComponent(location.hash.slice(1)); const selection = query.get('graph-view') === 'path' ? query.get('graph-path') || hash : query.get('graph-note') || query.get('graph-path') || hash;
    const original = legacy?.dataset.legacyFile || 'index.html'; const key = `${original}#${hash}`;
    const target = routes.anchors[key] || routes.slugs[selection] || legacy?.dataset.legacyTarget;
    if (typeof target === 'string') location.replace(new URL(target, new URL(base, location.origin)).href);
  } catch (error) { console.error(error); }
}
for (const init of [initTheme, initSearch, initConcepts, initExperiments]) { try { init(); } catch (error) { console.error(error); } }
handleLegacy();
