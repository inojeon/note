/* Self-check marks for the SQD learning pages (the hub now, the readers later).
   Storage: one localStorage key per page, "sqd-progress:v1:<id>" = "read" | "understood".
   A missing key means "not yet". "sqd-progress:v1-last" is the page marked last and
   "sqd-progress:v1-opened" the page opened last; neither starts with the per-page prefix.
   Transfer string: "v1" followed by ".<letter><id>" entries (r = read, u = understood,
   l = the page marked last) and a final ".e<N>" giving the number of r/u entries, e.g.
   "v1.rvector.ubasis.lbasis.e2". The end entry makes a link cut short by a chat app or a
   copy read as broken instead of as a smaller, valid set of marks. Page ids match
   [a-z0-9-]+ and never change, so adding or reordering pages never changes how a string reads.
   When storage cannot be written (private mode, quota, blocked site data) the marks already
   stored stay readable and new marks live in a per-tab overlay; persistent() turns false. */
(function (global) {
  'use strict';
  var KEY = 'sqd-progress:v1:', LAST = 'sqd-progress:v1-last', OPENED = 'sqd-progress:v1-opened', MAX = 4096;
  var LETTER = { read: 'r', understood: 'u' }, STATE = { r: 'read', u: 'understood' };
  var RANK = { notyet: 0, read: 1, understood: 2 };
  var overlay = Object.create(null), listeners = [], store = null, writable = false;
  try { store = global.localStorage; store.getItem(KEY); } catch (e) { store = null; }
  if (store) {
    try { store.setItem('sqd-progress:probe', '1'); store.removeItem('sqd-progress:probe'); writable = true; }
    catch (e) { writable = false; }
  }

  function valid(state) { return state === 'read' || state === 'understood'; }
  function raw(key) {
    if (key in overlay) return overlay[key];
    if (store) { try { return store.getItem(key); } catch (e) { return null; } }
    return null;
  }
  /* Returns true when stored. After the first failed write every later write stays in the
     overlay, so this tab keeps one consistent view instead of half-written storage. */
  function write(key, value) {
    if (store && writable) {
      try { if (value === null) store.removeItem(key); else store.setItem(key, value); return true; }
      catch (e) { writable = false; }
    }
    overlay[key] = value;
    return false;
  }
  function emit(id) { listeners.forEach(function (cb) { try { cb(id); } catch (e) {} }); }
  function get(id) { var v = raw(KEY + id); return valid(v) ? v : 'notyet'; }
  /* Returns true when the mark was stored, false when it lives only in memory. */
  function set(id, state) {
    var ok = write(KEY + id, valid(state) ? state : null);
    write(LAST, id);
    emit(id);
    return ok;
  }
  /* Remember the page opened last; it does not change any mark or the page marked last. */
  function touch(id) { write(OPENED, id); }
  function snapshot(ids) {
    var states = {};
    ids.forEach(function (id) { var s = get(id); if (s !== 'notyet') states[id] = s; });
    return { states: states, last: raw(LAST) };
  }
  /* mode "merge" keeps the higher mark of each page; "replace" makes ids match states exactly.
     Marks are stored before removals. If storage fails partway, the keys already stored are
     put back, so a failed import never leaves storage half replaced; this tab then shows the
     whole result from its overlay. Removals come last, so even a put-back that fails can only
     leave a mark raised, never lost. Returns true when everything was stored. */
  function load(states, ids, mode, last) {
    var plan = [], stored = [], ok = true;
    ids.forEach(function (id) {
      var incoming = valid(states[id]) ? states[id] : 'notyet';
      if (mode === 'merge' && RANK[incoming] <= RANK[get(id)]) return;
      plan.push([KEY + id, incoming === 'notyet' ? null : incoming]);
    });
    plan.sort(function (a, b) { return (a[1] === null) - (b[1] === null); });
    if (last !== undefined) plan.push([LAST, last]);
    plan.forEach(function (step) {
      var key = step[0], value = step[1], before = raw(key);
      if (ok && write(key, value)) { stored.push([key, before, value]); return; }
      if (ok) {
        ok = false;
        stored.forEach(function (done) {
          try { if (done[1] === null) store.removeItem(done[0]); else store.setItem(done[0], done[1]); } catch (e) {}
          overlay[done[0]] = done[2];
        });
      }
      overlay[key] = value;
    });
    emit(null);
    return ok;
  }
  function last() { return raw(LAST); }
  function opened() { return raw(OPENED); }
  function encode(ids) {
    var entries = ids.filter(function (id) { return get(id) !== 'notyet'; })
      .map(function (id) { return LETTER[get(id)] + id; });
    var count = entries.length;
    if (ids.indexOf(raw(LAST)) >= 0) entries.push('l' + raw(LAST));
    return ['v1'].concat(entries, 'e' + count).join('.');
  }
  /* {states, skipped, counts, last} or {error: 'length' | 'format' | 'version'}. Unknown ids are skipped. */
  function decode(text, ids) {
    text = String(text == null ? '' : text).trim();
    if (text.length > MAX) return { error: 'length' };
    var m = /^v(\d+)(?:\.|$)/.exec(text);
    if (!m) return { error: 'format' };
    if (Number(m[1]) > 1) return { error: 'version' };
    if (m[1] !== '1') return { error: 'format' };
    var known = Object.create(null), states = Object.create(null), skipped = 0, counts = { read: 0, understood: 0 }, lastId;
    ids.forEach(function (id) { known[id] = true; });
    var parts = text.split('.').slice(1).filter(Boolean), end = /^e(\d+)$/.exec(parts.pop() || '');
    if (!end) return { error: 'format' };
    var marks = parts.filter(function (part) { return part.charAt(0) !== 'l'; }).length;
    if (Number(end[1]) !== marks) return { error: 'format' };
    for (var i = 0; i < parts.length; i++) {
      var e = /^([rul])([a-z0-9-]+)$/.exec(parts[i]);
      if (!e) return { error: 'format' };
      if (!known[e[2]]) { if (e[1] !== 'l') skipped++; continue; }
      if (e[1] === 'l') lastId = e[2]; else states[e[2]] = STATE[e[1]];
    }
    Object.keys(states).forEach(function (id) { counts[states[id]]++; });
    return { states: states, skipped: skipped, counts: counts, last: lastId };
  }
  /* True when any page carries a mark (read before the body is parsed, see build_hub.py). */
  function hasMarks() {
    for (var key in overlay) if (key.indexOf(KEY) === 0 && valid(overlay[key])) return true;
    if (!store) return false;
    try {
      for (var i = 0; i < store.length; i++) {
        var k = store.key(i);
        if (k && k.indexOf(KEY) === 0 && valid(store.getItem(k))) return true;
      }
    } catch (e) {}
    return false;
  }
  /* Listeners get a page id (that page changed), null (anything may have changed) or ''
     (only the page marked last changed). Changes from other tabs arrive one storage event
     per key, so they are gathered and delivered once per task: an import of 74 marks in
     another tab costs one repaint here, not 74. */
  function onChange(cb) { listeners.push(cb); }
  var pending = null;
  function flush() {
    var ids = pending; pending = null;
    if (ids.all || ids.list.length > 8) emit(null);
    else if (!ids.list.length) emit('');
    else ids.list.forEach(emit);
  }
  if (global.addEventListener) {
    global.addEventListener('storage', function (event) {
      var key = event.key;
      if (key && key.indexOf(KEY) !== 0 && key !== LAST) return;
      if (!pending) { pending = { all: false, list: [] }; setTimeout(flush, 0); }
      if (!key) pending.all = true;
      else if (key.indexOf(KEY) === 0 && pending.list.indexOf(key.slice(KEY.length)) < 0) pending.list.push(key.slice(KEY.length));
    });
  }
  global.SQDProgress = {
    get: get, set: set, touch: touch, snapshot: snapshot, load: load, last: last, opened: opened, hasMarks: hasMarks,
    encode: encode, decode: decode, onChange: onChange, persistent: function () { return !!store && writable; }
  };
})(typeof window !== 'undefined' ? window : this);
