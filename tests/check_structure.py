#!/usr/bin/env python3
"""Validate authored bundles, migration coverage, and a generated site using Python's stdlib.

Usage: python3 tests/check_structure.py --site public --base-path /note/
Hugo performs Markdown/frontmatter and JavaScript compilation. This check verifies
published references, including inert <template> contents; browser tests cover runtime behavior.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[1]
MAIN_NOTES = ["background-atoms", "intro", "prep-math", "math", "00-quickstart",
              "01-pyscf", "02-jordan-wigner", "03-ucj-inside", "04-circuit",
              "05-sampling", "06-sqd-guide"]
ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SHORTCODE = re.compile(r'{{<\s*experiment\b[^>]*\bid\s*=\s*[\"\']([^\"\']+)[\"\'][^>]*>}}')
CSS_URL = re.compile(r"url\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^\s)]*))\s*\)", re.I)
CSS_IMPORT = re.compile(r"@import\s+['\"]([^'\"]+)['\"]", re.I)
REMOTE_JS = re.compile(
    r"(?:\b(?:import|fetch|loadScript|importScripts)\s*\(\s*|\bnew\s+(?:Worker|SharedWorker)\s*\(\s*|"
    r"\bfrom\s+|\bimport\s+|\.src\s*=\s*)['\"]\s*(?:https?:)?//", re.I)
LINK_ATTRIBUTES = {"href", "src", "poster", "xlink:href", "data-src", "data-module", "data-search"}
FORBIDDEN_VIEW_TAGS = {"html", "head", "body", "script", "style", "base"}


class Document(HTMLParser):
    """Keep references inside template tags as well as rendered content."""
    def __init__(self, text: str):
        super().__init__(convert_charrefs=True)
        self.ids: Counter[str] = Counter()
        self.headings: set[str] = set()
        self.references: list[tuple[str, str, str, bool, int]] = []
        self.view_errors: list[str] = []
        self.styles: list[str] = []
        self.inline_scripts: list[str] = []
        self.in_style = False
        self.in_script = False
        self.feed(text)
        self.close()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        line = self.getpos()[0]
        if tag in FORBIDDEN_VIEW_TAGS:
            self.view_errors.append(f"line {line}: forbidden <{tag}>")
        if "id" in attributes:
            self.ids[attributes["id"]] += 1
            if tag in {"h2", "h3"}:
                self.headings.add(attributes["id"])
        if tag == "a" and attributes.get("name"):
            self.ids[attributes["name"]] += 1
        for name, value in attrs:
            if name.lower().startswith("on"):
                self.view_errors.append(f"line {line}: inline event {name}")
            if value is None:
                continue
            if name in LINK_ATTRIBUTES:
                is_asset = name != "href" or tag not in {"a", "area"}
                if tag == "link" and attributes.get("rel", "").lower() in {"canonical", "alternate"}:
                    is_asset = False
                self.references.append((tag, name, value, is_asset, line))
            if name == "style":
                self.styles.append(value)
            if name == "srcset" and not value.lstrip().startswith("data:"):
                for candidate in value.split(","):
                    pieces = candidate.strip().split()
                    if pieces:
                        self.references.append((tag, name, pieces[0], True, line))
        self.in_style = tag == "style" or self.in_style
        self.in_script = tag == "script" or self.in_script

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False
        if tag == "script":
            self.in_script = False

    def handle_data(self, data):
        if self.in_style:
            self.styles.append(data)
        if self.in_script:
            self.inline_scripts.append(data)


def css_references(text: str):
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    for match in CSS_URL.finditer(text):
        yield next(value for value in match.groups() if value is not None)
    yield from CSS_IMPORT.findall(text)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Checker:
    def __init__(self, site: Path, base_path: str):
        self.site = site.resolve()
        self.base = base_path
        self.errors: list[str] = []
        self.documents: dict[Path, Document] = {}
        self.checked_references = 0

    def fail(self, message):
        self.errors.append(message)

    def read_json(self, path: Path):
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as error:
            self.fail(f"{path}: {error}")
            return {}

    def document(self, path: Path) -> Document:
        if path not in self.documents:
            try:
                self.documents[path] = Document(path.read_text(encoding="utf-8"))
            except (OSError, UnicodeError) as error:
                self.fail(f"{path}: {error}")
                self.documents[path] = Document("")
        return self.documents[path]

    def reference(self, source: Path, value: str, *, asset=False, context="", check_anchor=True):
        self.checked_references += 1
        source = source.resolve()
        if not source.is_relative_to(self.site):
            self.fail(f"Reference source is outside generated site: {source}")
            return
        value = value.strip()
        parsed = urlsplit(value)
        label = f"{source.relative_to(self.site)} {context} → {value!r}"
        if parsed.scheme in {"mailto", "tel", "data", "blob"}:
            return
        if parsed.scheme == "javascript":
            self.fail(f"Executable URL: {label}")
            return
        if parsed.scheme or parsed.netloc:
            if asset:
                self.fail(f"External runtime asset (must be local): {label}")
            return
        base_url = "https://local.invalid" + self.base + source.relative_to(self.site).as_posix()
        resolved = urlsplit(urljoin(base_url, value))
        decoded_path = unquote(resolved.path)
        if not decoded_path.startswith(self.base):
            self.fail(f"Escapes deployment base {self.base}: {label}")
            return
        target = (self.site / decoded_path[len(self.base):]).resolve()
        if not target.is_relative_to(self.site):
            self.fail(f"Escapes generated site: {label}")
            return
        if target.is_dir():
            target = target / "index.html"
        elif not target.exists() and not target.suffix:
            target = target / "index.html"
        if not target.is_file():
            self.fail(f"Missing local target: {label}")
            return
        fragment = unquote(resolved.fragment)
        # Text-fragment directives have no HTML id; an id prefix may still be present.
        fragment = fragment.split(":~:text=", 1)[0]
        if check_anchor and fragment and target.suffix.lower() in {".html", ".svg"}:
            if fragment not in self.document(target).ids:
                self.fail(f"Missing anchor #{fragment}: {label}")

    def generated_site(self):
        html_files = list(self.site.rglob("*.html"))
        if not html_files:
            self.fail(f"No generated HTML found in {self.site}")
        for path in html_files:
            document = self.document(path)
            for tag, attribute, value, asset, line in document.references:
                self.reference(path, value, asset=asset, context=f"line {line} <{tag}> {attribute}")
            for style in document.styles:
                for value in css_references(style):
                    self.reference(path, value, asset=True, context="inline CSS")
            for script in document.inline_scripts:
                if REMOTE_JS.search(script):
                    self.fail(f"External JavaScript dependency in {path.relative_to(self.site)}")
        for path in self.site.rglob("*.css"):
            for value in css_references(path.read_text(encoding="utf-8")):
                # A CSS-only fragment is resolved against the element's HTML/SVG, not the CSS file.
                if value.startswith("#"):
                    continue
                self.reference(path, value, asset=True, context="CSS url", check_anchor=False)
        for path in self.site.rglob("*.js"):
            if "vendor" not in path.relative_to(self.site).parts and REMOTE_JS.search(path.read_text(encoding="utf-8")):
                self.fail(f"External JavaScript runtime import/fetch in {path.relative_to(self.site)}")

    def authored_bundles(self):
        used: set[str] = set()
        experiment_ids = {path.name for path in (ROOT / "content/experiments").iterdir() if path.is_dir()}
        for section in ("notes", "paths", "experiments"):
            for bundle in sorted((ROOT / "content" / section).iterdir()):
                if not bundle.is_dir():
                    continue
                if not ID_PATTERN.fullmatch(bundle.name):
                    self.fail(f"Invalid stable bundle ID: {bundle.relative_to(ROOT)}")
                index = bundle / "index.md"
                if not index.is_file():
                    self.fail(f"Missing bundle index: {index.relative_to(ROOT)}")
                    continue
                text = index.read_text(encoding="utf-8")
                parts = text.split("---", 2)
                if len(parts) != 3 or parts[0].strip() or not parts[2].strip():
                    self.fail(f"Missing frontmatter or body: {index.relative_to(ROOT)}")
                elif not all(re.search(rf'(?m)^\s*(?:"{key}"|{key})\s*:\s*\S', parts[1]) for key in ("title", "summary")):
                    self.fail(f"Missing title/summary: {index.relative_to(ROOT)}")
                if section == "notes":
                    used.update(SHORTCODE.findall(text))
                if section != "experiments":
                    continue
                for required in ("view.html", "main.js"):
                    if not (bundle / required).is_file():
                        self.fail(f"Missing experiment {required}: {bundle.name}")
                view = bundle / "view.html"
                if view.is_file():
                    raw = view.read_text(encoding="utf-8")
                    parsed = Document(raw)
                    if not raw.strip():
                        self.fail(f"Empty experiment view: {bundle.name}")
                    for error in parsed.view_errors:
                        self.fail(f"{view.relative_to(ROOT)}: {error}")
                    for identifier, count in parsed.ids.items():
                        if count > 1:
                            self.fail(f"{view.relative_to(ROOT)}: duplicate id {identifier!r}")
                    if re.search(r"{{-?\s*(?:[.$]|[a-zA-Z_]\w*(?:\s|}}))", raw):
                        self.fail(f"Executable template syntax in experiment view: {bundle.name}")
                module = bundle / "main.js"
                if module.is_file():
                    source = module.read_text(encoding="utf-8")
                    if not re.search(r"\bexport\s+(?:async\s+)?function\s+mount\s*\(", source):
                        self.fail(f"Missing exported mount(root, context): {bundle.name}")
                    if REMOTE_JS.search(source):
                        self.fail(f"External runtime dependency: {module.relative_to(ROOT)}")
        for missing in sorted(used - experiment_ids):
            self.fail(f"Note references absent experiment: {missing}")
        for unused in sorted(experiment_ids - used):
            self.fail(f"Experiment has no note reference: {unused}")

    def published_inventory(self):
        manifest = self.read_json(self.site / "manifest.json")
        for section in ("notes", "paths", "experiments"):
            bundles = {p.parent.name for p in (ROOT / "content" / section).glob("*/index.md")}
            records = manifest.get(section, [])
            counts = Counter(record.get("id") for record in records)
            if set(counts) != bundles or any(count != 1 for count in counts.values()):
                self.fail(f"Published {section} inventory does not match stable bundle IDs")
            for record in records:
                expected = self.base + section + "/" + str(record.get("id")) + "/"
                if record.get("url") != expected:
                    self.fail(f"Bundle URL must follow its folder ID: {record.get('url')} != {expected}")
                self.reference(self.site / "index.html", record.get("url", ""), context=f"{section} manifest")
        note_ids = {record.get("id") for record in manifest.get("notes", [])}
        paths = {record.get("id"): record for record in manifest.get("paths", [])}
        parents: dict[str, str] = {}
        for identifier, record in paths.items():
            if ("steps" in record) == ("paths" in record):
                self.fail(f"Learning path requires exactly one of steps or paths: {identifier}")
                continue
            key = "paths" if "paths" in record else "steps"
            items = record[key]
            if not isinstance(items, list) or not items or not all(isinstance(item, str) for item in items):
                self.fail(f"Learning path requires a nonempty ordered ID list: {identifier}.{key}")
                continue
            if len(items) != len(set(items)):
                self.fail(f"Learning path contains duplicate IDs: {identifier}.{key}")
            if key == "steps":
                for step in items:
                    if step not in note_ids:
                        self.fail(f"Learning path {identifier} refers to missing note {step}")
            else:
                for child in items:
                    if child not in paths:
                        self.fail(f"Learning path group {identifier} refers to missing path {child}")
                    elif "paths" in paths[child]:
                        self.fail(f"Learning path groups cannot contain another group: {identifier} → {child}")
                    if child in parents and parents[child] != identifier:
                        self.fail(f"Learning path belongs to multiple groups: {child}")
                    parents[child] = identifier

    def migration(self):
        migration = self.read_json(ROOT / "site/data/migration.json")
        catalog = self.read_json(ROOT / "references/sqd-docs/docs/assets/note-catalog.json")
        legacy = ROOT / "references/sqd-docs/docs"
        old_files = {path.name for path in legacy.glob("*.html")}
        route_map = migration.get("files", {})
        expected_ids = set(catalog.get("notes", {})) | set(MAIN_NOTES)
        if len(expected_ids) != 74 or len(old_files) != 86:
            self.fail(f"Legacy inventory changed unexpectedly: {len(expected_ids)} learning sources, {len(old_files)} routes")
        if set(route_map) != old_files:
            self.fail(f"Legacy route coverage mismatch: missing={sorted(old_files-set(route_map))}, extra={sorted(set(route_map)-old_files)}")
        for slug in expected_ids:
            if not (ROOT / "content/notes" / slug / "index.md").is_file():
                self.fail(f"Missing rewritten learning source: {slug}")
        rows = migration.get("documents", [])
        by_source = {row["source"]: row for row in rows}
        if len(rows) != len(by_source) or set(by_source) != {str((legacy / name).relative_to(ROOT)) for name in old_files}:
            self.fail("Migration documents must identify each legacy document once")
        rewritten = [row for row in rows if row.get("status") == "rewritten"]
        expected_targets = {f"content/notes/{slug}/index.md" for slug in expected_ids}
        if {row.get("target") for row in rewritten} != expected_targets:
            self.fail("Migration rewritten-source coverage must cover all 74 learning topics")
        for row in rewritten:
            if not (ROOT / row["target"]).is_file():
                self.fail(f"Missing migration source target: {row['target']}")
        for source, target in route_map.items():
            if not (self.site / source).is_file():
                self.fail(f"Missing published legacy route: {source}")
            self.reference(self.site / "index.html", self.base + target, context=f"migration {source}")
        expected_anchors = set()
        for slug in MAIN_NOTES:
            parsed = Document((legacy / (slug + ".html")).read_text(encoding="utf-8"))
            expected_anchors.update(f"{slug}.html#{identifier}" for identifier in parsed.headings)
        anchors = migration.get("anchors", {})
        if not expected_anchors.issubset(anchors):
            self.fail(f"Missing legacy heading mappings: {sorted(expected_anchors-set(anchors))}")
        for old, target in anchors.items():
            self.reference(self.site / "index.html", self.base + target, context=f"legacy anchor {old}")
        for slug, target in migration.get("slugs", {}).items():
            self.reference(self.site / "index.html", self.base + target, context=f"reader selection {slug}")
        published = self.read_json(self.site / "legacy-routes.json")
        for key in ("slugs", "anchors"):
            if published.get(key) != migration.get(key):
                self.fail(f"Published legacy-routes.json differs from migration {key}")
        datasets = migration.get("datasets", [])
        originals = {str(path.relative_to(ROOT)) for path in (ROOT / "references/sqd-docs/data").glob("*.json")}
        if len(originals) != 15 or len(datasets) != 15 or {row["source"] for row in datasets} != originals:
            self.fail("Migration dataset coverage must include the 15 preserved calculation files")
        for row in datasets:
            self.verify_hash(row["source"], row["sha256"], "migration dataset")
        provenance = self.read_json(ROOT / "research/provenance.json").get("data", [])
        if len(provenance) != 15 or {row["source"] for row in provenance} != originals:
            self.fail("Research provenance must cover all 15 calculation datasets once")
        for row in provenance:
            self.verify_hash(row["source"], row["sha256"], "research dataset")
            self.verify_hash(row["generator"], row["generator_sha256"], "research generator")

    def verify_hash(self, relative: str, expected: str, kind: str):
        path = (ROOT / relative).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            self.fail(f"Missing {kind}: {relative}")
        elif sha256(path) != expected:
            self.fail(f"SHA-256 mismatch for {kind}: {relative}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site", type=Path, required=True, help="Generated Hugo output directory")
    parser.add_argument("--base-path", required=True, help="Deployment path, e.g. / or /note/")
    args = parser.parse_args()
    if not args.base_path.startswith("/") or not args.base_path.endswith("/") or ".." in args.base_path or "//" in args.base_path:
        parser.error("--base-path must be a normalized absolute directory path, such as / or /note/")
    if not args.site.is_dir():
        parser.error(f"Generated site does not exist: {args.site}")
    checker = Checker(args.site, args.base_path)
    checker.authored_bundles()
    checker.published_inventory()
    checker.migration()
    checker.generated_site()
    if checker.errors:
        unique = list(dict.fromkeys(checker.errors))
        for error in unique[:100]:
            print(f"ERROR: {error}", file=sys.stderr)
        if len(unique) > 100:
            print(f"... {len(unique)-100} additional errors", file=sys.stderr)
        print(f"FAIL: {len(unique)} structural errors", file=sys.stderr)
        return 1
    print(f"PASS: {len(checker.documents)} HTML/SVG documents, {checker.checked_references} references; "
          "74 learning sources, 86 legacy routes, 15 preserved datasets; all experiments are used.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
