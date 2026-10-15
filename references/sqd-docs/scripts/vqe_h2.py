"""H2/STO-3G symmetry-reduced variational data; see vqe_h2_README.md."""
import os
for name in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'MKL_NUM_THREADS'):
    os.environ[name] = '1'
import json
from pathlib import Path
import numpy as np
import pyscf
from pyscf import gto, scf, ao2mo, fci, lib
lib.num_threads(1)
ROOT = Path(__file__).resolve().parents[1]

def calculate():
    samples = []
    previous = json.loads((ROOT/'data/bo_h2.json').read_text())['samples']
    for r in [.4, .74, 1.5, 3.]:
        mol = gto.M(atom=[('H', (-r/2,0,0)),('H',(r/2,0,0))], basis='sto-3g', unit='Angstrom', spin=0, verbose=0)
        mf = scf.RHF(mol); mf.conv_tol = 1e-13; mf.kernel()
        assert mf.converged
        h1 = mf.mo_coeff.T @ mf.get_hcore() @ mf.mo_coeff
        eri = ao2mo.kernel(mol, mf.mo_coeff)
        effective = fci.direct_spin1.absorb_h1e(h1, eri, 2, (1,1), .5)
        def act(v): return fci.direct_spin1.contract_2e(effective, v.reshape(2,2), 2, (1,1)).ravel()
        h = np.column_stack([act(v) for v in np.eye(4)]) + np.eye(4)*mol.energy_nuc()
        block = h[np.ix_([0,3],[0,3])]
        ci, cx, cz = np.trace(block)/2, block[0,1], (block[0,0]-block[1,1])/2
        theta = float(np.arctan2(-cx,-cz))
        v = np.array([np.cos(theta/2), np.sin(theta/2)])
        eigen = float(np.linalg.eigvalsh(h)[0]); reduced = float(v @ block @ v)
        solver = fci.direct_spin0.FCI(mol)
        fci_e, _ = solver.kernel(h1, eri, 2, (1,1), ecore=mol.energy_nuc())
        bo = next(s['energy_total_hartree'] for s in previous if s['r_angstrom']==r)
        leakage = float(np.max(np.abs(h[np.ix_([0,3],[1,2])])) )
        assert max(abs(eigen-fci_e), abs(eigen-reduced), abs(eigen-bo), leakage) < 1e-10
        samples.append(dict(r_angstrom=r, hamiltonian_full_hartree=h.tolist(), hamiltonian_even_hartree=block.tolist(), pauli_hartree={'I':float(ci),'X':float(cx),'Z':float(cz)}, energy_hf_hartree=float(mf.e_tot), energy_fci_hartree=eigen, energy_nuclear_hartree=float(mol.energy_nuc()), optimal_theta_radians=theta, ground_coefficients=v.tolist(), validation={'symmetry_leakage':leakage,'fci_error':float(abs(eigen-fci_e)),'bo_error':float(abs(eigen-bo)), 'ground_residual':float(np.linalg.norm(block@v-eigen*v))}))
    return {'schema_version':1,'method':{'molecule':'H2','basis':'STO-3G','electrons':2,'pyscf_version':pyscf.__version__,'numpy_version':np.__version__,'energy_unit':'Hartree','energy_convention':'Total clamped-nuclei energy including nuclear repulsion; no zero-point energy','full_basis':['g_alpha g_beta','g_alpha u_beta','u_alpha g_beta','u_alpha u_beta'],'logical_basis':['g_alpha g_beta','u_alpha u_beta'],'reduction':'Even inversion parity, two electrons, one alpha and one beta; contains singlet ground state at these distances','scope':'FCI exact only within STO-3G. One logical qubit encodes this special symmetry block, not a general orbital-to-qubit mapping.'},'default_index':1,'samples':samples}

if __name__=='__main__':
    data=calculate(); (ROOT/'data/vqe_h2.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n'); print('Wrote four H2 symmetry-reduced Hamiltonians')
