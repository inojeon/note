"""문서 3(03-ucj-inside.html): UCJ/LUCJ 각도 수, 변환만 한 에너지, 각도 최적화.
최적화는 수 분 걸린다: python p03_ucj_inside.py --optimize"""
import sys, numpy as np, scipy.optimize, ffsim
from common import n2, save

mol, mf, cas, *_ = n2(); e_cas = cas.kernel()[0]
md = ffsim.MolecularData.from_scf(mf, active_space=range(2, 10)); md.run_ccsd(store_t2=True)
norb, nelec = 8, (5, 5)
H = ffsim.linear_operator(md.hamiltonian, norb=norb, nelec=nelec); ref = ffsim.hartree_fock_state(norb, nelec)
lucj = ([(p, p + 1) for p in range(7)], [(p, p) for p in range(0, 8, 4)])
rows = []
for name, ip, reps in [("UCJ", None, 1), ("UCJ", None, 2), ("LUCJ", lucj, 1), ("LUCJ", lucj, 2)]:
    op = ffsim.UCJOpSpinBalanced.from_t_amplitudes(md.ccsd_t2, n_reps=reps, interaction_pairs=ip)
    x0 = op.to_parameters(interaction_pairs=ip)
    def E(x):
        psi = ffsim.apply_unitary(ref, ffsim.UCJOpSpinBalanced.from_parameters(x, norb=norb, n_reps=reps, interaction_pairs=ip), norb=norb, nelec=nelec)
        return np.vdot(psi, H @ psi).real, psi
    e0, psi0 = E(x0)
    row = {"circuit": name, "n_reps": reps, "n_params": len(x0), "E_init": e0, "err_init_mHa": (e0 - e_cas) * 1000,
           "overlap2_init": abs(np.vdot(cas.ci.ravel(), psi0)) ** 2}
    if "--optimize" in sys.argv and not (name == "UCJ" and reps == 2):
        r = scipy.optimize.minimize(lambda x: E(x)[0], x0, method="L-BFGS-B", options={"maxiter": 60})
        e1, psi1 = E(r.x)
        row.update(E_opt=e1, err_opt_mHa=(e1 - e_cas) * 1000, overlap2_opt=abs(np.vdot(cas.ci.ravel(), psi1)) ** 2)
    rows.append(row); print(row)
save("03_ucj.json", {"E_CASCI": e_cas, "E_CCSD": md.ccsd_energy, "rows": rows})
