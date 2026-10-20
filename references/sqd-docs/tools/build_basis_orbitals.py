"""Embed the computed orbital-level lab without requiring PySCF at build time."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'docs/concept-basis-orbital-energies.html'
s=p.read_text()
start='<!-- STO_ORBITAL_LAB_START -->'
end='<!-- STO_ORBITAL_LAB_END -->'
data=json.loads((root/'data/basis_orbital_levels.json').read_text())
lab=(root/'tools/basis-orbital-lab.html').read_text().replace('STO_ORBITAL_DATA',json.dumps(data,separators=(',',':')).replace('<',r'\u003c'))
block=start+'\n'+lab+'\n'+end
if start in s:
    a=s.index(start);b=s.index(end,a)+len(end);s=s[:a]+block+s[b:]
else:
    anchor='<details><summary>이름 읽기'
    assert anchor in s
    s=s.replace(anchor,block+'\n'+anchor,1)
p.write_text(s)
print('Embedded RHF orbital energy comparison')
