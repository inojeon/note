"""문서 5(05-sampling.html): 바닥상태 상위 배치, 누적 확률, 샷별 고유 배치, 비트 뒤집힘 잡음."""
import numpy as np
from pyscf import fci
from common import n2, save

_, _, cas, *_ = n2(); cas.kernel()
P = (cas.ci ** 2).ravel(); s = fci.cistring.make_strings(range(8), 5)
bs = lambda i: format(s[np.unravel_index(i, (56, 56))[1]], "08b") + "|" + format(s[np.unravel_index(i, (56, 56))[0]], "08b")
order = np.argsort(-P); cum = np.cumsum(P[order]); rng = np.random.default_rng(1)
shots = []
for M in [100, 1000, 10000, 100000]:
    u = np.unique(rng.choice(P.size, size=M, p=P)); shots.append({"shots": M, "unique": len(u), "covered": float(P[u].sum())})
idx = rng.choice(P.size, size=10000, p=P)
bits = np.array([[int(c) for c in bs(i).replace("|", "")] for i in idx], dtype=bool)
noise = []
for q in [0, 0.005, 0.01, 0.02, 0.03, 0.05, 0.08, 0.1]:
    nb = bits ^ (rng.random(bits.shape) < q); ok = (nb[:, 8:].sum(1) == 5) & (nb[:, :8].sum(1) == 5)
    noise.append({"q": q, "pass": float(ok.mean()), "pass_and_intact": float((ok & (nb == bits).all(1)).mean()), "unique_pass": int(len(np.unique(nb[ok], axis=0)))})
save("05_sampling.json", {"top10": [[bs(i), float(P[i])] for i in order[:10]],
                          "cumulative": {k: float(cum[k - 1]) for k in [1, 10, 50, 100, 500]}, "shots": shots, "noise": noise})
