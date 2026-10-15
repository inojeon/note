"""수학 문서(math.html): N2 3136x3136 전체 행렬, 랑초스·멱법 수렴, 상위-k 부분공간 오차, 누적 비중."""
import numpy as np
from pyscf import fci
from common import n2, save

_, mf, cas, hcore, eri, ecore = n2()
h2e = fci.direct_spin1.absorb_h1e(hcore, eri, 8, (5, 5), 0.5)
Hv = lambda v: fci.direct_spin1.contract_2e(h2e, v.reshape(56, 56), 8, (5, 5)).ravel()
N = 3136; H = np.column_stack([Hv(np.eye(N)[i]) for i in range(N)])
w, V = np.linalg.eigh(H); E0 = w[0]
def lanczos(v0, m):
    basis, a, b, ritz = [], [], [], []; v = v0 / np.linalg.norm(v0); vp = np.zeros_like(v); beta = 0
    for _ in range(m):
        x = Hv(v) - beta * vp; al = v @ x; x -= al * v
        for u in basis: x -= (u @ x) * u
        basis.append(v); a.append(al); beta = np.linalg.norm(x)
        ritz.append(np.linalg.eigvalsh(np.diag(a) + np.diag(b, 1) + np.diag(b, -1))[0] - E0)
        if beta < 1e-12: break
        b.append(beta); vp, v = v, x / beta
    return ritz
hf = np.zeros(N); hf[0] = 1
v = hf.copy(); power = []
for _ in range(200):
    v = w[-1] * v - Hv(v); v /= np.linalg.norm(v); power.append(v @ Hv(v) - E0)
P = V[:, 0] ** 2; order = np.argsort(-np.round(P, 12), kind="stable"); cum = np.cumsum(P[order])
sub = []
for k in [1, 2, 5, 10, 20, 50, 100, 200, 500]:
    idx = order[:k]; sub.append({"k": k, "err_mHa": (np.linalg.eigvalsh(H[np.ix_(idx, idx)])[0] - E0) * 1000, "missing": 1 - cum[k - 1]})
save("math.json", {"E0": E0 + ecore, "gap": w[1] - w[0], "lanczos_hf": lanczos(hf, 30),
                   "lanczos_random": lanczos(np.random.default_rng(0).standard_normal(N), 60),
                   "power": power[:40], "coverage_top1000": cum[:1000], "subspace": sub})
