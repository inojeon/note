#!/usr/bin/env bash
# Rebuild every generated page in docs/ in dependency order: the data and lab embedding
# tools, the shared note chrome, the glossary, the readers, then the hub.
# CI runs this and then requires the committed files to match (git diff --exit-code).
set -euo pipefail
cd "$(dirname "$0")/.."
for tool in build_bo_molecule build_vqe_hydrogen build_basis_orbitals build_h2_hamiltonian \
            remodel_notes enrich_concepts build_concepts build_hub; do
  printf '%-22s ' "$tool"
  python3 "tools/$tool.py" | tail -n 1 | cut -c1-100
done
