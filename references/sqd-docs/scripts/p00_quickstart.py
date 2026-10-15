"""문서 0(00-quickstart.html): 공식 Quickstart 재현 + 옵션 비교."""
import math, numpy as np
from functools import partial
from pyscf import ao2mo, gto, mcscf, scf, fci
from qiskit_addon_sqd.counts import generate_bit_array_uniform, bit_array_to_arrays
from qiskit_addon_sqd.fermion import diagonalize_fermionic_hamiltonian, solve_sci_batch
from common import save

mol = gto.M(atom="N 0 0 0; N 0 0 1.09768", basis="sto-3g", spin=0, charge=0, verbose=0)
mf = scf.RHF(mol).run(); cas = mcscf.CASCI(mf, ncas=8, nelecas=10)
hcore, enuc = cas.get_h1eff(); eri = ao2mo.restore(1, cas.get_h2eff(), 8); nelec = cas.nelecas
exact = fci.direct_spin1.kernel(hcore, eri, 8, nelec)[0] + enuc
ba = generate_bit_array_uniform(10_000, 16, rand_seed=np.random.default_rng(24))
bsm, pr = bit_array_to_arrays(ba); ok = (bsm[:, 8:].sum(1) == 5) & (bsm[:, :8].sum(1) == 5)
solver = partial(solve_sci_batch, spin_sq=0.0, max_cycle=200)
def run(spb, sym):
    hist = []
    r = diagonalize_fermionic_hamiltonian(hcore, eri, ba, samples_per_batch=spb, norb=8, nelec=nelec, occupancies_tol=1e-7,
            max_iterations=30, sci_solver=solver, symmetrize_spin=sym, seed=np.random.default_rng(32),
            callback=lambda rs: hist.append({"E": rs[0].energy + enuc, "dim": int(np.prod(rs[0].sci_state.amplitudes.shape))}))
    return hist, r
hist, r = run(20, True)
variants = [{"samples_per_batch": spb, "symmetrize_spin": sym, "iterations": len(h), "final_err": rr.energy + enuc - exact}
            for spb in [20, 100] for sym in [True, False] for h, rr in [run(spb, sym)]]
save("00_quickstart.json", {"E_HF": mf.e_tot, "E_exact": exact, "nuclear_repulsion_energy": enuc,
                            "unique": len(bsm), "valid_unique": int(ok.sum()), "valid_weight": float(pr[ok].sum()),
                            "random_baseline": math.comb(8, 5) ** 2 / 2 ** 16, "history": hist,
                            "final_occupancies": np.sum(r.orbital_occupancies, axis=0).round(3), "variants": variants})
