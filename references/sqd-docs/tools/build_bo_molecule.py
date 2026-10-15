"""Embed the H2 molecular lab and precomputed data into the BO source page.

Run before enrich_concepts.py and build_concepts.py. Only regenerating the
scientific data (scripts/bo_h2.py) needs PySCF; normal HTML builds use stdlib.
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'docs/concept-born-oppenheimer.html'
START = '<!-- BO_H2_LAB_START -->'
END = '<!-- BO_H2_LAB_END -->'


def main():
    fragment = (ROOT / 'tools/bo-molecule-lab.html').read_text()
    runtime = (ROOT / 'docs/assets/bo-molecule.js').read_text()
    data = json.loads((ROOT / 'data/bo_h2.json').read_text())
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    block = (START + '\n' + fragment + '\n<script type="application/json" id="boh2-data">'
             + payload + '</script>\n<script>' + runtime + '</script>\n' + END)
    source = PAGE.read_text()
    if START in source:
        before, rest = source.split(START, 1)
        _, after = rest.split(END, 1)
        source = before + block + after
    else:
        old_start = source.index('<section class="qc-lab">')
        old_end = source.index('<details><summary>적용 조건', old_start)
        advanced = ('<details id="bo-advanced-model"><summary>더 알아보기 · 전자 상태가 가까워질 때의 두 상태 모형</summary>'
                    + source[old_start:old_end] + '</details>')
        source = source[:old_start] + block + '\n' + advanced + source[old_end:]
    dependency = '<script defer src="assets/vendor/3dmol/3Dmol-min.js"></script>'
    if dependency not in source:
        source = source.replace('</head>', dependency + '</head>', 1)
    PAGE.write_text(source)
    print('Embedded the H2 molecular lab, calculation data and runtime in the BO source')


if __name__ == '__main__':
    main()
