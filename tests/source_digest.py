"""Fingerprint the authoring inputs, excluding generated and local-only directories."""
import hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
digest = hashlib.sha256()
files = [root / 'hugo.toml', root / '.hugo-version']
for directory in ['content', 'site', 'references/sqd-docs']:
    files += [p for p in (root / directory).rglob('*') if p.is_file() and p.name != '.DS_Store' and '__pycache__' not in p.parts]
for path in sorted(files):
    digest.update(str(path.relative_to(root)).encode() + b'\0' + path.read_bytes() + b'\0')
print(digest.hexdigest())
