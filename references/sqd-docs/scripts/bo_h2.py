"""Reproducible H2 Born–Oppenheimer energy and density, FCI/STO-3G.

Run with the project virtual environment; see bo_h2_README.md. The browser
evaluates the exported normalized Gaussian AOs rather than downloading grids.
"""
import os

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import json
from pathlib import Path

import numpy as np
import pyscf
from pyscf import ao2mo, fci, gto, lib, scf
from pyscf.lib import param

lib.num_threads(1)
DISTANCES = [.4, .5, .6, .65, .7, .72, .74, .76, .78, .8, .82, .85,
             .9, 1., 1.1, 1.2, 1.35, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.75, 3.]
ORIGIN = np.array([-7., -5., -5.])
SHAPE = np.array([33, 33, 33])
STEP = np.array([14., 10., 10.]) / (SHAPE - 1)


def ao_values(points, centers, exponents, coefficients):
    r2 = np.sum((points[:, None, :] - centers[None, :, :]) ** 2, axis=-1)
    return np.sum(np.exp(-r2[:, :, None] * exponents) * coefficients, axis=-1)


def calculate():
    samples = []
    coordinates = [ORIGIN[k] + np.arange(SHAPE[k]) * STEP[k] for k in range(3)]
    points = np.stack(np.meshgrid(*coordinates, indexing="ij"), axis=-1).reshape(-1, 3)
    for distance in DISTANCES:
        mol = gto.M(atom=[("H", (-distance / 2, 0, 0)),
                          ("H", (distance / 2, 0, 0))],
                    unit="Angstrom", basis="sto-3g", charge=0, spin=0, verbose=0)
        mean_field = scf.RHF(mol)
        mean_field.conv_tol = 1e-13
        mean_field.kernel()
        assert mean_field.converged
        c = mean_field.mo_coeff
        h1 = c.T @ mean_field.get_hcore() @ c
        eri = ao2mo.kernel(mol, c)
        solver = fci.direct_spin0.FCI(mol)
        solver.conv_tol = 1e-13
        electronic, ci = solver.kernel(h1, eri, 2, (1, 1), ecore=0)
        assert solver.converged
        dm1, dm2 = solver.make_rdm12(ci, 2, (1, 1))
        density_ao = c @ dm1 @ c.T
        h2_effective = fci.direct_spin1.absorb_h1e(h1, eri, 2, (1, 1), .5)
        action = lambda x: fci.direct_spin1.contract_2e(h2_effective, x, 2, (1, 1))
        residual = np.linalg.norm(action(ci) - electronic * ci)
        # Independent full determinant diagonalization (including the triplet)
        # verifies that the singlet is the lowest state of this finite basis.
        ham = np.column_stack([action(v.reshape(2, 2)).ravel() for v in np.eye(4)])
        reference_energy = np.linalg.eigvalsh(ham)[0]
        rdm_energy = (np.einsum("pq,qp", h1, dm1)
                      + .5 * np.einsum("pqrs,pqrs", ao2mo.restore(1, eri, 2), dm2))
        overlap = mol.intor("int1e_ovlp")
        centers = mol.atom_coords()
        exponents = mol.bas_exp(0)
        # libcint stores normalized radial contractions. Multiplication by
        # Y_00 = 1/sqrt(4 pi) gives the full normalized Cartesian s orbital.
        coefficients = mol._libcint_ctr_coeff(0)[:, 0] / np.sqrt(4 * np.pi)
        values = ao_values(points, centers, exponents, coefficients)
        pyscf_values = mol.eval_gto("GTOval_sph", points)
        ao_error = np.max(np.abs(values - pyscf_values))
        rho = np.einsum("pi,ij,pj->p", values, density_ao, values)
        grid = rho.reshape(tuple(SHAPE))
        integral = grid
        for axis in [2, 1, 0]:
            integral = np.trapezoid(integral, dx=STEP[axis], axis=axis)
        nuclear = mol.energy_nuc()
        validation = {
            "electron_count_ao_trace": float(np.einsum("ij,ji", density_ao, overlap)),
            "electron_count_mo_trace": float(np.trace(dm1)),
            "density_grid_integral": float(integral),
            "density_grid_min": float(np.min(rho)),
            "ao_export_max_error": float(ao_error),
            "fci_residual_hartree": float(residual),
            "rdm_energy_error_hartree": float(abs(rdm_energy - electronic)),
            "full_diagonalization_error_hartree": float(abs(reference_energy - electronic)),
            "spin_squared": float(fci.spin_op.spin_square(ci, 2, (1, 1))[0]),
        }
        assert abs(validation["electron_count_ao_trace"] - 2) < 1e-10
        assert residual < 1e-10 and ao_error < 1e-12
        assert validation["rdm_energy_error_hartree"] < 1e-10
        assert validation["full_diagonalization_error_hartree"] < 1e-10
        assert np.min(rho) >= -1e-14
        samples.append({
            "r_angstrom": distance,
            "energy_electronic_hartree": float(electronic),
            "energy_nuclear_hartree": float(nuclear),
            "energy_total_hartree": float(electronic + nuclear),
            "energy_rhf_total_hartree": float(mean_field.e_tot),
            "nuclei_bohr": centers.tolist(),
            "density_matrix_ao": density_ao.tolist(),
            "overlap_matrix_ao": overlap.tolist(),
            "validation": validation,
        })
    return {
        "schema_version": 1,
        "method": {
            "molecule": "H2", "charge": 0, "electrons": 2, "spin_multiplicity": 1,
            "electronic_structure": "Full configuration interaction (FCI)",
            "basis": "STO-3G", "spatial_orbitals": 2, "determinants_ms0": 4,
            "pyscf_version": pyscf.__version__, "numpy_version": np.__version__,
            "threads": 1,
            "density": "spin-summed one-electron density of the same FCI singlet ground state",
            "energy_convention": "electronic energy excludes nuclear repulsion; total includes it",
            "limitations": "Nonrelativistic clamped nuclei. FCI is exact only within STO-3G, not the complete-basis molecular solution. No nuclear zero-point energy. The marked minimum is the lowest sampled distance, not an optimized or measured bond length.",
        },
        "bohr_to_angstrom": param.BOHR,
        "gaussian_basis": {
            "exponents_bohr_minus2": exponents.tolist(),
            "coefficients": coefficients.tolist(),
            "coefficient_convention": "Fully normalized Cartesian s contraction; AO_A(r)=sum_p c_p exp(-alpha_p |r-R_A|^2), with r and R_A in bohr. Coefficients include primitive and contraction normalization and Y_00.",
            "density_formula": "rho(r)=sum_AB D_AB AO_A(r) AO_B(r)",
            "density_units": "electrons/bohr^3",
        },
        "visualization": {
            "grid_shape": SHAPE.tolist(), "grid_origin_bohr": ORIGIN.tolist(),
            "grid_step_bohr": STEP.tolist(),
            "grid_order": "x outermost, z fastest (Gaussian cube order)",
            "isovalue_electrons_per_bohr3": .04,
            "slice_plane": "z=0, same analytic density as the 3D grid",
        },
        "default_index": DISTANCES.index(.74),
        "minimum_index": int(np.argmin([s["energy_total_hartree"] for s in samples])),
        "samples": samples,
    }


if __name__ == "__main__":
    data = calculate()
    path = Path(__file__).resolve().parents[1] / "data" / "bo_h2.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    minimum = data["samples"][data["minimum_index"]]
    print(f"Wrote {len(data['samples'])} distances to {path}")
    print(f"Sampled minimum: {minimum['r_angstrom']} Å, {minimum['energy_total_hartree']:.12f} Eh")
    print("Largest grid electron-count error:", max(abs(s["validation"]["density_grid_integral"] - 2) for s in data["samples"]))
