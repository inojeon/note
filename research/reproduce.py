#!/usr/bin/env python3
"""Run a preserved calculation in a temporary copy; never rewrite published inputs."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
from importlib import metadata
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
LEGACY = ROOT / "references" / "sqd-docs"
RESULTS = ROOT / "research" / "results"
JOBS = {
    "intro_h2": ["intro_h2.json"],
    "p00_quickstart": ["00_quickstart.json"],
    "p01_pyscf_n2": ["01_pyscf.json"],
    "p02_jordan_wigner": ["02_jw.json"],
    "p03_ucj_inside": ["03_ucj.json"],
    "p04_circuit": ["04_circuit.json"],
    "p05_sampling": ["05_sampling.json"],
    "p06_sqd_guide": ["06_sqd.json"],
    "math_n2_krylov": ["math.json"],
    "basis_set_counts": ["basis_set_counts.json"],
    "basis_orbital_levels": ["basis_orbital_levels.json"],
    "hamiltonian_comparison": ["hamiltonian_comparison.json"],
    "bo_h2": ["bo_h2.json"],
    "vqe_h2": ["vqe_h2.json"],
}
PACKAGES = ["pyscf", "qiskit", "qiskit-addon-sqd", "ffsim", "qiskit-nature",
            "numpy", "scipy", "scikit-image"]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("job", nargs="?", choices=[*JOBS, "all"])
    parser.add_argument("--list", action="store_true", help="List jobs without importing science packages")
    parser.add_argument("--dry-run", action="store_true", help="Describe execution without running a calculation")
    parser.add_argument("--optimize", action="store_true", help="Enable the optional UCJ optimization")
    args = parser.parse_args()
    if args.list:
        for name, outputs in JOBS.items():
            print(f"{name}: {', '.join(outputs)}")
        print("intro_h2 additionally produces orb3d.json when scikit-image is available.")
        return 0
    if not args.job:
        parser.error("Choose a job or use --list.")
    if args.optimize and args.job not in ("p03_ucj_inside", "all"):
        parser.error("--optimize applies only to p03_ucj_inside or all.")
    jobs = list(JOBS) if args.job == "all" else [args.job]
    for job in jobs:
        if not (LEGACY / "scripts" / f"{job}.py").is_file():
            parser.error(f"Preserved source is missing: {job}.py")
    if args.dry_run:
        print(json.dumps({"jobs": jobs, "source": str(LEGACY), "output_parent": str(RESULTS),
                          "threads": 1, "optimize": args.optimize,
                          "source_writes": False}, ensure_ascii=False, indent=2))
        return 0

    versions = {}
    for package in PACKAGES:
        try:
            versions[package] = metadata.version(package)
        except metadata.PackageNotFoundError:
            versions[package] = None
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    destination = RESULTS / f"{stamp}-{args.job}"
    destination.mkdir(parents=True, exist_ok=False)
    env = dict(os.environ)
    for name in ("OMP_NUM_THREADS", "OPENBLAS_NUM_THREADS", "MKL_NUM_THREADS"):
        env[name] = "1"
    report = {"created_utc": stamp, "python": sys.version, "packages": versions,
              "threads": 1, "optimize": args.optimize, "runs": []}
    with tempfile.TemporaryDirectory(prefix="learning-note-research-") as workspace:
        scratch = Path(workspace)
        shutil.copytree(LEGACY / "scripts", scratch / "scripts")
        shutil.copytree(LEGACY / "data", scratch / "data")
        for job in jobs:
            script = scratch / "scripts" / f"{job}.py"
            before = {p.name: (p.stat().st_mtime_ns, sha(p)) for p in (scratch / "data").glob("*.json")}
            command = [sys.executable, str(script)]
            if job == "p03_ucj_inside" and args.optimize:
                command.append("--optimize")
            print(f"Running {job}; results: {destination}", flush=True)
            with (destination / f"{job}.log").open("w") as log:
                completed = subprocess.run(command, cwd=scratch / "scripts", env=env,
                                           stdout=log, stderr=subprocess.STDOUT, check=False)
            changed = [p for p in (scratch / "data").glob("*.json")
                       if before.get(p.name) != (p.stat().st_mtime_ns, sha(p))]
            missing = sorted(set(JOBS[job]) - {p.name for p in changed})
            run = {"job": job, "script_sha256": sha(LEGACY / "scripts" / f"{job}.py"),
                   "returncode": completed.returncode, "missing_outputs": missing, "outputs": []}
            for output in changed:
                # Capture only files written by this job; cached prerequisites stay in the scratch copy.
                json.loads(output.read_text())
                shutil.copyfile(output, destination / output.name)
                run["outputs"].append({"file": output.name, "sha256": sha(output)})
            report["runs"].append(run)
            (destination / "run.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
            if completed.returncode or missing:
                print(f"Calculation failed; inspect {destination / (job + '.log')}", file=sys.stderr)
                return completed.returncode or 1
    print(f"Finished. Review {destination}; publication sources were not changed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
