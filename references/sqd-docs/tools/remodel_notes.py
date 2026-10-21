"""Apply the shared short-note layout and authored reading guidance.

Content, experiments, IDs and data stay in concept-*.html. Edit the questions,
checks and related-card reasons in assets/note-catalog.json, then run this tool
before enrich_concepts.py / build_concepts.py. No third-party packages needed.
"""
import html
import json
import re
from pathlib import Path
from concept_dom import Node, Parser, plain
from enrich_concepts import reset

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'


def nodes(node):
    if isinstance(node, Node):
        yield node
        for child in node.children:
            yield from nodes(child)


def fragment(source):
    parser = Parser()
    parser.feed(source)
    return parser.root.children


def has(node, name):
    return isinstance(node, Node) and name in node.attrs.get('class', '').split()


def text(node):
    return re.sub(r'\s+', ' ', html.unescape(plain(node))).strip()


def link(slug, label):
    target = 'concepts.html' if slug == 'home' else f'concept-{slug}.html'
    return f'<a href="{target}">{html.escape(label)}</a>'


def generated(name, tag, body, cls=''):
    return Node(tag, {'data-note-generated': name, 'class': cls}, fragment(body))


def is_related(node):
    if has(node, 'backlinks'):
        return True
    content = text(node)
    if node.tag in {'p', 'aside', 'section'}:
        if re.match(r'^(이어서 (연결|읽)|연관 개념|관련 개념|다음 연결|이어 읽기|전자 구조로 이어가기|이 개념과 연결)', content):
            return True
        if node.tag == 'section' and any(has(n, 'cards') for n in nodes(node)):
            return True
    return False


def normalize(main, slug):
    """One-time structural migration. Later runs refresh only authored chrome."""
    if main.attrs.get('data-note-layout') == '1':
        return
    core, examples, recap, extra, assets = [], [], [], [], []
    # A generated lab's boundary comments must move together with its markup,
    # JSON and runtime, otherwise a future data rebuild could duplicate the lab.
    chunks, embedded, marker = [], [], None
    for child in main.children:
        if isinstance(child, str) and re.search(r'<!-- (?:BO_H2|STO_ORBITAL)_LAB_START -->', child):
            marker = re.search(r'<!-- (\w+)_LAB_START -->', child).group(1)
            embedded = [child]
        elif marker:
            embedded.append(child)
            if isinstance(child, str) and f'<!-- {marker}_LAB_END -->' in child:
                chunks.append(Node('div', {'class': 'note-embedded-lab'}, embedded))
                marker = None
        else:
            chunks.append(child)
    assert marker is None, f'{slug}: unclosed embedded lab'
    after_example = False
    for child in chunks:
        if not isinstance(child, Node):
            if child.strip():
                assets.append(child)
            continue
        cls = child.attrs.get('class', '').split()
        if child.tag in {'script', 'style'}:
            assets.append(child)
            continue
        if child.tag == 'nav' or child.tag == 'h1' or any(c in cls for c in ['eyebrow', 'lead']):
            continue
        if child.tag == 'p' and 'meta' in cls and text(child).startswith('먼저'):
            continue
        if is_related(child):
            continue
        if 'concept-definition' in cls:
            child.children = [n for n in child.children if not (
                isinstance(n, Node) and (n.tag == 'h2' or has(n, 'term-hint')))]
            core.insert(0, child)
        elif child.tag == 'details':
            extra.append(child)
        elif child.tag in {'figure'} or any(c.endswith('-lab') for c in cls) or 'lh-branches' in cls:
            examples.append(child)
            after_example = True
        elif child.tag == 'div' and 'box' in cls and any(
                n.tag == 'h2' and '작은 예시' in text(n) for n in nodes(child)):
            examples.append(child)
            after_example = True
        elif has(child, 'state-notation'):
            # The notation reference is useful after the first concrete example.
            child.tag = 'details'
            heading = next(n for n in child.children if isinstance(n, Node) and n.tag == 'h2')
            heading.tag = 'summary'
            extra.append(child)
        else:
            (recap if after_example else core).append(child)
    assert core, slug
    assert examples, f'{slug}: select a concrete example for the shared template'
    for group in [core, examples, recap]:
        for item in group:
            for n in nodes(item):
                if n.tag == 'h2':
                    n.tag = 'h3'
    main.children = [
        Node('section', {'class': 'note-core note-section'}, [
            Node('h2', children=['01 · 정의와 핵심']), *core]),
        Node('section', {'class': 'note-example note-section'}, [
            Node('h2', children=['02 · 예시와 실험']), *examples]),
        Node('section', {'class': 'note-recap note-section'}, [
            Node('h2', children=['03 · 기억할 점']), *recap, *extra]),
        *assets,
    ]
    main.attrs['data-note-layout'] = '1'


