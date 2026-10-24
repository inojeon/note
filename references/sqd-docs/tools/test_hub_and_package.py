"""Unit tests for tools/build_hub.py and the packaging rules in tools/package_concept_site.py.

  python3 -m unittest discover -s tools -p 'test_*.py'
"""
import json
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

import build_hub
import package_concept_site as pkg

DOCS = build_hub.DOCS
CATALOG = json.loads((DOCS / 'assets/note-catalog.json').read_text())
TOTAL = len(CATALOG['notes']) + len(build_hub.MAIN_DOCS)


class HubData(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.lines = build_hub.lines()
        cls.catalog = json.loads((DOCS / 'assets/note-catalog.json').read_text())

    def test_routes_follow_the_catalog_then_main_documents(self):
        self.assertEqual([l['id'] for l in self.lines], list(self.catalog['maps']) + ['main-docs'])
        for line in self.lines[:-1]:
            self.assertEqual([i['id'] for i in line['items']], self.catalog['maps'][line['id']])
        self.assertEqual([i['id'] for i in self.lines[-1]['items']], [stem for stem, _ in build_hub.MAIN_DOCS])

    def test_titles_and_questions_come_from_their_owners(self):
        vector = self.lines[0]['items'][0]
        self.assertEqual(vector['title'], '벡터(Vector)')
        self.assertEqual(vector['question'], self.catalog['notes']['vector']['question'])
        guide = {i['id']: i for i in self.lines[-1]['items']}['06-sqd-guide']
        self.assertEqual((guide['title'], guide['question']), ('SQD 이해하기', 'Sample-based Quantum Diagonalization'))
        sampling = {i['id']: i for i in self.lines[-1]['items']}['05-sampling']
        self.assertEqual(sampling['question'], '양자 상태에서 bit_array까지')

    def test_page_ids_are_unique_and_stable_shaped(self):
        ids = [i['id'] for l in self.lines for i in l['items']]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(len(ids), TOTAL)
        self.assertTrue(all(build_hub.ID.match(i) for i in ids))

    def test_reader_slugs_cover_maps_notes_and_aliases(self):
        slugs = set(build_hub.reader_slugs())
        self.assertTrue({'home', 'learning-maps', 'relations', 'sqd-linear-algebra', 'vector', 'sqd'} <= slugs)
        self.assertNotIn('intro', slugs)


class HubPage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = build_hub.render()[0]

    def test_committed_hub_is_current(self):
        self.assertEqual((DOCS / 'index.html').read_text(), self.page, 'run python3 tools/build_hub.py')

    def test_every_page_is_listed_once_with_a_working_target(self):
        ids = re.findall(r'<li class="hub-station" data-id="([a-z0-9-]+)"', self.page)
        self.assertEqual(len(ids), TOTAL)
        for href in re.findall(r'<a class="hub-title" href="([^"]+)"', self.page):
            name, _, slug = href.partition('#')
            self.assertTrue((DOCS / name).exists(), href)
            if slug:
                self.assertTrue((DOCS / f'concept-{slug}.html').exists(), href)

    def test_ids_are_unique_and_no_empty_figure_ids(self):
        ids = re.findall(r'\sid="([^"]+)"', self.page)
        self.assertEqual(len(ids), len(set(ids)))
        self.assertFalse([i for i in ids if i.endswith('-fig')])

    def test_no_external_requests(self):
        self.assertNotRegex(self.page, r'(src|href)="(https?:)?//')


class MainDocumentList(unittest.TestCase):
    def test_unlisted_or_missing_main_documents_fail_the_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            docs = Path(tmp)
            for name in [f'{s}.html' for s, _ in build_hub.MAIN_DOCS] + [build_hub.MAIN_INDEX, 'concept-x.html']:
                (docs / name).write_text('<h1>x</h1>')
            original = build_hub.DOCS
            build_hub.DOCS = docs
            try:
                build_hub.check_documents()
                (docs / '07-new.html').write_text('<h1>new</h1>')
                with self.assertRaises(SystemExit) as raised:
                    build_hub.check_documents()
                self.assertIn('07-new.html', str(raised.exception))
                (docs / '07-new.html').unlink()
                (docs / 'intro.html').unlink()
                with self.assertRaises(SystemExit) as raised:
                    build_hub.check_documents()
                self.assertIn('intro.html', str(raised.exception))
            finally:
                build_hub.DOCS = original


class PackagingRules(unittest.TestCase):
    def test_dependencies(self):
        font = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400&display=swap'
        sheet, pre = {'rel': 'stylesheet'}, {'rel': 'preconnect'}
        three = {'integrity': pkg.THREE_SRI}
        errors = pkg.dependency_errors
        self.assertEqual(errors('00-quickstart.html', [('link', font, sheet), ('link', 'https://fonts.gstatic.com', pre),
                                                         ('img', 'data:image/png;base64,AA', {}), ('style', '#grad', {})]), [])
        self.assertEqual(errors('intro.html', [('script', pkg.THREE_URL, three)]), [])
        self.assertTrue(errors('intro.html', [('script', pkg.THREE_URL, {})]), 'three.js without its integrity hash')
        self.assertTrue(errors('01-pyscf.html', [('script', pkg.THREE_URL, three)]), 'three.js outside the three documents')
        self.assertTrue(errors('math.html', [('script', 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', {})]))
        self.assertTrue(errors('learning-maps.html', [('link', font, sheet)]), 'readers load nothing')
        self.assertTrue(errors('index.html', [('script', 'assets/hub.js', {})]), 'the hub loads nothing')
        # Host-only matching could be fooled; exact URLs cannot.
        self.assertTrue(errors('00-quickstart.html', [('link', 'https://evil.example\\@fonts.googleapis.com/css2?x', sheet)]))
        self.assertTrue(errors('00-quickstart.html', [('link', 'https://user@fonts.googleapis.com/css2?x', sheet)]))
        self.assertTrue(errors('00-quickstart.html', [('link', 'http://fonts.googleapis.com/css2?x', sheet)]))
        self.assertTrue(errors('00-quickstart.html', [('script', 'https://fonts.googleapis.com/css2?x', {})]))

    def test_scanner_sees_every_loader(self):
        page = pkg.parse('<img srcset="https://a.example/1.png 1x, https://b.example/2.png 2x">'
                         '<video poster="https://c.example/p.png"></video><object data="https://d.example/o"></object>'
                         '<embed src="https://e.example/e"><style>@import "https://f.example/s.css"; '
                         'p{background:url(https://g.example/i.png)}</style><p style="background:url(\'https://h.example/x\')">')
        hosts = sorted(url.split('/')[2] for _, url, _ in page.dependencies)
        self.assertEqual(hosts, [f'{c}.example' for c in 'abcdefgh'])

    def test_links(self):
        reader = pkg.parse('<section data-page="vector"></section>')
        files = {'learning-maps.html': reader, 'index.html': pkg.parse(''), 'intro.html': pkg.parse('<h2 id="a"></h2>')}
        ok = pkg.link_errors
        self.assertEqual(ok('learning-maps.html', ['#vector', '#reader-content', 'index.html'], files, {'vector'}, set()), [])
        self.assertTrue(ok('learning-maps.html', ['#nope'], files, {'vector'}, set()))
        self.assertTrue(ok('learning-maps.html', ['concept-vector.html'], files, {'vector'}, set()))
        self.assertEqual(ok('index.html', ['learning-maps.html#vector', 'intro.html', 'https://example.org/'], files, set(), set()), [])
        self.assertTrue(ok('index.html', ['learning-maps.html#nope'], files, set(), set()))
        self.assertTrue(ok('intro.html', ['concept-eigen.html'], files, set(), {'a'}))
        self.assertTrue(ok('intro.html', ['#missing'], files, set(), {'a'}))
        self.assertEqual(ok('intro.html', ['#a', 'mailto:x@example.org'], files, set(), {'a'}), [])

    def test_real_site_packages_cleanly_and_readers_link_back_once(self):
        bodies = pkg.collect()
        self.assertEqual(pkg.validate(bodies), [])
        for name in build_hub.READERS:
            self.assertEqual(bodies[name].count(pkg.HUB_LINK), 1, name)
            self.assertNotIn(pkg.HUB_LINK, (DOCS / name).read_text())
        self.assertEqual(set(bodies), build_hub.READERS | {'index.html', build_hub.MAIN_INDEX} | {f'{s}.html' for s, _ in build_hub.MAIN_DOCS})


class CheckAllRunner(unittest.TestCase):
    """check_all.sh must fail when any check fails (a `cmd && echo OK` line once hid failures)."""

    def run_with(self, failing):
        with tempfile.TemporaryDirectory() as tmp:
            tools = Path(tmp) / 'tools'
            tools.mkdir()
            shutil.copy(Path(__file__).with_name('check_all.sh'), tools)
            (tools / 'test_ok.py').write_text('import unittest\nclass T(unittest.TestCase):\n    def test_ok(self): pass\n')
            for name in ['build_hub.py', 'check_note_structure.py', 'check_bo_h2_data.py', 'check_vqe_h2_data.py',
                         'check_html.js', 'test_progress.cjs']:
                (tools / name).write_text('')
            name, body = failing
            (tools / name).write_text(body)
            return subprocess.run(['bash', str(tools / 'check_all.sh'), '--no-browser'], capture_output=True, text=True)

    def test_every_quick_check_can_fail_the_run(self):
        for failing in [('check_note_structure.py', 'raise SystemExit(1)\n'),
                        ('build_hub.py', 'raise SystemExit(1)\n'),
                        ('check_html.js', 'console.log("FAIL x.html"); process.exit(1);\n'),
                        ('test_progress.cjs', 'process.exit(1);\n')]:
            with self.subTest(failing=failing[0]):
                run = self.run_with(failing)
                self.assertNotEqual(run.returncode, 0, run.stdout)
                self.assertNotIn('ALL CHECKS PASSED', run.stdout)


class BornOppenheimerLab(unittest.TestCase):
    def test_lab_runtime_is_inside_its_region_once(self):
        source = (DOCS / 'concept-born-oppenheimer.html').read_text()
        runtime = "node=get('boh2-data'),lab=get('boh2-lab')"
        self.assertEqual(source.count(runtime), 1)
        self.assertLess(source.index('<!-- BO_H2_LAB_START -->'), source.index(runtime))
        self.assertLess(source.index(runtime), source.index('<!-- BO_H2_LAB_END -->'))


if __name__ == '__main__':
    unittest.main()
