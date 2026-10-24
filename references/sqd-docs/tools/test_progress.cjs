// Browser-free checks of the progress codec and store in docs/assets/progress.js.
//   node tools/test_progress.cjs   (tools/check_all.sh runs it in the quick part)
const vm = require('node:vm'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../docs/assets/progress.js'), 'utf8');
function load(storage) {
  const win = { addEventListener() {}, localStorage: storage };
  vm.runInNewContext(source, { window: win, setTimeout });
  return win.SQDProgress;
}
// A storage with a byte quota, like the browser's: a write fails when it would not fit.
function memoryStorage() {
  const m = new Map(); let quota = Infinity;
  const size = () => [...m].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return { getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      const grow = k.length + String(v).length - (m.has(k) ? k.length + m.get(k).length : 0);
      if (size() + grow > quota) throw new Error('QuotaExceededError');
      m.set(k, String(v));
    },
    removeItem: k => m.delete(k), key: i => [...m.keys()][i], get length() { return m.size; },
    full(room = 0) { quota = size() + room; }, dump: () => Object.fromEntries(m) };
}
const ids = ['vector', 'basis', 'eigen', 'matrix'];

// Codec: every link ends with e<number of marks>, so a cut link is rejected, not shortened.
let P = load(undefined);
assert.deepEqual({ ...P.decode('v1.rvector.ubasis.lbasis.e2', ids).states }, { vector: 'read', basis: 'understood' });
for (const cut of ['v1.rvector.ubasis', 'v1.rvector.uba', 'v1.rvector.ubasis.lbasis.e', 'v1.rvector.ubasis.lbasis.e1', 'v1.rvector.u', 'v1'])
  assert.equal(P.decode(cut, ids).error, 'format', `a cut or miscounted link: ${cut}`);
assert.equal(P.decode('v1.e0', ids).error, undefined, 'an empty link is well formed');
assert.equal(P.decode('v1.l' + 'a'.repeat(4089) + '.e0', ids).error, undefined, '4096 characters are allowed');
assert.equal(P.decode('v1.l' + 'a'.repeat(4090) + '.e0', ids).error, 'length', '4097 are not');
assert.equal(P.decode('v2.rvector.e1', ids).error, 'version');
assert.equal(P.decode('v1.rvector.uvector.e2', ids).states.vector, 'understood', 'a repeated id keeps the last entry');
assert.equal(P.decode('v1.rvector.e1.', ids).error, undefined, 'a trailing dot is tolerated');
assert.equal(P.decode(' v1.rvector.e1 ', ids).states.vector, 'read', 'surrounding spaces are ignored');
const hostile = P.decode('v1.rconstructor.ltostring.lconstructor.rbasis.e2', ids);
assert.deepEqual([Object.keys(hostile.states), hostile.skipped, hostile.last], [['basis'], 1, undefined], 'Object members are not ids');
assert.equal(P.set('vector', 'read'), false, 'no storage: kept in memory only');
assert.equal(P.get('vector'), 'read');
assert.equal(P.persistent(), false);

// Store: round trip, un-marking, and a failed write that keeps stored marks readable.
let storage = memoryStorage();
P = load(storage);
P.set('vector', 'understood'); P.set('basis', 'read');
const back = P.decode(P.encode(ids), ids);
assert.deepEqual([back.states.vector, back.states.basis, back.last], ['understood', 'read', 'basis'], 'round trip');
P.set('basis', 'notyet');
assert.equal(storage.getItem('sqd-progress:v1:basis'), null, 'un-marking removes the key');
assert.equal(P.hasMarks(), true);
storage.full();
assert.equal(P.set('eigen', 'read'), false, 'a failed write reports it');
assert.equal(P.persistent(), false);
assert.equal(P.get('vector'), 'understood', 'stored marks stay readable after a failed write');
assert.equal(P.encode(ids), 'v1.uvector.reigen.leigen.e2', 'and still travel in the link');

// Import: merge keeps the higher mark, replace matches the link exactly.
storage = memoryStorage();
P = load(storage);
P.set('vector', 'read');
P.load({ vector: 'understood', basis: 'read' }, ids, 'merge');
assert.deepEqual(ids.map(P.get), ['understood', 'read', 'notyet', 'notyet'], 'merge');
P.load({ eigen: 'read' }, ids, 'replace', null);
assert.deepEqual([ids.map(P.get), P.last()], [['notyet', 'notyet', 'read', 'notyet'], null], 'replace');

// A replace that runs out of room partway leaves storage as it was (removals never ran);
// the tab shows the import from its overlay, and undo restores the tab.
storage = memoryStorage();
P = load(storage);
for (const id of ['vector', 'basis', 'matrix']) P.set(id, 'understood');
const before = storage.dump(), snapshot = P.snapshot(ids);
storage.full();
assert.equal(P.load({ eigen: 'read' }, ids, 'replace', 'eigen'), false, 'a new key does not fit');
assert.deepEqual(storage.dump(), before, 'storage untouched by the failed replace');
assert.deepEqual(ids.map(P.get), ['notyet', 'notyet', 'read', 'notyet'], 'the tab shows the import');
P.load(snapshot.states, ids, 'replace', snapshot.last);
assert.deepEqual(ids.map(P.get), ['understood', 'understood', 'notyet', 'understood'], 'undo restores the tab');
assert.deepEqual(storage.dump(), before, 'and storage still holds every mark');
storage = memoryStorage();
P = load(storage);
for (const id of ids) P.set(id, 'read');
const kept = storage.dump();
storage.full('understood'.length - 'read'.length);  // room for one upgrade, not two
assert.equal(P.load({ vector: 'understood', basis: 'understood' }, ids, 'replace'), false, 'the second write fails');
assert.deepEqual(storage.dump(), kept, 'the first, stored write is put back');
console.log('test_progress: ok');
