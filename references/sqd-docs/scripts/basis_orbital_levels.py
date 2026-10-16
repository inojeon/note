"""RHF orbital energies for H2 at a fixed bond length in five basis sets.
Run: OMP_NUM_THREADS=1 .venv/bin/python scripts/basis_orbital_levels.py
Orbital energies are eigenvalues of the converged Fock operator, not total
molecular energies or many-electron Hamiltonian excitation energies.
"""
import os
for key in ('OMP_NUM_THREADS','OPENBLAS_NUM_THREADS','MKL_NUM_THREADS'):
    os.environ[key] = '1'
import json
from pathlib import Path
import numpy as np
import pyscf
from pyscf import gto, scf, lib
lib.num_threads(1)
root = Path(__file__).resolve().parents[1]
rows = []
for basis in ['sto-3g','6-31g','6-31g(d,p)','6-31++g(d,p)','cc-pvdz']:
    mol = gto.M(atom='H 0 0 -0.37; H 0 0 0.37', basis=basis, unit='Angstrom', charge=0, spin=0, verbose=0)
    mf = scf.RHF(mol)
    mf.conv_tol = 1e-14
    mf.conv_tol_grad = 1e-10
    mf.max_cycle = 200
    mf.kernel()
    assert mf.converged
    overlap, fock = mf.get_ovlp(), mf.get_fock()
    residual = float(np.max(np.abs(fock @ mf.mo_coeff - overlap @ mf.mo_coeff @ np.diag(mf.mo_energy))))
    orth_error = float(np.max(np.abs(mf.mo_coeff.T @ overlap @ mf.mo_coeff - np.eye(mol.nao_nr()))))
    assert residual < 1e-7 and orth_error < 1e-10, (basis, residual, orth_error)
    assert np.sum(mf.mo_occ) == 2 and np.count_nonzero(mf.mo_occ) == 1
    rows.append({'basis':basis, 'spatial_functions':mol.nao_nr(), 'orbital_energies_hartree':mf.mo_energy.tolist(), 'occupations':mf.mo_occ.tolist(), 'total_energy_hartree':float(mf.e_tot), 'max_eigen_residual':residual, 'max_orthogonality_error':orth_error})
data = {'method':'RHF','molecule':'H2','bond_length_angstrom':0.74,'charge':0,'spin_2s':0,'energy_unit':'Hartree','pyscf_version':pyscf.__version__,'rows':rows}
(root/'data/basis_orbital_levels.json').write_text(json.dumps(data,indent=2)+'\n')
for r in rows:print(r['basis'],r['spatial_functions'],np.round(r['orbital_energies_hartree'],6).tolist(), 'total',r['total_energy_hartree'])
