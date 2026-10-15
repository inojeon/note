"""문서 4(04-circuit.html): UCJ/LUCJ 회로 깊이·게이트 수, 샘플링, SQD 끝까지."""
import ffsim, numpy as np
from qiskit import QuantumCircuit, QuantumRegister, transpile
from qiskit.primitives import StatevectorSampler
from qiskit_addon_sqd.fermion import diagonalize_fermionic_hamiltonian
from common import n2, save

mol, mf, cas, hcore, eri, ecore = n2(); e_cas = cas.kernel()[0]
md = ffsim.MolecularData.from_scf(mf, active_space=range(2, 10)); md.run_ccsd(store_t2=True)
norb, nelec = 8, (5, 5)
lucj = ([(p, p + 1) for p in range(7)], [(p, p) for p in range(0, 8, 4)])
out = {"E_CASCI": e_cas, "E_HF": mf.e_tot, "E_CCSD": md.ccsd_energy, "circuits": {}, "sqd": []}
for name, ip in [("UCJ", None), ("LUCJ", lucj)]:
    op = ffsim.UCJOpSpinBalanced.from_t_amplitudes(md.ccsd_t2, n_reps=1, interaction_pairs=ip)
    q = QuantumRegister(2 * norb); c = QuantumCircuit(q)
    c.append(ffsim.qiskit.PrepareHartreeFockJW(norb, nelec), q); c.append(ffsim.qiskit.UCJOpSpinBalancedJW(op), q); c.measure_all()
    t = transpile(c, basis_gates=["cz", "rz", "sx", "x"], optimization_level=1)
    out["circuits"][name] = {"depth": t.depth(), "ops": dict(t.count_ops())}
    for shots in [10_000, 100_000]:
        ba = StatevectorSampler(seed=1).run([c], shots=shots).result()[0].data.meas
        n = len(ba.get_counts())
        r = diagonalize_fermionic_hamiltonian(hcore, eri, ba, samples_per_batch=min(n, 200), norb=norb, nelec=nelec,
                                              num_batches=3, max_iterations=5, seed=1)
        out["sqd"].append({"circuit": name, "shots": shots, "unique": n, "E": r.energy + ecore, "err_mHa": (r.energy + ecore - e_cas) * 1000})
        print(out["sqd"][-1])
save("04_circuit.json", out)
