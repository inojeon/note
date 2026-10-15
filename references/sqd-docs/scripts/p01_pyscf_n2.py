"""문서 1(01-pyscf.html): 기저별 궤도 수, HF/CASCI, 궤도 에너지, hcore, eri 단면, 결합 늘리기."""
from pyscf import gto, scf, mcscf
from common import n2, save

basis_table = []
for b in ["sto-3g", "6-31g", "cc-pvdz", "cc-pvtz"]:
    mol = gto.M(atom="N 0 0 0; N 0 0 1.098", basis=b, verbose=0)
    row = {"basis": b, "nao": mol.nao}
    if b != "cc-pvtz": row["E_HF"] = scf.RHF(mol).run().e_tot
    basis_table.append(row)
mol, mf, cas, hcore, eri, ecore = n2()
e_cas = cas.kernel()[0]
stretch = []
for r in [0.9, 1.0, 1.098, 1.2, 1.4, 1.6, 1.8, 2.0, 2.4]:
    m = gto.M(atom=f"N 0 0 0; N 0 0 {r}", basis="cc-pvdz", verbose=0); f = scf.RHF(m).run()
    stretch.append({"r": r, "E_HF": f.e_tot, "E_CASCI": mcscf.CASCI(f, 8, (5, 5)).kernel()[0]})
save("01_pyscf.json", {"basis_table": basis_table, "E_HF": mf.e_tot, "E_CASCI": e_cas, "ecore": ecore,
                       "mo_energy": mf.mo_energy[:10], "hcore": hcore.round(3), "eri_00": eri[0, 0].round(3),
                       "eri_zero_fraction": float((abs(eri) < 1e-6).mean()), "stretch": stretch})
