"""Build the hub page docs/index.html: every main document and concept note in reading order.

The hub keeps no data of its own. It reads
- docs/assets/note-catalog.json: the notes, their map and order, kind and core question
- docs/assets/relation-map.json: map names, captions, summaries and colors (as the relations page)
- each page's <h1>: note titles, and the title<br>subtitle of the main documents
- MAIN_DOCS below: the reading order of the main documents (CLAUDE.md "문서 지도")
Run after tools/build_concepts.py:
  python3 tools/build_hub.py              # write docs/index.html
  python3 tools/build_hub.py --check      # exit 1 when docs/index.html is stale
  python3 tools/build_hub.py --output FILE
"""
import argparse
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
HUB = DOCS / 'index.html'
READER = 'learning-maps.html'
MAIN_INDEX = 'index-main.html'
READERS = {'learning-maps.html', 'concepts.html', 'quantum-chemistry.html', 'relations.html'}
# (file stem, label in the station column). Reading order of CLAUDE.md "문서 지도".
# A new main document is added here and in index-main.html; the build fails until it is.
MAIN_DOCS = [('background-atoms', '배경'), ('intro', '입문'), ('prep-math', '준비'), ('math', '수학'),
             ('00-quickstart', '0'), ('01-pyscf', '1'), ('02-jordan-wigner', '2'), ('03-ucj-inside', '3'),
             ('04-circuit', '4'), ('05-sampling', '5'), ('06-sqd-guide', '6')]
MAIN_LINE = {'id': 'main-docs', 'title': '본문 문서', 'caption': '배경·입문에서 SQD 코드 해설까지',
             'summary': '개념 노트보다 긴 글입니다. 수식 없는 입문부터 공식 예제의 코드 해설까지 이어집니다.',
             'color': 'ink2', 'href': MAIN_INDEX, 'link': '본문 모음 열기'}
STORY = 'intro'  # the story-first start offered next to the first concept note
ID = re.compile(r'^[a-z0-9-]+$')


def text(fragment):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', '', fragment)).split())


def esc(value):
    return html.escape(value, quote=True)


def h1(path):
    match = re.search(r'<h1[^>]*>(.*?)</h1>', path.read_text(), re.S)
    if not match:
        raise SystemExit(f'build_hub: {path.name} has no <h1>')
    return match[1]


def check_documents():
    listed = {f'{stem}.html' for stem, _ in MAIN_DOCS}
    known = listed | READERS | {MAIN_INDEX, HUB.name}
    found = {p.name for p in DOCS.glob('*.html') if not p.name.startswith('concept-')}
    missing = sorted((listed | {MAIN_INDEX}) - found)
    unlisted = sorted(found - known)
    if missing or unlisted:
        raise SystemExit('build_hub: main documents out of sync with MAIN_DOCS in tools/build_hub.py'
                         f' (missing: {missing or "none"}, not listed: {unlisted or "none"})')


def lines():
    catalog = json.loads((DOCS / 'assets/note-catalog.json').read_text())
    config = json.loads((DOCS / 'assets/relation-map.json').read_text())
    groups = {g['id']: g for g in config['groups']}
    if list(groups) != list(catalog['maps']):
        raise SystemExit('build_hub: relation-map.json groups must list the catalog maps in the same order')
    # Ids and color names go into attributes unescaped, so they must stay plain tokens.
    bad = [v for g in config['groups'] for v in (g['id'], g['color']) if not ID.match(v)]
    if bad:
        raise SystemExit(f'build_hub: map ids and colors must match {ID.pattern}: {bad}')
    tokens = set(re.findall(r'--([a-z0-9-]+):', (DOCS / 'assets/concepts.css').read_text()))
    missing = sorted({g['color'] for g in config['groups']} - tokens)
    if missing:
        raise SystemExit(f'build_hub: relation-map.json colors without a concepts.css token: {missing}')
    result = []
    for number, (map_id, slugs) in enumerate(catalog['maps'].items(), 1):
        group = groups[map_id]
        items = []
        for position, slug in enumerate(slugs, 1):
            info = catalog['notes'][slug]
            if not ID.match(slug) or info['map'] != map_id:
                raise SystemExit(f'build_hub: note {slug!r} has a bad id or belongs to another map')
            title = text(h1(DOCS / f'concept-{slug}.html'))
            if not title:
                raise SystemExit(f'build_hub: concept-{slug}.html has an empty <h1>')
            items.append({'id': slug, 'num': f'{position:02d}', 'title': title,
                          'question': info['question'], 'kind': info['kind'], 'href': f'{READER}#{slug}'})
        result.append({'id': map_id, 'num': f'{number:02d}', 'title': group['title'], 'caption': group['caption'],
                       'summary': group['summary'], 'color': group['color'], 'href': f'{READER}#{map_id}',
                       'link': '지도 열기', 'items': items})
    items = []
    for stem, label in MAIN_DOCS:
        # Main documents write their <h1> as "title<br><span>subtitle</span>".
        parts = re.split(r'<br\s*/?>', h1(DOCS / f'{stem}.html'), maxsplit=1, flags=re.I)
        title, subtitle = text(parts[0]), text(parts[1]) if len(parts) > 1 else ''
        if not title or not subtitle:
            raise SystemExit(f'build_hub: {stem}.html needs an <h1> of the form title<br>subtitle')
        items.append({'id': stem, 'num': label, 'title': title, 'question': subtitle,
                      'kind': '본문', 'href': f'{stem}.html'})
    result.append(dict(MAIN_LINE, num='', items=items))
    ids = [item['id'] for line in result for item in line['items']]
    duplicates = sorted({i for i in ids if ids.count(i) > 1})
    if duplicates:
        raise SystemExit(f'build_hub: duplicate page ids {duplicates}')
    return result


