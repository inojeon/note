"""Build the relationship page from the same catalog as the note cards.

Prerequisite arrows use only authored prerequisites; reading links are not
silently promoted to mathematical dependencies. No graph service is needed.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'


def build_relations():
    catalog = json.loads((DOCS / 'assets/note-catalog.json').read_text())
    config = json.loads((DOCS / 'assets/relation-map.json').read_text())
    notes = []
    for slug, info in catalog['notes'].items():
        source = (DOCS / f'concept-{slug}.html').read_text()
        title = html.unescape(re.sub('<[^>]+>', '', re.search(r'<h1>(.*?)</h1>', source, re.S)[1]))
        notes.append({'id': slug, 'title': title,
                      'label': re.sub(r'\([^()]*\)', '', title).strip(),
                      'group': info['map'], 'kind': info['kind'],
                      'question': info['question']})
    ids = {n['id'] for n in notes}
    groups = {g['id'] for g in config['groups']}
    assert groups == set(catalog['maps'])
    assert all(n['group'] in groups for n in notes)
    # Store one connection per pair. Explicit prerequisite arrows take priority
    # over the reading links that often repeat them in the opposite direction.
    edges = {}
    for slug, info in catalog['notes'].items():
        for previous in info['prerequisites']:
            assert previous in ids
            key = tuple(sorted((previous, slug)))
            edge = {'from': previous, 'to': slug, 'type': 'prerequisite'}
            assert key not in edges or edges[key] == edge, 'Conflicting prerequisite directions'
            edges[key] = edge
    for slug, info in catalog['notes'].items():
        for related in info['related']:
            target = related['slug']
            if target not in ids:
                continue  # A learning-map card is not an individual note.
            key = tuple(sorted((slug, target)))
            kind = 'application' if (related['relation'] == '분자에 적용'
                    or (info['kind'] != '응용' and catalog['notes'][target]['kind'] == '응용')) else 'related'
            if key not in edges or (edges[key]['type'] == 'related' and kind == 'application'):
                edges[key] = {'from': slug, 'to': target, 'type': kind}
    for group in config['groups']:
        group['notes'] = catalog['maps'][group['id']]
        assert all(n in ids for n in group['notes'])
    for path in config['paths']:
        assert 3 <= len(path['steps']) <= 5
        assert all(step['slug'] in ids and step['why'] for step in path['steps'])
    assert all(e['from'] in groups and e['to'] in groups for e in config['overview'])
    data = dict(config, notes=notes, edges=list(edges.values()))
    template = (ROOT / 'tools/relations-page.html').read_text()
    template = template.replace('__GRAPH_DATA__', json.dumps(data, ensure_ascii=False).replace('<', r'\u003c'))
    template = template.replace('__GRAPH_RUNTIME__', (DOCS / 'assets/note-relations.js').read_text())
    (DOCS / 'concept-relations.html').write_text(template)
    print(f'Built relationship data: {len(notes)} notes, {len(edges)} connections')


if __name__ == '__main__':
    build_relations()
