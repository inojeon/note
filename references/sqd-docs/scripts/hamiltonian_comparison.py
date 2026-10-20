"""Reproducible H2 / HeH+ STO-3G determinant Hamiltonians (total energy)."""
import os
for key in ['OMP_NUM_THREADS','OPENBLAS_NUM_THREADS','MKL_NUM_THREADS']: os.environ[key]='1'
from pathlib import Path
import json
import numpy as np
import pyscf
from pyscf import gto,scf,ao2mo,fci,lib
lib.num_threads(1)
root=Path(__file__).resolve().parents[1]
results=[]
for name,atom,charge,distance in [('H2','H 0 0 0; H 0 0 0.74',0,.74),('HeH+','He 0 0 0; H 0 0 1.0',1,1.0)]:
 mol=gto.M(atom=atom,charge=charge,spin=0,basis='sto-3g',unit='Angstrom',verbose=0)
 mf=scf.RHF(mol);mf.conv_tol=1e-14;mf.conv_tol_grad=1e-10;mf.kernel();assert mf.converged
 h1=mf.mo_coeff.T@mf.get_hcore()@mf.mo_coeff;eri=ao2mo.kernel(mol,mf.mo_coeff)
 eff=fci.direct_spin1.absorb_h1e(h1,eri,2,(1,1),.5)
 H=np.column_stack([fci.direct_spin1.contract_2e(eff,v.reshape(2,2),2,(1,1)).ravel() for v in np.eye(4)])+np.eye(4)*mol.energy_nuc()
 e,c=np.linalg.eigh(H);sub=H[np.ix_([0,3],[0,3])];es,cs=np.linalg.eigh(sub)
 efci,_=fci.direct_spin0.FCI(mol).kernel(h1,eri,2,(1,1),ecore=mol.energy_nuc())
 assert np.max(np.abs(H-H.T))<1e-10 and abs(e[0]-efci)<1e-10
 assert es[0]>=e[0]-1e-10
 results.append(dict(molecule=name,charge=charge,r_angstrom=distance,matrix=H.tolist(),energy_full=float(e[0]),energy_pair=float(es[0]),coupling_outside_pair=float(np.max(abs(H[np.ix_([0,3],[1,2])]))),nuclear=float(mol.energy_nuc()),validation=dict(fci_error=float(abs(e[0]-efci)),eigen_residual=float(np.linalg.norm(H@c[:,0]-e[0]*c[:,0])))))
x={'method':{'pyscf_version':pyscf.__version__,'basis':'STO-3G','orbitals':'canonical RHF molecular orbitals in increasing orbital energy','basis_order':['1alpha 1beta','1alpha 2beta','2alpha 1beta','2alpha 2beta'],'selected_pair':[0,3],'electrons':[1,1],'energy_unit':'Hartree','nuclear_repulsion_included':True,'scope':'Nonrelativistic clamped nuclei; no zero-point energy. Exactness only in STO-3G.'},'molecules':results}
(root/'data/hamiltonian_comparison.json').write_text(json.dumps(x,indent=2)+'\n')
for r in results:print(r['molecule'], 'full',r['energy_full'],'pair',r['energy_pair'],'external coupling',r['coupling_outside_pair'])
