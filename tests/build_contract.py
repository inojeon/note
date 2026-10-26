"""Negative build tests in a disposable copy; Python is needed only for developer QA."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
hugo = os.environ.get('HUGO') or str(root / '.tools/hugo')
if not Path(hugo).is_file():
    hugo = shutil.which(hugo) or shutil.which('hugo')
if not hugo:
    raise SystemExit('Hugo is missing. Run sh tools/install-hugo.sh first.')

with tempfile.TemporaryDirectory(prefix='learning-note-contract-') as temporary:
    source = Path(temporary)
    for directory in ['content', 'site']:
        shutil.copytree(root / directory, source / directory)
    shutil.copy2(root / 'hugo.toml', source / 'hugo.toml')

    for name in ['contract-owner', 'contract-reader']:
        bundle = source / 'content/notes' / name
        bundle.mkdir()
        (bundle / 'index.md').write_text(f'---\ntitle: "{name}"\nsummary: "Fixture"\nparams:\n  topics: [linear-algebra]\n---\n\n## Fixture\n')
    owner = source / 'content/notes/contract-owner'
    (owner / 'figure.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>')
    (owner / 'preview.md').write_text('![Preview figure](figure.svg)\n')
    reader = source / 'content/notes/contract-reader/index.md'
    reader.write_text(reader.read_text() + '\n[Preview](../contract-owner/)\n')

    def build():
        return subprocess.run([hugo, '--source', str(source), '--cacheDir', str(source / 'cache'), '--destination', str(source / 'output'), '--baseURL', 'https://example.org/note/', '--minify'], capture_output=True, text=True)

    baseline = build()
    assert baseline.returncode == 0, baseline.stdout + baseline.stderr
    html = (source / 'output/notes/contract-reader/index.html').read_text()
    assert '/note/notes/contract-owner/figure.svg' in html, 'preview asset must resolve relative to its owning note'
    assert (source / 'output/notes/contract-owner/figure.svg').is_file()
    print('PASS: preview image resolves against the original bundle under /note/')
    cases = [
        ('missing concept link', 'content/notes/vector/index.md', '\n[Missing](../missing-note/)\n', '내부 링크/자산'),
        ('missing section link', 'content/notes/vector/index.md', '\n[Missing](../basis/#missing-section)\n', '섹션'),
        ('missing experiment', 'content/notes/vector/index.md', '\n{{< experiment id="missing-lab" >}}\n', '없는 실험 ID'),
        ('invalid math', 'content/notes/vector/index.md', '\n$$\n\\unknownKaTeXCommand{1}\n$$\n', '수식'),
        ('body h1', 'content/notes/vector/index.md', '\n# Wrong title\n', '##'),
        ('javascript syntax', 'content/experiments/vector-direction/main.js', '\nexport const broken = );\n', 'JSBUILD'),
        ('missing import', 'content/experiments/vector-direction/main.js', '\nimport "./missing-module.js";\n', 'JSBUILD'),
        ('inline script', 'content/experiments/vector-direction/view.html', '\n<script>alert(1)</script>\n', '화면 조각'),
        ('inline event', 'content/experiments/vector-direction/view.html', '\n<button onclick="alert(1)">bad</button>\n', '화면 조각'),
        ('invalid static experiment math', 'content/experiments/vector-direction/view.html', '\n<span class="math-tex" data-tex="\\unknownKaTeXCommand{1}">bad</span>\n', '수식'),
    ]
    for name, relative, extra, expected in cases:
        path = source / relative
        original = path.read_text()
        path.write_text(original + extra)
        result = build()
        path.write_text(original)
        output = result.stdout + result.stderr
        assert result.returncode != 0 and expected in output, f'{name}: expected build error {expected}\n{output}'
        print(f'PASS: {name}')

    note = source / 'content/notes/contract-check'
    note.mkdir()
    (note / 'index.md').write_text('---\ntitle: "Incomplete"\n---\n\n## Body\nMissing summary and topics.\n')
    result = build()
    assert result.returncode != 0 and 'params.topics' in result.stdout + result.stderr
    print('PASS: required metadata')

print('PASS: isolated negative build contracts; source files were not changed')
