"""Check the short-note contract, authored links, and glossary regressions."""
import html
import json
import re
from pathlib import Path
from concept_dom import Node, Parser, plain
from remodel_notes import nodes, has

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
MAPS = {'learning-maps', 'quantum-chemistry', 'quantum-computing', 'vqe', 'sqd'}


def read(path):
    parser = Parser()
    parser.feed(path.read_text())
    return parser.root


def reading_text(node, expanded=False):
    if not isinstance(node, Node):
        return '' if node.lstrip().startswith('<!--') else html.unescape(node)
    if node.tag in {'script', 'style', 'nav', 'svg', 'header'} or has(node, 'term-popover') or has(node, 'note-related'):
        return ''
    children = node.children
    if node.tag == 'details' and not expanded:
        children = [c for c in children if isinstance(c, Node) and c.tag == 'summary']
    return ' '.join(reading_text(c, expanded) for c in children)


def main():
    catalog = json.loads((DOCS / 'assets/note-catalog.json').read_text())
    sources = {p.stem.removeprefix('concept-'): read(p) for p in DOCS.glob('concept-*.html')}
    assert set(catalog['notes']) == set(sources) - MAPS - {'relations'}
    targets = {'concepts.html', 'quantum-chemistry.html', 'learning-maps.html'} | {f'concept-{s}.html' for s in sources}
    results = []
    for slug, info in catalog['notes'].items():
        tree = sources[slug]
        elements = list(nodes(tree))
        page = next(n for n in elements if n.tag == 'main')
        assert page.attrs.get('data-note-layout') == '1', slug
        chapters = [n for n in page.children if isinstance(n, Node) and has(n, 'note-section')]
        assert len(chapters) == 4, slug
        assert [plain(next(n for n in c.children if isinstance(n, Node) and n.tag == 'h2')) for c in chapters] == [
            '01 · 정의와 핵심', '02 · 예시와 실험', '03 · 기억할 점', '04 · 연결해서 읽기'], slug
        for cls in ['concept-definition', 'note-guide', 'note-check', 'lead']:
            assert sum(has(n, cls) for n in elements) == 1, (slug, cls)
        assert 1 <= len(info['related']) <= 3, slug
        assert len(info['prerequisites']) <= 2, slug
        assert all(r['reason'] and r['relation'] for r in info['related']), slug
        ids = [n.attrs['id'] for n in elements if 'id' in n.attrs]
        assert len(ids) == len(set(ids)), slug
        for n in elements:
            if n.tag == 'a' and 'href' in n.attrs:
                href = n.attrs['href']
                if href.startswith('#'):
                    assert href[1:] in ids, (slug, href)
                else:
                    assert href.split('#')[0].split('?')[0] in targets, (slug, href)
        visible = len(' '.join(reading_text(page).split()))
        expanded = len(' '.join(reading_text(page, True).split()))
        assert visible <= 2200, (slug, 'Visible text exceeds the 2,200-character budget', visible)
        results.append({'slug': slug, 'visible_characters': visible, 'expanded_characters': expanded})
        raw_text = plain(page)
        for bad in ['행렬(Matrix)식', '교환(Commutativity)', '비직교(Orthogonality)',
                    '중첩(Superposition)된 기저 집합', '생성(Span) 스크립트', '생성(Span) 연산자',
                    '(Measurement Basis)(Basis)', '(Spin Orbital)(Orbital)']:
            assert bad not in raw_text, (slug, bad)
    # Every note must be discoverable on a map, not only through search.
    linked = set()
    for tree in [sources[m] for m in MAPS] + [read(ROOT / 'tools/concepts-home.html')]:
        for n in nodes(tree):
            if n.tag == 'a':
                match = re.fullmatch(r'concept-([a-z0-9-]+)\.html', n.attrs.get('href', ''))
                if match:
                    linked.add(match[1])
    assert set(catalog['notes']) <= linked, set(catalog['notes']) - linked
    assert '반교환(Anticommutation)' in plain(sources['fermion-qubit'])
    assert '교환(Exchange)' in plain(sources['hartree-fock'])
    assert '교환 법칙(Commutativity)' in plain(sources['vector'])
    assert '단위 벡터' in plain(sources['vector'])
    report = {'notes': len(results), 'maps': 6, 'visible_character_limit': 2200,
              'notes_by_length': sorted(results, key=lambda r: -r['visible_characters'])}
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
