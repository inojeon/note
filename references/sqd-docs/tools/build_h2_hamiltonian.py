"""Embed the existing reproducible H2/STO-3G calculations in the explanatory note."""
import json
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
path = root / 'docs/concept-h2-hamiltonian.html'
data = json.loads((root / 'data/vqe_h2.json').read_text())
block = '<!-- H2_HAMILTONIAN_DATA_START -->\n<script type="application/json" id="h2h-data">' + json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', r'\u003c') + '</script>\n<!-- H2_HAMILTONIAN_DATA_END -->'
source, count = re.subn(r'<!-- H2_HAMILTONIAN_DATA_START -->.*?<!-- H2_HAMILTONIAN_DATA_END -->', lambda _: block, path.read_text(), flags=re.S)
assert count == 1
path.write_text(source)
print('Embedded verified H2 Hamiltonian data')

comparison=json.loads((root / "data/hamiltonian_comparison.json").read_text())
block="<!-- HCMP_DATA_START -->\n<script type=\"application/json\" id=\"hcmp-data\">"+json.dumps(comparison,ensure_ascii=False,separators=(",",":")).replace("<",r"\u003c")+"</script>\n<!-- HCMP_DATA_END -->"
source,count=re.subn(r"<!-- HCMP_DATA_START -->.*?<!-- HCMP_DATA_END -->",lambda _:block,path.read_text(),flags=re.S)
assert count==1
path.write_text(source)