def main():
    catalog = json.loads((DOCS / 'assets/note-catalog.json').read_text())
    trees, titles = {}, {'home': '행렬과 벡터'}
    for path in DOCS.glob('concept-*.html'):
        parser = Parser()
        parser.feed(path.read_text())
        tree = parser.root
        slug = path.stem.removeprefix('concept-')
        trees[slug] = tree
        titles[slug] = text(next(n for n in nodes(tree) if n.tag == 'h1'))
    for slug, info in catalog['notes'].items():
        tree = trees[slug]
        reset(tree)
        page = next(n for n in nodes(tree) if n.tag == 'main')
        normalize(page, slug)
        # Refresh generated blocks without disturbing authored content or scripts.
        for n in list(nodes(page)):
            n.children = [c for c in n.children if not (
                isinstance(c, Node) and 'data-note-generated' in c.attrs)]
        core = next(n for n in page.children if has(n, 'note-core'))
        example = next(n for n in page.children if has(n, 'note-example'))
        recap = next(n for n in page.children if has(n, 'note-recap'))
        # Data embedding tools may replace a lab with its source template.
        # Keep their headings below the common chapter heading on every run.
        for child in example.children:
            if isinstance(child, Node) and child.tag != 'h2':
                for n in nodes(child):
                    if n.tag == 'h2':
                        n.tag = 'h3'
        map_slug = info['map']
        nav = link(map_slug, '← ' + titles[map_slug]) + link('learning-maps', '전체 학습 지도')
        header = f'<p class="eyebrow">{html.escape(info["kind"])} · 한 페이지, 한 질문</p><h1>{html.escape(titles[slug])}</h1><p class="lead">{html.escape(info["question"])}</p>'
        prerequisites = info['prerequisites']
        header += '<p class="note-prerequisites">먼저 알면 좋아요 · ' + (
            ' · '.join(link(s, titles[s]) for s in prerequisites) if prerequisites else '이 노트부터 시작해도 됩니다.') + '</p>'
        page.children[:0] = [
            generated('top-nav', 'nav', nav, 'docnav'),
            generated('header', 'header', header, 'note-header'),
        ]
        example.children.insert(1, generated(
            'guide', 'p', '<strong>이렇게 살펴보세요</strong>' + html.escape(info['guide']), 'note-guide'))
        check = info['check']
        recap.children.insert(1, generated(
            'check', 'details',
            '<summary>스스로 확인하기 · ' + html.escape(check['question']) + '</summary><p>' + html.escape(check['answer']) + '</p>', 'note-check'))
        cards = '<h2>04 · 연결해서 읽기</h2><ul class="cards note-relation-cards">'
        chosen = set()
        for relation in info['related']:
            target = relation['slug']
            chosen.add(target)
            label = '<small>' + html.escape(relation['relation']) + '</small><strong>' + html.escape(titles[target]) + '</strong><span>' + html.escape(relation['reason']) + '</span>'
            href = 'concepts.html' if target == 'home' else f'concept-{target}.html'
            cards += f'<li><a href="{href}">{label}</a></li>'
        cards += '</ul>'
        cards += (f'<a class="note-graph-link" data-rg-focus="{slug}" '
                  f'href="concept-relations.html?graph-view=note&amp;graph-note={slug}">'
                  '이 노트의 관계도 보기 →</a>')
        others = [s for s in info['other_links'] if s not in chosen and s not in prerequisites and s not in {slug, map_slug, 'learning-maps'}]
        if others:
            cards += '<details class="note-other-links"><summary>다른 연결 보기</summary><ul>' + ''.join(
                '<li>' + link(s, titles[s]) + '</li>' for s in others) + '</ul></details>'
        # Keep the template chapters before executable assets.
        at = page.children.index(recap) + 1
        page.children.insert(at, generated('related', 'section', cards, 'note-related note-section'))
        bottom = link(info['previous'], '← ' + titles[info['previous']]) + link(info['next'], titles[info['next']] + ' →')
        page.children.insert(at + 1, generated('bottom-nav', 'nav', bottom, 'docnav bottom'))
        (DOCS / f'concept-{slug}.html').write_text(tree.render())
    print(f'Applied one short-note structure to {len(catalog["notes"])} notes')


if __name__ == '__main__':
    main()
