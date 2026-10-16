"""Count contracted spatial AO functions for H2 using PySCF's basis library.
Run from the project root with .venv/bin/python scripts/basis_set_counts.py.
No SCF/energy calculation is performed; geometry does not affect these counts.
"""
import json
from pathlib import Path
import pyscf
from pyscf import gto
root = Path(__file__).resolve().parents[1]
names = ['sto-3g', '6-31g', '6-31g(d,p)', '6-31++g(d,p)', 'cc-pvdz']
rows = []
for name in names:
    mol = gto.M(atom='H 0 0 0; H 0 0 0.74', basis=name, unit='Angstrom', verbose=0)
    count = int(mol.nao_nr())
    assert count % 2 == 0
    rows.append({'basis': name, 'hydrogen_spatial_functions': count // 2,
                 'h2_spatial_functions': count, 'h2_spin_orbitals': 2 * count})
sto = gto.basis.load('sto-3g', 'H')
assert len(sto) == 1 and sto[0][0] == 0 and len(sto[0][1:]) == 3
result = {'pyscf_version': pyscf.__version__, 'convention': 'contracted spatial AO functions; spherical harmonics',
          'hydrogen_sto3g_primitives': len(sto[0][1:]), 'rows': rows}
(root / 'data/basis_set_counts.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
