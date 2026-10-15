"""문서 전체에서 공유하는 분자 준비 함수. 모든 숫자는 여기서 출발한다."""
import json, os, numpy as np
from pyscf import gto, scf, mcscf, ao2mo

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA, exist_ok=True)

def save(name, obj):
    path = os.path.join(DATA, name)
    with open(path, "w") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, default=lambda x: x.tolist() if hasattr(x, "tolist") else float(x))
    print("saved", os.path.relpath(path))

def n2(basis="cc-pvdz", r=1.098, ncas=8, nelecas=(5, 5)):
    """문서 1~6의 N2: cc-pVDZ, 활성 8궤도 (5,5). 반환: mol, mf, cas, hcore, eri, ecore"""
    mol = gto.M(atom=f"N 0 0 0; N 0 0 {r}", basis=basis, verbose=0)
    mf = scf.RHF(mol).run()
    cas = mcscf.CASCI(mf, ncas, nelecas)
    hcore, ecore = cas.get_h1eff()
    eri = ao2mo.restore(1, cas.get_h2eff(), ncas)
    return mol, mf, cas, hcore, eri, ecore

def h2(r=0.74, basis="sto-3g"):
    """입문 문서의 H2: 자리 2개, 전자 (1,1)."""
    mol = gto.M(atom=f"H 0 0 0; H 0 0 {r}", basis=basis, verbose=0)
    mf = scf.RHF(mol).run()
    return mol, mf

def h2_config_matrix(mol, mf):
    """H2의 4x4 배치 행렬 (A=01|01, B, C, D=10|10 순서, 핵 반발 포함)."""
    from pyscf import fci
    h1 = mf.mo_coeff.T @ mf.get_hcore() @ mf.mo_coeff
    eri = ao2mo.restore(1, ao2mo.kernel(mol, mf.mo_coeff), 2)
    h2e = fci.direct_spin1.absorb_h1e(h1, eri, 2, (1, 1), 0.5)
    H = np.zeros((4, 4))
    for i in range(4):
        v = np.zeros(4); v[i] = 1
        H[:, i] = fci.direct_spin1.contract_2e(h2e, v.reshape(2, 2), 2, (1, 1)).ravel()
    return H + mol.energy_nuc() * np.eye(4)
