"""Embed computed data without requiring PySCF for HTML builds."""
import json
import re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
path=root/'docs/concept-vqe-hydrogen.html'
data=json.loads((root/'data/vqe_h2.json').read_text())
block='<!-- VQE_H2_DATA_START -->\n<script type="application/json" id="vh-data">'+json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+'</script>\n<!-- VQE_H2_DATA_END -->'
source=path.read_text(); source,count=re.subn(r'<!-- VQE_H2_DATA_START -->.*?<!-- VQE_H2_DATA_END -->',lambda _:block,source,flags=re.S)
assert count==1
path.write_text(source)
print('Embedded H2 VQE data')
