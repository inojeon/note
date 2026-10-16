"""Build self-contained math and quantum chemistry readers.

Edit concept-*.html, assets/concepts.css, and tools/concepts-home.html,
then rebuild. Refresh docs/assets/concept-glossary.json through tools/enrich_concepts.py before rebuilding. The generated reader needs no server or sibling files.
"""
from pathlib import Path
import re
import base64

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
inputs = [('home', ROOT / 'tools/concepts-home.html')]
inputs += [(p.stem.removeprefix('concept-'), p) for p in sorted(DOCS.glob('concept-*.html'))]
routes = {p.name: slug for slug, p in inputs}
routes['learning-maps.html'] = 'learning-maps'
routes['concepts.html'] = 'home'
routes['quantum-chemistry.html'] = 'quantum-chemistry'
sections, scripts = [], []
for slug, path in inputs:
    source = path.read_text()
    body = re.search(r'<main\b[^>]*>([\s\S]*?)</main>', source).group(1)
    for script in re.findall(r'<script>([\s\S]*?)</script>', body):
        if script not in scripts:
            scripts.append(script)
    body = re.sub(r'<script>[\s\S]*?</script>', '', body)
    def replace_link(match):
        attrs, target, tail, label = match.groups()
        filename = target.split('#', 1)[0]
        if filename in routes:
            return f'<a{attrs}href="#{routes[filename]}"{tail}>{label}</a>'
        # The compact reader contains only the concept collection. Never send
        # a file-preview user to a sibling HTML document that cannot be opened.
        return ''
    body = re.sub(r'<a([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)</a>', replace_link, body)
    body = re.sub(r'<p>실제 문제로 이어가기:[\s\S]*?</p>', '', body)
    title = re.search(r'<h1>([\s\S]*?)</h1>', body).group(1)
    sections.append((slug, title, body))
vendor = DOCS / 'assets/vendor/katex'
def embed_font(match):
    data = (vendor / match.group(1)).read_bytes()
    return 'url(data:font/woff2;base64,' + base64.b64encode(data).decode() + ')'
katex_css = re.sub(r'url\((fonts/[^)]+)\)', embed_font, (vendor/'katex.min.css').read_text())
css = katex_css + '\n' + (DOCS / 'assets/concepts.css').read_text()
# The vendor script is separate from authored lab scripts so the lightweight
# mock-DOM checker only executes our code. Real browser tests cover KaTeX.
katex_license = '<!-- KaTeX 0.19.0\n' + (vendor/'LICENSE').read_text() + '-->'
katex_script = katex_license + '<script data-vendor="katex-0.19.0">' + (vendor/'katex.min.js').read_text().replace('</script', '<\\/script') + '</script>'
mol_vendor = DOCS/'assets/vendor/3dmol'
mol_license = '<!-- 3Dmol.js 2.5.5\n' + (mol_vendor/'LICENSE').read_text() + '\n' + (mol_vendor/'3Dmol-min.js.LICENSE.txt').read_text() + '-->'
mol_script = mol_license + '<script data-vendor="3dmol-2.5.5">' + (mol_vendor/'3Dmol-min.js').read_text().replace('</script', '<\\/script') + '</script>'
math_runtime = (DOCS/'assets/concept-math.js').read_text()
css += '\n[hidden]{display:none!important}h1:focus{outline:none}\n'
router = '''
(function(){
const pages=Array.from(document.querySelectorAll('[data-page]'));
if(!pages.length)return;
function showPage(){
 const requested=location.hash.slice(1)||DEFAULT_PAGE;
 const slug=requested==='sqd-linear-algebra'?'hamiltonian':requested;
 const current=pages.find(p=>p.dataset.page===slug)||pages.find(p=>p.dataset.page===DEFAULT_PAGE);
 pages.forEach(p=>{p.hidden=p!==current});
 const heading=current.querySelector('h1');
 document.title=heading.textContent+' · 개념 노트';
 heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});
 window.scrollTo(0,0);
}
document.querySelector('.skip').addEventListener('click',event=>{
 event.preventDefault();document.getElementById('reader-content').focus();
});
window.addEventListener('hashchange',showPage);showPage();
})();
'''
for filename, default_page, title in [
    ('learning-maps.html', 'learning-maps', '학습 지도 모음 · 개념 노트'),
    ('concepts.html', 'home', '행렬과 벡터 · 개념 지도'),
    ('quantum-chemistry.html', 'quantum-chemistry', '양자화학 · 개념 지도'),
]:
    views = ''.join(f'<section id="page-{slug}" data-page="{slug}" aria-label="{heading}"'+('' if slug==default_page else ' hidden')+'>'+body+'</section>' for slug, heading, body in sections)
    page_router = router.replace('DEFAULT_PAGE', repr(default_page))
    html = '<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>'+css+'</style></head><body><a class="skip" href="#reader-content">본문으로 건너뛰기</a><nav class="reader-home-nav" aria-label="전체 학습 지도"><a href="#learning-maps">← 전체 학습 지도</a></nav><main id="reader-content" tabindex="-1">'+views+'</main>'+katex_script+mol_script+'<script>'+  '\n'.join(scripts) + '\n'+page_router+'\n'+math_runtime+'</script></body></html>\n'
    (DOCS/filename).write_text(html)
    print(f'Built {filename}: {len(inputs)} views, embedded CSS and scripts')