# Old reader addresses the router still accepts besides its pages (build_concepts.py router).
READER_ALIASES = {'sqd-linear-algebra'}


def reader_slugs():
    """Pages of the built reader; old /#slug links to any of them are forwarded."""
    pages = set(re.findall(r'data-page="([a-z0-9-]+)"', (DOCS / READER).read_text()))
    if not pages:
        raise SystemExit(f'build_hub: {READER} has no pages; run tools/build_concepts.py first')
    return sorted(pages | READER_ALIASES)


def station(line, item):
    kind = f'<span class="hub-kind">{esc(item["kind"])}</span>' if item['kind'] == '응용' else ''
    search = ' '.join([item['title'], item['question'], line['title'], item['kind']])
    marks = ''.join(f'<label><input type="radio" name="m-{item["id"]}" value="{value}"{" checked" if value == "notyet" else ""}>'
                    f'<span><i class="hub-glyph {value}" aria-hidden="true"></i>{label}</span></label>'
                    for value, label in [('notyet', '아직'), ('read', '읽음'), ('understood', '이해')])
    return (f'<li class="hub-station" data-id="{item["id"]}" data-line="{line["id"]}" data-num="{esc(item["num"])}" data-state="notyet" data-search="{esc(search)}">'
            '<span class="hub-dot" aria-hidden="true"></span>'
            f'<span class="hub-num">{esc(item["num"])}</span>'
            f'<div class="hub-text"><a class="hub-title" href="{esc(item["href"])}" data-open="{item["id"]}">{esc(item["title"])}</a>{kind}'
            f'<p class="hub-q">{esc(item["question"])}</p></div>'
            f'<fieldset class="hub-mark"><legend>{esc(item["title"])} 표시</legend>{marks}</fieldset></li>')


def section(line):
    number = f'<span class="hub-line-num">{line["num"]}</span>' if line['num'] else ''
    lid = line['id']
    return (f'<section class="hub-line" data-line="{lid}" data-name="{esc(line["title"])}" style="--route:var(--{line["color"]})" aria-labelledby="line-{lid}">'
            f'<div class="hub-line-head"><h2 id="line-{lid}">{number}{esc(line["title"])}<small>{esc(line["caption"])}</small></h2>'
            f'<p class="hub-line-meta"><span data-line-progress>{len(line["items"])}편</span>'
            f'<button type="button" class="hub-fold" aria-expanded="true" aria-controls="stations-{lid}">접기</button>'
            f'<a href="{esc(line["href"])}">{esc(line["link"])}</a></p></div>'
            f'<p class="hub-line-summary">{esc(line["summary"])}</p>'
            f'<ol class="hub-stations" id="stations-{lid}">' + ''.join(station(line, item) for item in line['items']) + '</ol></section>')


def chip(line):
    return (f'<li><button type="button" data-line-filter="{line["id"]}" aria-pressed="false" style="--route:var(--{line["color"]})">'
            f'{esc(line["title"])} <span data-chip-progress aria-hidden="true">{len(line["items"])}</span>'
            f'<span class="hub-sr" data-chip-sr>{len(line["items"])}편</span></button></li>')


def script(path):
    return path.read_text().replace('</script', '<\\/script')


