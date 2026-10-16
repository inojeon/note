# H2 basis comparison: orbital energy levels

Geometry: H at (0,0,-0.37) and (0,0,0.37) Å; neutral singlet.
Method: restricted Hartree–Fock in PySCF 2.14.0, spherical AO convention.
Basis sets: STO-3G, 6-31G, 6-31G(d,p), 6-31++G(d,p), cc-pVDZ.

Recompute from the project root:

```sh
OMP_NUM_THREADS=1 .venv/bin/python scripts/basis_orbital_levels.py
python3 tools/build_basis_orbitals.py
python3 tools/enrich_concepts.py
python3 tools/build_concepts.py
```

Only recomputation requires PySCF. Normal HTML builds embed stored data.
The script checks SCF convergence, FC = SC epsilon residual (<1e-7),
C-transpose S C orthonormality (<1e-10) and the two-electron occupation.
SCF tolerances are 1e-14 Hartree and 1e-10 orbital gradient; max 200 cycles.
Data records the actual residuals, occupations and molecular total energy.
The graph uses orbital energies only, never the molecular total energy.
Degenerate levels within 1e-7 Hartree are grouped with multiplicity labels.
All columns in a view have the same energy scale; the low-energy view labels
how many orbitals are outside its range. The table always contains all levels.

These virtual orbital energies are basis-dependent Fock eigenvalues, not
many-electron excitation energies or a list of physically bound states.
6-31G* does not add polarization functions to hydrogen; (d,p) is used here
to show the effect of adding hydrogen p functions.

Browser validation: `node tools/check_basis_orbitals.cjs` with the same
PLAYWRIGHT_MODULE and CHROMIUM_PATH settings as other concept checks.
