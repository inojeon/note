"""docs/ 안의 링크를 상대 경로 ↔ claude.ai 게시 주소로 바꾼다.
  python tools/relink.py --to-relative   # 기본. 저장소/GitHub Pages용
  python tools/relink.py --to-published  # claude.ai 아티팩트로 다시 게시할 때
  python tools/relink.py --import FILE.html NAME.html  # claude.ai에서 받은 파일을 상대 링크로 바꿔 docs/에 넣기
"""
import json, os, sys
D = os.path.join(os.path.dirname(__file__), "..", "docs")
links = json.load(open(os.path.join(D, "links.json")))
pairs = [(name, v["published_artifact"]) for name, v in links.items()]
def convert(text, to_rel):
    for name, url in pairs:
        text = text.replace(url, name) if to_rel else text.replace(f'href="{name}"', f'href="{url}"')
    return text
if "--import" in sys.argv:
    i = sys.argv.index("--import"); src, name = sys.argv[i + 1], sys.argv[i + 2]
    open(os.path.join(D, name), "w").write(convert(open(src).read(), True)); print("imported", name); sys.exit()
to_rel = "--to-published" not in sys.argv
for name in links:
    p = os.path.join(D, name); s = open(p).read(); t = convert(s, to_rel)
    if t != s: open(p, "w").write(t); print("updated", name)
