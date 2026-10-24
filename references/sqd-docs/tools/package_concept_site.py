"""Package the hub, the concept readers and the main documents for static HTTPS hosting.

Build first (CLAUDE.md order, ending with tools/build_hub.py), then run:
  python3 tools/package_concept_site.py --output /tmp/note-concept-site
The output holds index.html (the hub), the four readers, index-main.html and the
main documents. Repository files, data and reference notebooks are not included.
Two dependency rules apply: the readers and the hub load nothing from outside the
file, and the main documents may load only the Google Fonts stylesheet and its two
preconnect origins and, in three documents, the pinned three.js file from cdnjs with
its integrity hash. URLs are matched exactly, not by host. Every relative link must
point to a packaged file, and every link into a reader must name one of its pages.
"""
import argparse
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

from build_hub import MAIN_DOCS, MAIN_INDEX, READERS

DOCS = Path(__file__).resolve().parents[1] / 'docs'
READER_PAGES = {'learning-maps', 'home', 'quantum-chemistry', 'quantum-computing', 'vqe', 'hamiltonian', 'relations'}
# The only outside resources a packaged page may load, matched exactly (not by host):
FONT_CSS = 'https://fonts.googleapis.com/css2?'  # the stylesheet, any family query
FONT_ORIGINS = {'https://fonts.googleapis.com', 'https://fonts.gstatic.com'}  # rel=preconnect only
THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js'
THREE_SRI = 'sha512-vnmn/Qqn6aG0POAc9mIGzjq0IybrvxJXYDafNvp9JSnDGxeF3pbkSqLvf+YGd5ku63pT7sa/jxHn7/d0mU8+tA=='
THREE_DOCS = {'intro.html', 'prep-math.html', 'math.html'}
# The packaged readers gain one link back to the hub, placed after the relations link.
# It is added here, not in build_concepts.py, because the repository readers are also
# shared as single files and on claude.ai, where no hub sits next to them.
RELATIONS_LINK = re.compile(r'<a\b[^>]*\bid="reader-relations-open"[^>]*>.*?</a>', re.S)
HUB_LINK = '<a href="index.html" class="reader-hub-link">학습 허브</a>'
# Same metrics as the relations link next to it (note-relations.css #reader-relations-open).
HUB_LINK_STYLE = ('<style>.reader-hub-link{padding:8px 10px;font-size:.85rem}'
                  '@media(max-width:600px){.reader-hub-link{padding:8px 6px;font-size:.8rem}}</style>')
CSS_URL = re.compile(r'url\(\s*([\'"]?)(.*?)\1\s*\)|@import\s+([\'"])(.*?)\3', re.S)
LOADERS = {'script': ('src',), 'img': ('src', 'srcset'), 'iframe': ('src',), 'source': ('src', 'srcset'),
           'audio': ('src',), 'video': ('src', 'poster'), 'embed': ('src',), 'object': ('data',),
           'input': ('src',), 'track': ('src',), 'link': ('href',)}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pages, self.ids, self.links, self.dependencies = set(), set(), [], []
        self.in_style = False

    def css(self, text, tag='style'):
        for match in CSS_URL.finditer(text):
            self.dependencies.append((tag, (match.group(2) or match.group(4) or '').strip(), {}))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'data-page' in attrs:
            self.pages.add(attrs['data-page'])
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        for attr in LOADERS.get(tag, ()):
            value = attrs.get(attr)
            if not value:
                continue
            urls = [part.strip().split()[0] for part in value.split(',') if part.strip()] if attr == 'srcset' else [value]
            self.dependencies += [(tag, url, attrs) for url in urls]
        if attrs.get('style'):
            self.css(attrs['style'])
        self.in_style = self.in_style or tag == 'style'

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.css(data)


def parse(body):
    page = Page()
    page.feed(body)
    return page


