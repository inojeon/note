# H₂ VQE experiment

Reproduce from the project root:

```
.venv/bin/python scripts/vqe_h2.py
python3 tools/check_vqe_h2_data.py
.venv/bin/python tools/check_vqe_h2_data.py --recompute
python3 tools/build_vqe_hydrogen.py
python3 tools/enrich_concepts.py
python3 tools/build_concepts.py
```

Python/PySCF/NumPy versions are recorded in JSON (PySCF 2.14.0, NumPy 2.4.4); numerical threads fixed to one. HTML builds use checked-in JSON and do not require PySCF.

The RHF canonical STO-3G orbitals are bonding g and antibonding u. The alpha-string × beta-string determinant ordering is (gαgβ, gαuβ, uαgβ, uαuβ). The script constructs the complete 4×4 Hamiltonian by applying PySCF's FCI contraction to each unit vector. Every diagonal includes nuclear repulsion. Energies are Hartree, distances Å; nonrelativistic, clamped nuclei, no nuclear zero-point energy.

The inversion-even block spanned by g² and u² contains the singlet ground state at all four exported distances. This special block is encoded as one logical qubit: |0〉=g², |1〉=u². This is not a claim that arbitrary four spin orbitals require only one qubit. The odd block's lowest eigenvalue is independently checked against the even block minimum.

For real state Ry(θ)|0〉, E(θ)=cI+cX sinθ+cZ cosθ; cI=(H00+H11)/2, cX=H01, cZ=(H00−H11)/2. θ=atan2(−cX,−cZ) attains the exact finite-basis ground energy. θ=0 is RHF. Browser optimization uses deterministic gradient descent with step size 0.7/hypot(cX,cZ), not the analytic solution; the “FCI angle” button separately exposes the reference. An exact maximum can have zero gradient, illustrating that convergence is not automatic. No shot sampling or hardware noise is included on this page.

Validation covers full matrix Hermiticity, symmetry-block separation, analytic eigenvalues of both blocks, Pauli reconstruction, 1444 normalized variational states, HF energy, and matching existing BO data. The generator additionally compares PySCF singlet FCI and full 4×4 diagonalization. FCI exactness is only within STO-3G, not an exact complete-basis molecule.
