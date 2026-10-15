"""Independent, stdlib checks; optional fresh PySCF reconstruction."""
import argparse
import importlib.util
import json
import math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def check(data):
    bo=json.loads((ROOT/'data/bo_h2.json').read_text())['samples']
    for s in data['samples']:
        h=s['hamiltonian_full_hartree']; b=s['hamiltonian_even_hartree']; p=s['pauli_hartree']
        assert all(abs(h[i][j]-h[j][i])<1e-12 for i in range(4) for j in range(4))
        assert all(abs(h[i][j])<1e-10 for i in [0,3] for j in [1,2])
        assert b==[[h[0][0],h[0][3]],[h[3][0],h[3][3]]]
        assert abs(p['I']+p['Z']-b[0][0])<1e-12 and abs(p['I']-p['Z']-b[1][1])<1e-12 and abs(p['X']-b[0][1])<1e-12
        exact=p['I']-math.hypot(p['X'],p['Z'])
        other=(h[1][1]+h[2][2])/2-math.hypot((h[1][1]-h[2][2])/2,h[1][2])
        assert exact<=other+1e-12
        assert abs(exact-s['energy_fci_hartree'])<1e-11
        assert abs(b[0][0]-s['energy_hf_hartree'])<1e-10
        assert abs(exact-next(x['energy_total_hartree'] for x in bo if x['r_angstrom']==s['r_angstrom']))<1e-10
        theta=s['optimal_theta_radians']; v=[math.cos(theta/2),math.sin(theta/2)]
        assert abs(sum(x*x for x in v)-1)<1e-12
        assert all(abs(sum(b[i][j]*v[j] for j in range(2))-exact*v[i])<1e-11 for i in range(2))
        for i in range(361):
            angle=(i-180)*math.pi/180
            e=p['I']+p['X']*math.sin(angle)+p['Z']*math.cos(angle)
            assert e>=exact-1e-12
    print('PASS: 4 H2 matrices, both symmetry blocks, Pauli decomposition, HF/FCI/BO agreement, 1444 variational states')
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--recompute',action='store_true');args=parser.parse_args()
    data=json.loads((ROOT/'data/vqe_h2.json').read_text()); check(data)
    if args.recompute:
        spec=importlib.util.spec_from_file_location('vqe_h2',ROOT/'scripts/vqe_h2.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        fresh=mod.calculate(); check(fresh)
        for a,b in zip(data['samples'],fresh['samples']):
            assert max(abs(x-y) for row1,row2 in zip(a['hamiltonian_full_hartree'],b['hamiltonian_full_hartree']) for x,y in zip(row1,row2))<1e-10
        print('PASS: fresh PySCF reconstruction')