def allowed(name, tag, url, attrs):
    """Whether a main document may load url. Readers and the hub may load nothing."""
    if name in READERS or name == 'index.html':
        return False
    rel = set((attrs.get('rel') or '').lower().split())
    if tag == 'link' and 'preconnect' in rel:
        return url in FONT_ORIGINS
    if tag == 'link' and 'stylesheet' in rel:
        return url.startswith(FONT_CSS)
    if tag == 'script':
        return name in THREE_DOCS and url == THREE_URL and attrs.get('integrity') == THREE_SRI
    return False


def dependency_errors(name, deps):
    """Problems with what a page loads. deps: (tag, url, attrs) from Page."""
    errors = []
    for tag, url, attrs in deps:
        if url.startswith(('data:', '#')):  # inline data and same-document references load nothing
            continue
        parts = urlsplit(url)
        if '\\' in url or '@' in parts.netloc or parts.scheme != 'https' or not allowed(name, tag, url, attrs):
            errors.append(f'{name} loads {url}')
    return errors


def link_errors(name, links, files, pages, ids):
    """Problems with where a page links. files: packaged name -> parsed page."""
    errors = []
    for href in links:
        parts = urlsplit(href)
        if parts.scheme in {'http', 'https', 'mailto'}:
            continue
        if not parts.path:  # same-page fragment
            if name in READERS and href != '#reader-content' and parts.fragment not in pages:
                errors.append(f'{name} links to missing page {href}')
            elif name not in READERS and parts.fragment and parts.fragment not in ids:
                errors.append(f'{name} links to missing anchor {href}')
            continue
        if name in READERS and href != 'index.html':
            errors.append(f'{name} links outside the reader: {href}')
            continue
        target = files.get(parts.path)
        if target is None:
            errors.append(f'{name} links to {href}, which is not packaged')
        elif parts.path in READERS and parts.fragment and parts.fragment not in target.pages:
            errors.append(f'{name} links to {href}, but the reader has no page {parts.fragment}')
    return errors


def collect():
    names = sorted(READERS) + ['index.html', MAIN_INDEX] + [f'{stem}.html' for stem, _ in MAIN_DOCS]
    bodies = {}
    for name in names:
        source = DOCS / name
        if not source.exists():
            raise SystemExit(f'Missing {source}; run the build (CLAUDE.md order) first.')
        bodies[name] = source.read_text()
    for name in READERS:
        found = RELATIONS_LINK.findall(bodies[name])
        if len(found) != 1:
            raise SystemExit(f'{name}: expected one #reader-relations-open link in the reader bar, found {len(found)}.')
        bodies[name] = RELATIONS_LINK.sub(lambda m: m.group(0) + HUB_LINK, bodies[name], count=1)
        if bodies[name].count('</head>') != 1:
            raise SystemExit(f'{name}: expected one </head>.')
        bodies[name] = bodies[name].replace('</head>', HUB_LINK_STYLE + '</head>', 1)
    return bodies


def validate(bodies):
    parsed = {name: parse(body) for name, body in bodies.items()}
    errors = []
    for name in READERS:
        if not READER_PAGES <= parsed[name].pages:
            errors.append(f'{name} is not a complete concept reader.')
    for name, page in parsed.items():
        errors += dependency_errors(name, page.dependencies)
        errors += link_errors(name, page.links, parsed, page.pages, page.ids)
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--output', required=True, type=Path)
    output = parser.parse_args().output.resolve()
    if output == DOCS.resolve():
        parser.error('Output must be separate from the source documents.')
    if output.exists() and any(output.iterdir()):
        parser.error('Use a new or empty output directory; existing files are preserved.')
    bodies = collect()
    errors = validate(bodies)
    if errors:
        parser.error('Packaging check failed:\n  ' + '\n  '.join(errors))
    bodies['.nojekyll'] = ''
    output.mkdir(parents=True, exist_ok=True)
    for name, body in bodies.items():
        (output / name).write_text(body)
    print(f'Packaged {len(bodies)} files in {output}')
    print('index.html is the hub; the readers link back to it, and old /#page links forward to the reader.')


if __name__ == '__main__':
    main()
