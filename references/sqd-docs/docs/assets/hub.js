/* Hub page behaviour: marks, the next-document card, folding routes, search, filters and
   the transfer link. Runs after progress.js. The page is complete without it (every row is
   a plain link and every route is open); this script adds marks and filtering. It exits at
   once when [data-hub] is missing, which is what the fake DOM in tools/check_html.js returns. */
(function () {
  'use strict';
  var root = document.querySelector('[data-hub]'), P = window.SQDProgress;
  if (!root || !P) return;
  var $ = function (sel) { return root.querySelector(sel); };
  var all = function (sel, from) { return [].slice.call((from || root).querySelectorAll(sel)); };
  var rows = all('.hub-station'), sections = all('.hub-line'), chips = all('[data-line-filter]');
  var ids = rows.map(function (r) { return r.dataset.id; });
  var lines = sections.map(function (s) { return s.dataset.line; });
  // Prototype-free maps: ids read from storage or a link can never resolve to Object members.
  var byId = Object.create(null), sectionOf = Object.create(null);
  var byLine = Object.create(null), chipOf = Object.create(null);
  rows.forEach(function (r) {
    byId[r.dataset.id] = r;
    (byLine[r.dataset.line] = byLine[r.dataset.line] || []).push(r);
    r.radios = all('input[type="radio"]', r);
  });
  sections.forEach(function (s) { sectionOf[s.dataset.line] = s; });
  chips.forEach(function (c) { chipOf[c.dataset.lineFilter] = c; });
  var statusInputs = all('input[name="hub-status"]');
  var filter = { line: 'all', status: 'all', query: '' }, folded = {}, pending = null, undo = null, announce = 0;
  var query = $('#hub-q'), count = $('#hub-count'), empty = $('#hub-empty'), live = $('#hub-live');
  var note = $('#hub-note'), offer = $('#hub-offer'), undoBox = $('#hub-undo'), next = $('#hub-next');
  var summary = $('#hub-summary'), filters = $('.hub-filters'), filterSummary = $('[data-filter-summary]'), move = $('.hub-move');
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 900px)') : null;
  var STATUS = { all: '전체', notyet: '아직', read: '읽음', understood: '이해' };
  var ERRORS = {
    format: '진행 링크를 읽지 못했어요. 링크가 중간에 잘리지 않았는지 확인해 주세요.',
    length: '진행 링크가 너무 길어요. 링크를 다시 복사해 주세요.',
    version: '더 새로운 버전의 허브에서 만든 링크예요. 이 페이지를 새로 고친 뒤 다시 열어 주세요.'
  };
  var STORAGE = '이 브라우저는 표시를 저장하지 못해요. 이 탭을 닫으면 표시가 사라집니다.';

  function norm(text) {
    return String(text || '').normalize('NFKC').toLowerCase()
      .replace(/[\s·.,:;!?'"“”‘’()\[\]{}<>\-–—_/\\|+=*&^%$#@~`]+/g, '');
  }
  rows.forEach(function (r) { r.searchText = norm(r.dataset.search); });
  function say(text) { if (live) { live.textContent = ''; live.textContent = text; } }
  function showNote(text) { if (note) { note.textContent = text; note.hidden = !text; } }
  function storageNote() { showNote(P.persistent() ? '' : STORAGE); }
  function hashText() {
    var h = location.hash.slice(1);
    try { return decodeURIComponent(h); } catch (e) { return h; }
  }
  function setHash(value) {
    try { history.replaceState(null, '', location.pathname + location.search + (value ? '#' + value : '')); }
    catch (e) { if (!value) location.hash = ''; }
  }
  function stationsOf(line) { return byLine[line] || []; }
  function counts(list) {
    var c = { notyet: 0, read: 0, understood: 0 };
    list.forEach(function (r) { c[r.dataset.state]++; });
    return c;
  }
  function pair(c) { return '이해 ' + c.understood + ' · 읽음 ' + c.read; }
  function progress(c, total) { return c.read || c.understood ? total + '편 중 ' + pair(c) : total + '편'; }
  function paint(row) {
    var state = P.get(row.dataset.id);
    row.dataset.state = state;
    row.radios.forEach(function (input) { input.checked = input.value === state; });
  }

  /* Next document: in the route of the page marked last, the first unread page after the
     furthest page marked there, then earlier gaps, then the following routes. Opening a
     page never moves it, and re-marking an old page never pulls it backwards. */
  function recommend() {
    var lastRow = byId[P.last()] || null, start = lastRow ? lines.indexOf(lastRow.dataset.line) : 0;
    var current = stationsOf(lines[start]);
    var finished = current.every(function (r) { return r.dataset.state === 'understood'; });
    for (var k = 0; k < lines.length; k++) {
      var line = stationsOf(lines[(start + k) % lines.length]), furthest = -1;
      line.forEach(function (r, i) { if (r.dataset.state !== 'notyet') furthest = i; });
      var order = line.slice(furthest + 1).concat(line.slice(0, furthest + 1));
      var unread = order.filter(function (r) { return r.dataset.state === 'notyet'; })[0];
      if (unread) {
        var label = k && finished ? sectionOf[lines[start]].dataset.name + ' 노선을 마쳤어요 · 다음 추천' : '다음 추천';
        return { row: unread, label: label };
      }
    }
    var review = rows.filter(function (r) { return r.dataset.state === 'read'; })[0];
    return review ? { row: review, label: '다시 볼 문서' } : null;
  }
  function card(c) {
    var marks = c.read + c.understood, opened = byId[P.opened()];
    var box = next.querySelector('[data-opened]');
    box.hidden = !(opened && opened.dataset.state === 'notyet');
    // The quick marks act on the page shown here, even if another tab opens a different one.
    box.dataset.id = box.hidden ? '' : opened.dataset.id;
    if (!box.hidden) box.querySelector('[data-opened-title]').textContent = opened.querySelector('.hub-title').textContent;
    all('[data-start]', next).forEach(function (el) { el.hidden = marks > 0; });
    if (move) move.hidden = !marks;
    var resume = next.querySelector('[data-resume]'), done = next.querySelector('[data-done]');
    if (!marks) { resume.hidden = done.hidden = true; return; }
    var pick = recommend();
    done.hidden = !!pick; resume.hidden = !pick;
    if (!pick) return;
    var title = pick.row.querySelector('.hub-title'), a = resume.querySelector('a');
    resume.querySelector('[data-label]').textContent = pick.label;
    a.href = title.getAttribute('href');
    a.dataset.open = pick.row.dataset.id;
    a.textContent = title.textContent;
    resume.querySelector('[data-where]').textContent = sectionOf[pick.row.dataset.line].dataset.name + ' ' + pick.row.dataset.num;
    resume.querySelector('[data-q]').textContent = pick.row.querySelector('.hub-q').textContent;
  }
  function tally() {
    sections.forEach(function (section) {
      var list = stationsOf(section.dataset.line), c = counts(list), complete = c.understood === list.length;
      section.querySelector('[data-line-progress]').textContent = complete ? list.length + '편 모두 이해했어요' : progress(c, list.length);
      section.toggleAttribute('data-complete', complete);
      var chip = chipOf[section.dataset.line];
      if (chip) {
        chip.querySelector('[data-chip-progress]').textContent = c.understood ? c.understood + '/' + list.length : String(list.length);
        chip.querySelector('[data-chip-sr]').textContent = progress(c, list.length);
      }
    });
    var c = counts(rows), marks = c.read + c.understood;
    summary.hidden = !marks;
    if (marks) {
      var lastRow = byId[P.last()], line = lastRow ? lastRow.dataset.line : lines[0], list = stationsOf(line);
      summary.querySelector('[data-route-progress]').textContent = sectionOf[line].dataset.name + ' ' + progress(counts(list), list.length);
      summary.querySelector('[data-all-progress]').textContent = '전체 ' + progress(c, rows.length);
    }
    statusInputs.forEach(function (input) {
      input.disabled = input.value !== 'all' && !c[input.value] && filter.status !== input.value;
    });
    card(c);
  }

  function filtering() { return filter.line !== 'all' || filter.status !== 'all' || !!norm(filter.query); }
  function applyFolds() {
    var active = filtering();
    sections.forEach(function (section) {
      var list = section.querySelector('.hub-stations'), button = section.querySelector('.hub-fold');
      var closed = !active && !!folded[section.dataset.line];
      list.hidden = closed;
      button.hidden = active;
      button.setAttribute('aria-expanded', String(!closed));
      button.textContent = closed ? '펼치기' : '접기';
    });
  }
  /* Re-filter only when the filter or the search changes. A row whose mark changes stays
     where it is, so focus and screen reader position are never lost under a filter. */
  function apply(speak) {
    var q = norm(filter.query), shown = 0, active = filtering();
    sections.forEach(function (section) {
      var lineOk = filter.line === 'all' || filter.line === section.dataset.line, visible = 0;
      stationsOf(section.dataset.line).forEach(function (r) {
        var ok = lineOk && (filter.status === 'all' || r.dataset.state === filter.status) && (!q || r.searchText.indexOf(q) >= 0);
        r.hidden = !ok;
        if (ok) visible++;
      });
      section.hidden = !visible;
      shown += visible;
    });
    root.toggleAttribute('data-filtered', active);
    empty.hidden = shown > 0;
    empty.querySelector('[data-term]').textContent = filter.query.trim() ? '‘' + filter.query.trim() + '’에 맞는 ' : '이 조건에 맞는 ';
    count.textContent = active ? rows.length + '편 중 ' + shown + '편' : '';
    chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.dataset.lineFilter === filter.line)); });
    var parts = [];
    if (filter.line !== 'all') parts.push(sectionOf[filter.line].dataset.name);
    if (filter.status !== 'all') parts.push(STATUS[filter.status]);
    filterSummary.textContent = parts.length ? parts.join(' · ') : '전체';
    applyFolds();
    if (speak) {
      clearTimeout(announce);
      announce = setTimeout(function () { say(shown ? (active ? shown + '편을 보여 줍니다.' : '전체 ' + rows.length + '편을 보여 줍니다.') : '맞는 문서가 없어요.'); }, 500);
    }
  }
  function reset() {
    filter = { line: 'all', status: 'all', query: '' };
    query.value = '';
    statusInputs.forEach(function (i) { i.checked = i.value === 'all'; });
    setHash('');
    tally();
    apply(true);
  }
  function refresh() { rows.forEach(paint); tally(); apply(false); }
  function foldAround() {
    var lastRow = byId[P.last()], pick = lastRow ? recommend() : null;
    var open = pick ? pick.row.dataset.line : lastRow ? lastRow.dataset.line : lines[0];
    lines.forEach(function (line) { folded[line] = line !== open; });
  }

  function clearUndo() { undo = null; undoBox.hidden = true; }
  function offerImport(code) {
    var result = P.decode(code, ids);
    pending = null; offer.hidden = true; clearUndo();
    setHash('');
    if (result.error) { showNote(ERRORS[result.error]); say(ERRORS[result.error]); return; }
    pending = result;
    storageNote();
    var mine = counts(rows);
    var text = '받은 진행 링크에 ' + pair(result.counts) + '이 담겨 있어요.';
    if (result.skipped) text += ' 이 목록에 없는 문서 ' + result.skipped + '편은 건너뜁니다.';
    text += mine.read || mine.understood
      ? ' 합치면 문서마다 더 높은 표시를 남기고, 그대로 바꾸면 지금 표시(' + pair(mine) + ')를 링크 내용으로 바꿉니다.'
      : ' 가져오면 이 브라우저에 표시됩니다.';
    var marks = result.counts.read + result.counts.understood;
    if (!marks) text = '받은 진행 링크에 표시가 없어요. 가져올 것이 없습니다.';
    offer.querySelector('[data-merge]').hidden = offer.querySelector('[data-replace]').hidden = !marks;
    offer.querySelector('[data-offer-text]').textContent = text;
    offer.hidden = false;
    say('받은 진행 링크가 있어요. 합칠지, 바꿀지, 그만둘지 고를 수 있습니다.');
  }
  function accept(mode) {
    if (!pending) return;
    var before = P.snapshot(ids);
    // load() repaints through the change listener, which also withdraws any older undo.
    if (!P.load(pending.states, ids, mode, pending.last)) showNote(STORAGE);
    undo = before;
    offer.hidden = true;
    pending = null;
    foldAround();
    apply(false);
    undoBox.querySelector('[data-undo-text]').textContent = (mode === 'merge' ? '합쳤어요.' : '바꿨어요.') + ' 지금 ' + pair(counts(rows)) + '.';
    undoBox.hidden = false;
    say(undoBox.querySelector('[data-undo-text]').textContent);
    next.focus();
  }
  function onHash() {
    var h = hashText();
    if (h.indexOf('map=') === 0) offerImport(h.slice(4));
    else if (h.indexOf('line=') === 0 && lines.indexOf(h.slice(5)) >= 0) {
      filter.line = h.slice(5); folded[filter.line] = false;
      if (filters) filters.open = true;
      apply(false);
    } else if (filter.line !== 'all') { filter.line = 'all'; apply(false); }
  }

  /* The change listener below repaints; marking only stores and announces. */
  function markRow(row, state) {
    if (!P.set(row.dataset.id, state)) showNote(STORAGE);
    say(row.querySelector('.hub-title').textContent + ': ' + STATUS[state]);
  }
  rows.forEach(function (row) {
    row.addEventListener('change', function (event) {
      var input = event.target;
      if (input && input.type === 'radio') markRow(row, input.value);
    });
  });
  all('[data-quick]', next).forEach(function (button) {
    button.addEventListener('click', function () {
      var row = byId[next.querySelector('[data-opened]').dataset.id];
      if (!row) return;
      markRow(row, button.dataset.quick);
      next.focus();
    });
  });
  root.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-open]');
    if (link && byId[link.dataset.open]) P.touch(link.dataset.open);
  });
  sections.forEach(function (section) {
    section.querySelector('.hub-fold').addEventListener('click', function () {
      folded[section.dataset.line] = !folded[section.dataset.line];
      applyFolds();
    });
  });
  query.addEventListener('input', function (event) {
    if (event.isComposing) return;
    filter.query = query.value; apply(true);
  });
  query.addEventListener('compositionend', function () { filter.query = query.value; apply(true); });
  statusInputs.forEach(function (input) {
    input.addEventListener('change', function () { filter.status = input.value; tally(); apply(true); });
  });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      filter.line = chip.dataset.lineFilter === filter.line ? 'all' : chip.dataset.lineFilter;
      if (filter.line !== 'all') folded[filter.line] = false;
      setHash(filter.line === 'all' ? '' : 'line=' + filter.line);
      apply(true);
    });
  });
  all('[data-reset]').forEach(function (b) { b.addEventListener('click', reset); });
  offer.querySelector('[data-merge]').addEventListener('click', function () { accept('merge'); });
  offer.querySelector('[data-replace]').addEventListener('click', function () { accept('replace'); });
  offer.querySelector('[data-decline]').addEventListener('click', function () {
    pending = null; offer.hidden = true; say('가져오지 않았어요.'); next.focus();
  });
  undoBox.querySelector('[data-undo]').addEventListener('click', function () {
    if (!undo) return;
    var restore = undo;
    P.load(restore.states, ids, 'replace', restore.last);
    clearUndo();
    apply(false);
    say('가져오기 전으로 되돌렸어요.');
    next.focus();
  });
  var copy = $('#hub-copy'), copied = $('#hub-copied'), link = $('#hub-link');
  copy.addEventListener('click', function () {
    var url = location.href.split('#')[0] + '#map=' + P.encode(ids);
    var done = '링크를 복사했어요(' + pair(counts(rows)) + '). 다른 기기에서 열면 가져올 수 있어요.';
    function manual() {
      link.hidden = false; link.value = url; link.focus(); link.select();
      copied.textContent = '아래 링크를 길게 누르거나 선택해서 복사해 주세요.';
    }
    try {
      navigator.clipboard.writeText(url).then(function () { link.hidden = true; copied.textContent = done; }, manual);
    } catch (e) { manual(); }
  });
  /* On phones the filters fold into one line; on wide screens they stay open. The 900px
     query only says when to look again: the summary's own CSS display decides, so the
     filters can never be folded while hub.css hides the summary that would reopen them. */
  function fold() {
    if (!filters) return;
    var wide = getComputedStyle(filters.querySelector('summary')).display === 'none';
    filters.open = wide || filtering();
  }
  if (narrow && narrow.addEventListener) narrow.addEventListener('change', fold);
  /* Any later mark, here or in another tab, makes the import undo unsafe, so it is withdrawn. */
  P.onChange(function (id) {
    if (id === '') { tally(); return; }
    if (id && byId[id]) paint(byId[id]); else rows.forEach(paint);
    clearUndo();
    tally();
  });
  window.addEventListener('hashchange', onHash);
  /* Coming back with the browser's back button may restore this page from memory. */
  window.addEventListener('pageshow', function (event) { if (event.persisted) refresh(); });

  storageNote();
  rows.forEach(paint);
  foldAround();
  fold();
  tally();
  apply(false);
  onHash();
  document.documentElement.classList.add('hub-painted');
})();
