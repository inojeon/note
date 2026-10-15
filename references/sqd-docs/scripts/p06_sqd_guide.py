"""문서 6(06-sqd-guide.html): 3% 잡음 샘플로 SQD 실제 실행, 반복별 기록, 복구 예시."""
import numpy as np
from pyscf import fci
from qiskit.primitives import BitArray
from qiskit_addon_sqd.counts import bit_array_to_arrays
from qiskit_addon_sqd.subsampling import postselect_by_hamming_right_and_left, subsample
from qiskit_addon_sqd.configuration_recovery import recover_configurations
from qiskit_addon_sqd.fermion import diagonalize_fermionic_hamiltonian, batch_to_ci_strings
from common import n2, save

_, _, cas, hcore, eri, ecore = n2(); e_cas = cas.kernel()[0]
P = (cas.ci ** 2).ravel(); s = fci.cistring.make_strings(range(8), 5)
bs = lambda i: format(s[np.unravel_index(i, (56, 56))[1]], "08b") + format(s[np.unravel_index(i, (56, 56))[0]], "08b")
rng = np.random.default_rng(1)
bits = np.array([[int(c) for c in bs(i)] for i in rng.choice(P.size, size=20000, p=P)], dtype=bool)
bits ^= rng.random(bits.shape) < 0.03
counts = {}
for row in bits: k = "".join(map(str, row.astype(int))); counts[k] = counts.get(k, 0) + 1
ba = BitArray.from_counts(counts, num_bits=16)
bsm, pr = bit_array_to_arrays(ba); kept, kp = postselect_by_hamming_right_and_left(bsm, pr, hamming_right=5, hamming_left=5)
log = []
def cb(results):
    best = min(results, key=lambda r: r.energy)
    log.append({"E": [r.energy + ecore for r in results], "dims": [list(r.sci_state.amplitudes.shape) for r in results],
                "occ_alpha": best.orbital_occupancies[0].round(3)})
res = diagonalize_fermionic_hamiltonian(hcore, eri, ba, samples_per_batch=50, norb=8, nelec=(5, 5), num_batches=3,
                                        max_iterations=8, seed=1, callback=cb)
occ = np.array(log[0]["occ_alpha"])
rec, _ = recover_configurations(bsm, pr, (occ, occ), 5, 5, rng)
batch = subsample(kept, kp, samples_per_batch=50, num_batches=1, rand_seed=1)[0]
ca, cb_ = batch_to_ci_strings(batch, 8)
invalid = sorted([k for k in counts if k[8:].count("1") != 5 or k[:8].count("1") != 5], key=lambda k: -counts[k])[:3]
save("06_sqd.json", {"E_CASCI": e_cas, "unique": len(bsm), "valid_unique": len(kept), "after_recovery_unique": len(rec),
                     "batch50_subspace": [len(ca), len(cb_)], "top_invalid": [[k, counts[k]] for k in invalid],
                     "iterations": log, "final_E": res.energy + ecore, "final_err_mHa": (res.energy + ecore - e_cas) * 1000})
