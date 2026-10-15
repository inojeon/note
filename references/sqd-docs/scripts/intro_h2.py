"""입문 문서(intro.html): H2 4x4 행렬, 결합 늘리기, 궤도 단면 곡선, 3D 등고면."""
import numpy as np
from common import h2, h2_config_matrix, save

mol, mf = h2()
H = h2_config_matrix(mol, mf)
w, V = np.linalg.eigh(H)
stretch = []
for r in [0.74, 1.5, 3.0]:
    m, f = h2(r); Hr = h2_config_matrix(m, f); wr, Vr = np.linalg.eigh(Hr)
    stretch.append({"r": r, "E_HF": f.e_tot, "E_FCI": wr[0], "D_weight": Vr[3, 0] ** 2, "err_mHa": (f.e_tot - wr[0]) * 1000})
z = np.linspace(-1.5, 2.24, 60)
mo = mol.eval_gto("GTOval", np.array([[0, 0, zz / 0.529177] for zz in z])) @ mf.mo_coeff
save("intro_h2.json", {"H": H, "eigvals": w, "ground_vec": V[:, 0], "mo_energy": mf.mo_energy,
                       "stretch": stretch, "profile_z": z, "profile_low": mo[:, 0], "profile_high": mo[:, 1]})

try:  # 3D 등고면 (scikit-image 필요)
    from skimage import measure
    N, L = 44, 2.6
    xs = np.linspace(-L, L, N); X, Y, Z = np.meshgrid(xs, xs, xs, indexing="ij")
    vals = (mol.eval_gto("GTOval", np.stack([X.ravel(), Y.ravel(), Z.ravel() + 0.37], 1) / 0.529177) @ mf.mo_coeff).reshape(N, N, N, 2)
    out = {}
    for k, name in [(0, "low"), (1, "high")]:
        out[name] = []
        for sign in [1, -1]:
            g = vals[..., k] * sign
            if g.max() < 0.12: continue
            v, f, _, _ = measure.marching_cubes(g, 0.12, spacing=(xs[1] - xs[0],) * 3)
            out[name].append({"sign": sign, "v": np.round(v - L, 3).ravel(), "f": f.ravel()})
    save("orb3d.json", out)
except ImportError:
    print("scikit-image 없음: orb3d.json 생략")