def render():
    check_documents()
    data = lines()
    notes = sum(len(line['items']) for line in data if line['id'] != MAIN_LINE['id'])
    mains = len(MAIN_DOCS)
    first_line, first = data[0], data[0]['items'][0]
    main_line = data[-1]
    story = next(item for item in main_line['items'] if item['id'] == STORY)
    # Runs before the body is parsed, so the first paint already matches what hub.js shows:
    # marks the page as scripted, picks the route to keep open (the route of the page marked
    # last, else the first), reserves the returning learner's card, and forwards old /#slug
    # links (keeping ?graph-* so a saved relations view still opens). If hub.js never
    # paints, the page shows everything after 3 seconds.
    route_of = {item['id']: line['id'] for line in data for item in line['items']}
    head = ("(function(){var d=document.documentElement;if(!d||!d.classList)return;d.classList.add('hub-js');"
            "var open=" + json.dumps(data[0]['id']) + ",routes=" + json.dumps(route_of, separators=(',', ':')) + ";"
            "try{if(window.SQDProgress.hasMarks()){d.classList.add('hub-returning');var last=SQDProgress.last();"
            "if(Object.prototype.hasOwnProperty.call(routes,last))open=routes[last]}}catch(e){}"
            "d.setAttribute('data-hub-open',open);"
            "setTimeout(function(){d.classList.add('hub-painted')},3000);"
            "try{var h=location.hash.slice(1);if(h&&h.indexOf('=')<0&&" + json.dumps(reader_slugs()) +
            ".indexOf(h)>=0)location.replace('" + READER + "'+location.search+'#'+h)}catch(e){}})();")
    total = notes + mains
    chips = (f'<li><button type="button" data-line-filter="all" aria-pressed="true" style="--route:var(--ink2)">전체 <span data-chip-total>{total}</span></button></li>'
             + ''.join(chip(line) for line in data))
    # Until hub.js paints, only the route chosen by the head script shows its stations.
    prefold = ''.join(f'html[data-hub-open="{line["id"]}"]:not(.hub-painted) .hub-line:not([data-line="{line["id"]}"]) '
                      '.hub-stations{display:none}' for line in data)
    page = (ROOT / 'tools/hub-page.html').read_text()
    replacements = {
        '__DESCRIPTION__': esc(f'SQD 학습 허브. 본문 문서 {mains}편과 개념 노트 {notes}편을 읽는 순서대로 찾고, 읽은 문서를 표시합니다.'),
        '__CSS__': (DOCS / 'assets/concepts.css').read_text() + '\n' + (DOCS / 'assets/hub.css').read_text() + '\n' + prefold,
        '__HEAD__': head,
        '__EYEBROW__': esc(f'본문 문서 {mains}편 · 개념 노트 {notes}편'),
        '__STORY_HREF__': esc(story['href']), '__STORY_ID__': story['id'], '__STORY_TITLE__': esc(story['title']),
        '__STORY_QUESTION__': esc(story['question']),
        '__FIRST_HREF__': esc(first['href']), '__FIRST_ID__': first['id'], '__FIRST_TITLE__': esc(first['title']),
        '__FIRST_WHERE__': esc(f'{first_line["title"]} · {first["num"]}'),
        '__CHIPS__': chips,
        '__LINES__': ''.join(section(line) for line in data),
        '__PROGRESS__': script(DOCS / 'assets/progress.js'),
        '__RUNTIME__': script(DOCS / 'assets/hub.js'),
    }
    for key, value in replacements.items():
        if key not in page:
            raise SystemExit(f'build_hub: placeholder {key} missing from tools/hub-page.html')
        page = page.replace(key, value)
    leftover = sorted(set(re.findall(r'__[A-Z_]+__', page)))
    if leftover:
        raise SystemExit(f'build_hub: unfilled placeholders {leftover}')
    return page, notes, mains


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--check', action='store_true', help='exit 1 when docs/index.html is stale')
    parser.add_argument('--output', type=Path, default=HUB)
    args = parser.parse_args()
    page, notes, mains = render()
    if args.check:
        current = HUB.read_text() if HUB.exists() else ''
        if current != page:
            print('docs/index.html is stale: run python3 tools/build_hub.py', file=sys.stderr)
            sys.exit(1)
        print(f'docs/index.html is current ({mains} main documents, {notes} notes)')
        return
    args.output.write_text(page)
    print(f'Built {args.output.name}: {mains} main documents, {notes} notes, {len(page) // 1024} KB')


if __name__ == '__main__':
    main()
