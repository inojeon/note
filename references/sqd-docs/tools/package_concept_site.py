"""Package the standalone concept readers for static HTTPS hosting.

Build the readers first with tools/build_concepts.py, then run:
  python3 tools/package_concept_site.py --output /tmp/note-concept-site
Only the concept readers are included, not the repository or reference files.
"""
import argparse
from html.parser import HTMLParser
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / 'docs'


class Reader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.pages = set()
        self.links = []
        self.dependencies = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'data-page' in attrs:
            self.pages.add(attrs['data-page'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in {'script', 'img', 'iframe'} and 'src' in attrs:
            self.dependencies.append(attrs['src'])
        if tag == 'link' and 'href' in attrs:
            self.dependencies.append(attrs['href'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, type=Path)
    output = parser.parse_args().output.resolve()
    files = {}
    for filename in ['quantum-chemistry.html', 'concepts.html']:
        source = DOCS / filename
        if not source.exists():
            parser.error(f'Missing {source}; run tools/build_concepts.py first.')
        body = source.read_text()
        reader = Reader()
        reader.feed(body)
        if not {'home', 'quantum-chemistry', 'hamiltonian'} <= reader.pages:
            parser.error(f'{filename} is not a complete concept reader.')
        broken = [href for href in reader.links if href != '#reader-content'
                  and (not href.startswith('#') or href[1:] not in reader.pages)]
        if broken or reader.dependencies:
            parser.error(f'{filename} has unresolved links or dependencies: '
                         f'{broken + reader.dependencies}')
        files[filename] = body
    files['index.html'] = files['quantum-chemistry.html']
    files['.nojekyll'] = ''
    if output.exists() and any(output.iterdir()):
        parser.error('Use a new or empty output directory; existing files are preserved.')
    if output == DOCS.resolve():
        parser.error('Output must be separate from the source documents.')
    output.mkdir(parents=True, exist_ok=True)
    for filename, body in files.items():
        (output / filename).write_text(body)
    print(f'Packaged {len(files)} files in {output}')
    print('index.html opens the quantum chemistry map; concepts.html opens the math map.')


if __name__ == '__main__':
    main()
