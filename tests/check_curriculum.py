"""Check rewrite coverage without creating planned notes or adding authoring dependencies."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
plan = json.loads((root / 'docs/curriculum-rewrite.json').read_text())
notes = {note['id']: note for note in plan['notes']}
paths = {path['id']: path for path in plan['paths']}
baseline = set(plan['baseline_notes'])
assert len(notes) == len(plan['notes']), 'duplicate note in rewrite inventory'
assert len(paths) == len(plan['paths']), 'duplicate destination path'
assert not baseline.intersection(notes), 'baseline notes are not unfinished targets'
source_ids = {file.parent.name for file in (root / 'content/notes').glob('*/index.md')}
assert not source_ids - baseline - notes.keys(), f'unmapped notes: {source_ids - baseline - notes.keys()}'
assert baseline <= source_ids, 'a foundation note was removed'
known = baseline | notes.keys()
seen = set()
for path in paths.values():
    assert path['steps'] and len(path['steps']) == len(set(path['steps'])), path['id']
    for note_id in path['steps']:
        assert note_id in notes and note_id not in seen, f'duplicate or unknown destination: {note_id}'
        assert notes[note_id]['destination'] == path['id'], note_id
        seen.add(note_id)
companions = {note['id'] for note in notes.values() if note['destination'] == 'support'}
assert seen | companions == notes.keys(), 'every target needs a path or an explicit companion role'

for note in notes.values():
    note_id = note['id']
    assert note['origin'] in {'existing', 'new'}, note_id
    assert note['status'] in plan['status_definitions'], note_id
    assert note['purpose'] and note['experiments']['improvement'], note_id
    assert len(note['prerequisites']) == len(set(note['prerequisites'])), note_id
    assert set(note['prerequisites']) <= known and note_id not in note['prerequisites'], note_id
    if note['origin'] == 'existing' or note['status'] in {'ready-for-review', 'reviewed'}:
        assert note_id in source_ids, f'missing source: {note_id}'
    for experiment in note['experiments']['existing']:
        assert (root / 'content/experiments' / experiment / 'index.md').is_file(), f'lost experiment: {experiment}'
    if note['status'] in {'ready-for-review', 'reviewed'}:
        source = (root / 'content/notes' / note_id / 'index.md').read_text()
        actual = set(re.findall(r'\{\{< experiment id="([^"]+)"', source))
        assert set(note['experiments']['target']) <= actual, f'{note_id}: planned experiments missing'
        assert source.count('{{< answer') >= 2, f'{note_id}: missing calculation/reason exercises'
        assert (root / 'content/notes' / note_id / 'preview.md').is_file(), f'{note_id}: missing concept preview'

# Detect impossible learning orders across paths, including not-yet-created notes.
visited, visiting = set(), set()
def visit(note_id):
    if note_id in baseline or note_id in visited:
        return
    assert note_id not in visiting, f'cyclic prerequisite: {note_id}'
    visiting.add(note_id)
    for prerequisite in notes[note_id]['prerequisites']:
        visit(prerequisite)
    visiting.remove(note_id)
    visited.add(note_id)
for note_id in notes:
    visit(note_id)

existing = sum(note['origin'] == 'existing' for note in notes.values())
new = len(notes) - existing
ready = sum(note['status'] in {'ready-for-review', 'reviewed'} for note in notes.values())
print(f'PASS: {existing} existing + {new} new targets; {len(baseline)} baseline notes; '
      f'{len(paths)} planned paths; {ready} targets ready; no missing coverage or prerequisite cycle')
