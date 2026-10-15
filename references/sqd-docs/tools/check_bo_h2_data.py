"""Check exported H2 physics and normalized analytic AOs, without dependencies.

Optional --recompute runs the PySCF generator in memory and compares all data.
"""
import argparse
import importlib.util
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def close(a, b, tolerance=1e-10):
    assert math.isfinite(a) and math.isfinite(b), (a, b)
    assert abs(a - b) < tolerance, (a, b, tolerance)


def overlap(a, b, exponents, coefficients, bounds=None):
    """Independently integrate Gaussian products, analytically, over R³ or a box."""
    total = 0.
    for alpha, ca in zip(exponents, coefficients):
        for beta, cb in zip(exponents, coefficients):
            p = alpha + beta
            prefactor = ca * cb * math.exp(-alpha * beta / p * sum((x - y) ** 2 for x, y in zip(a, b)))
            for axis in range(3):
                value = math.sqrt(math.pi / p)
                if bounds:
                    center = (alpha * a[axis] + beta * b[axis]) / p
                    low, high = bounds[axis]
                    value *= .5 * (math.erf(math.sqrt(p) * (high - center))
                                    - math.erf(math.sqrt(p) * (low - center)))
                prefactor *= value
            total += prefactor
    return total


def main(recompute=False):
    data = json.loads((ROOT / "data/bo_h2.json").read_text())
    basis = data["gaussian_basis"]
    exponents, coefficients = basis["exponents_bohr_minus2"], basis["coefficients"]
    assert len(exponents) == len(coefficients) == 3
    assert all(alpha > 0 for alpha in exponents)
    assert data["method"]["electrons"] == 2
    assert data["method"]["spin_multiplicity"] == 1
    assert "FCI" in data["method"]["electronic_structure"]
    grid = data["visualization"]
    bounds = [(low, low + (count - 1) * step) for low, count, step in
              zip(grid["grid_origin_bohr"], grid["grid_shape"], grid["grid_step_bohr"])]
    samples = data["samples"]
    assert len(samples) == 25
    assert [s["r_angstrom"] for s in samples] == sorted(set(s["r_angstrom"] for s in samples))
    assert samples[data["default_index"]]["r_angstrom"] == .74
    assert data["minimum_index"] == min(range(len(samples)), key=lambda i: samples[i]["energy_total_hartree"])
    missing_electrons = 0.
    for sample in samples:
        centers = sample["nuclei_bohr"]
        r_bohr = sample["r_angstrom"] / data["bohr_to_angstrom"]
        close(centers[0][0], -r_bohr / 2)
        close(centers[1][0], r_bohr / 2)
        assert all(center[1:] == [0., 0.] for center in centers)
        close(sample["energy_nuclear_hartree"], 1 / r_bohr)
        close(sample["energy_total_hartree"], sample["energy_electronic_hartree"] + sample["energy_nuclear_hartree"])
        assert sample["energy_total_hartree"] <= sample["energy_rhf_total_hartree"] + 1e-10
        dm = sample["density_matrix_ao"]
        close(dm[0][1], dm[1][0])
        close(dm[0][0], dm[1][1])
        assert dm[0][0] > 0 and dm[1][1] > 0
        assert dm[0][0] * dm[1][1] - dm[0][1] ** 2 > -1e-12
        electron_count = box_count = 0.
        for i in range(2):
            for j in range(2):
                s = overlap(centers[i], centers[j], exponents, coefficients)
                close(s, sample["overlap_matrix_ao"][i][j])
                if i == j:
                    close(s, 1.)
                electron_count += dm[i][j] * s
                box_count += dm[i][j] * overlap(centers[i], centers[j], exponents, coefficients, bounds)
        close(electron_count, 2.)
        assert 1.999 < box_count <= 2. + 1e-10
        missing_electrons = max(missing_electrons, 2. - box_count)
        validation = sample["validation"]
        close(validation["electron_count_ao_trace"], 2.)
        close(validation["electron_count_mo_trace"], 2.)
        close(validation["spin_squared"], 0.)
        assert abs(validation["density_grid_integral"] - box_count) < .001
        assert validation["density_grid_min"] >= 0
        for key in ["fci_residual_hartree", "rdm_energy_error_hartree",
                    "full_diagonalization_error_hartree", "ao_export_max_error"]:
            assert validation[key] < 1e-10, (sample["r_angstrom"], key)
    if recompute:
        spec = importlib.util.spec_from_file_location("bo_h2", ROOT / "scripts/bo_h2.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        regenerated = module.calculate()
        for expected, actual in zip(samples, regenerated["samples"]):
            for field in ["energy_electronic_hartree", "energy_nuclear_hartree", "energy_total_hartree"]:
                close(expected[field], actual[field])
            for expected_row, actual_row in zip(expected["density_matrix_ao"], actual["density_matrix_ao"]):
                for expected_value, actual_value in zip(expected_row, actual_row):
                    close(expected_value, actual_value)
        print("PySCF: all 25 electronic energies and density matrices reproduced.")
    print(f"PASS: {len(samples)} FCI densities, Gaussian normalization, electron count, energy decomposition, finite-grid coverage.")
    print(f"Maximum electrons outside display box: {missing_electrons:.3g}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--recompute", action="store_true")
    main(parser.parse_args().recompute)
